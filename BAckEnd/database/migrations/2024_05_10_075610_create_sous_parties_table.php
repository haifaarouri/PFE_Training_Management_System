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
        Schema::create('sous_parties', function (Blueprint $table) {
            $table->id();
            $table->string('description');
            $table->unsignedBigInteger('jour_formation_id')->nullable();
            $table->foreign('jour_formation_id')->references('id')->on('jour_formations')->onDelete('cascade')->onUpdate('cascade');
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
        Schema::dropIfExists('sous_parties');
    }
};
