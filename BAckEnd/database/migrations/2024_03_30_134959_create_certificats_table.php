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
        Schema::create('certificats', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('organisme');
            $table->date('obtainedDate');
            $table->string('idCertificat')->nullable();
            $table->string('urlCertificat')->nullable();
            $table->foreignId('formateur_id')->constrained()->onDelete('cascade');
            // $table->foreignId('formateur_id')->constrained();
            // $table->unsignedBigInteger('formateur_id');
            // $table->foreign('formateur_id')->references('id')->on('formateurs')->onDelete('cascade');
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
        Schema::dropIfExists('certificats');
    }
};
