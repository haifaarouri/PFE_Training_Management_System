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
        Schema::create('sessions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->dateTime('startDate');
            $table->dateTime('endDate');
            $table->integer('duration');
            $table->string('sessionMode');
            $table->string('reference');
            $table->string('location');
            $table->string('status');
            $table->dateTime('registration_start');
            $table->dateTime('registration_end');
            $table->integer('max_participants');
            $table->integer('min_participants');
            $table->unsignedBigInteger('formation_id');
            $table->foreign('formation_id')->references('id')->on('formations')->onDelete('cascade')->onUpdate('cascade');
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
        Schema::dropIfExists('sessions');
    }
};
