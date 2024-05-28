<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('jour_sessions', function (Blueprint $table) {
            $table->id();
            $table->date('day');
            $table->time('startTime');
            $table->time('endTime');
            $table->foreignId('session_id')->constrained()->onDelete('cascade');
            $table->foreignId('salle_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('formateur_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('jour_sessions');
    }
};
