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
        Schema::create('jour_formations', function (Blueprint $table) {
            $table->id();
            $table->string('dayName');
            $table->unsignedBigInteger('programme_formation_id')->nullable();
            $table->foreign('programme_formation_id')->references('id')->on('programme_formations')->onDelete('cascade')->onUpdate('cascade');
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
        Schema::dropIfExists('jour_formations');
    }
};
