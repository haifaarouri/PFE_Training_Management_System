<?php

namespace App\Http\Controllers;

use App\Models\VariableTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class VariableTemplateController extends Controller
{
    public $list_roles = [];

    public function __construct()
    {
        $this->list_roles = collect(["Admin", "SuperAdmin", "Sales", "ChargéFormation", "AssistanceAcceuil", "PiloteDuProcessus", "CommunityManager", "ServiceFinancier"]);
    }

    public function index()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {

            $variableTemplates = VariableTemplate::all();
            return response()->json($variableTemplates);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function getSourceTables()
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $tables = DB::select("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?", [env('DB_DATABASE')]);

            $tableNames = [];
            foreach ($tables as $table) {
                array_push($tableNames, $table->TABLE_NAME);
            }
            return response()->json($tableNames);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function getSourceColonnes($tableName)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $columns = DB::select("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?", [env('DB_DATABASE'), $tableName]);

            $colonnes = [];
            foreach ($columns as $column) {
                array_push($colonnes, $column->COLUMN_NAME);
            }
            return response()->json($colonnes);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function store(Request $request)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            try {

                $validator = Validator::make($request->all(), [
                    'variable_name' => 'required|string|max:255',
                    'description' => 'required|string|max:255',
                    'source_model' => 'required|string|max:255',
                    'source_field' => 'required|string|max:255',
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $variableTemplate = VariableTemplate::create([
                    'variable_name' => $request->input('variable_name'),
                    'description' => $request->input('description'),
                    'source_model' => $request->input('source_model'),
                    'source_field' => $request->input('source_field'),
                ]);

                return response()->json($variableTemplate, 201);
            } catch (\Exception $e) {
                \Log::error('Error : ' . $e->getMessage());
                return response()->json(['error' => 'Erreur lors de l\'ajout du VariableTemplate !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function show($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $variableTemplate = VariableTemplate::find($id);
            if (!$variableTemplate) {
                return response()->json(['error' => 'VariableTemplate avec cette ID non trouvé !'], 404);
            }
            return response()->json($variableTemplate);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function update(Request $request, $id)
    {

        if ($this->list_roles->contains(auth()->user()->role)) {
            try {
                $variableTemplate = VariableTemplate::find($id);
                if (!$variableTemplate) {
                    return response()->json(['error' => 'VariableTemplate avec cette ID non trouvé !'], 404);
                }

                $validator = Validator::make($request->all(), [
                    'variable_name' => 'required|string|max:255',
                    'description' => 'required|string|max:255',
                    'source_model' => 'required|string|max:255',
                    'source_field' => 'required|string|max:255',
                ]);

                if ($validator->fails()) {
                    return response()->json(['error' => $validator->errors()], 400);
                }

                $variableTemplate->variable_name = $request->input('variable_name');
                $variableTemplate->description = $request->input('description');
                $variableTemplate->source_model = $request->input('source_model');
                $variableTemplate->source_field = $request->input('source_field');
                $variableTemplate->save();

                return response()->json($variableTemplate, 200);
            } catch (\Exception $e) {
                \Log::error('Error : ' . $e->getMessage());
                return response()->json(['error' => 'Erreur lors de la mise à jour du VariableTemplate !'], 500);
            }
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }

    public function destroy($id)
    {
        if ($this->list_roles->contains(auth()->user()->role)) {
            $variableTemplate = VariableTemplate::find($id);
            if (!$variableTemplate) {
                return response()->json(['error' => 'VariableTemplate avec cette ID non trouvé !'], 404);
            }

            $variableTemplate->delete();
            return response()->json(['message' => 'VariableTemplate supprimée avec succès !']);
        } else {
            // User does not have access, return a 403 response
            return response()->json(['error' => "Vous n'avez pas d'accès à cette route !"], 403);
        }
    }
}
