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
        Schema::create('session_materiel', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('materiel_id');
            $table->unsignedBigInteger('session_id');
            $table->integer('quantity')->default(0);
            $table->date('startDate');
            $table->date('endDate');
            $table->foreign('materiel_id')->references('id')->on('materiaux')->onDelete('cascade');
            $table->foreign('session_id')->references('id')->on('sessions')->onDelete('cascade');
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
        Schema::dropIfExists('session_materiel');
    }
};
