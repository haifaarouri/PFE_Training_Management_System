<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('participant_session', function (Blueprint $table) {
            $table->id();
            $table->string('participationStatus');
            $table->foreignId('participant_id')->constrained('participants');
            $table->foreignId('session_id')->constrained('sessions');
            $table->timestamps();
            $table->unique(['participant_id', 'session_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('participant_session');
    }
};
