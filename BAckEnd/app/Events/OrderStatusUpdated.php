<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel; // PrivateChannel for 2 users
use Illuminate\Broadcasting\Channel; // for all users
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated implements ShouldBroadcast // ShouldBroadcast to allow boardcast outside of laravel app using Pusher broadcasting provider
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;
    // public $userId;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($order)
    {
        $this->order = $order;
        // $this->userId = $userId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    // public function broadcastOn()
    // {
    //     return new PrivateChannel('orders.' . $this->order->id);
    // }

    public function broadcastWith()
    {
        return ['order' => $this->order];
    }

    public function broadcastOn()
    {
        return new PrivateChannel('statusChannel.1');
        // .$this->userId);
    }

    // public function broadcastAs()
    // {
    //     return 'updateOrderStatus';
    // }
}
