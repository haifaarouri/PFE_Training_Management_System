<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }
    public function index(Request $request)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $query = Auth::user()->tasks();

        if ($request->has('filter')) {
            switch ($request->filter) {
                case 'completed':
                    $query->where('completed', true);
                    break;
                case 'active':
                    $query->where('completed', false);
                    break;
                case 'has-due-date':
                    $query->whereNotNull('due_date');
                    break;
            }
        }

        if ($request->has('sort') && $request->has('order')) {
            $sortField = $request->sort === 'due-date' ? 'due_date' : 'created_at';
            $sortOrder = $request->order === 'asc' ? 'asc' : 'desc';
            $query->orderBy($sortField, $sortOrder);
        }

        $tasks = $query->get();
        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'session_id' => 'nullable|exists:sessions,id',
        ]);

        $task = Auth::user()->tasks()->create($request->all());
        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $this->authorize('update', $task);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|nullable|string',
            'due_date' => 'required|nullable|date',
            'completed' => 'required',
            'session_id' => 'required|exists:sessions,id',
        ]);

        $taskData = $request->all();
        $taskData['completed'] = filter_var($request->completed, FILTER_VALIDATE_BOOLEAN);
        $task->update($taskData);

        return response()->json($task);
    }

    public function destroy(Task $task)
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $this->authorize('delete', $task);

        $task->delete();
        return response()->json(null, 204);
    }

    public function assignDefaultTasks()
    {
        if (!$this->list_roles->contains(auth()->user()->role)) {
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }

        $defaultTasks = [];

        switch (auth()->user()->role) {
            case 'Admin':
                $defaultTasks = [
                    ['title' => 'Admin Task 1', 'description' => 'Description for Admin Task 1'],
                    ['title' => 'Admin Task 2', 'description' => 'Description for Admin Task 2'],
                ];
                break;
            case 'User':
                $defaultTasks = [
                    ['title' => 'User Task 1', 'description' => 'Description for User Task 1'],
                    ['title' => 'User Task 2', 'description' => 'Description for User Task 2'],
                ];
                break;
        }

        foreach ($defaultTasks as $task) {
            auth()->user()->tasks()->create($task);
        }
    }
}
