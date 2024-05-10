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
        Schema::create('formations', function (Blueprint $table) {
            $table->id();
            $table->string('reference');
            $table->string('entitled');
            $table->string('description');
            $table->integer('numberOfDays');
            $table->string('personnesCible');
            $table->double('price');
            $table->string('requirements');
            $table->string('certificationOrganization');
            $table->string('courseMaterial');
            $table->unsignedBigInteger('sous_categorie_id')->nullable();
            $table->foreign('sous_categorie_id')->references('id')->on('sous_categories')->onDelete('cascade')->onUpdate('cascade');

            $table->unsignedBigInteger('partenaire_id')->nullable();
            $table->foreign('partenaire_id')->references('id')->on('partenaires')->onDelete('cascade')->onUpdate('cascade');
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
        Schema::dropIfExists('formations');
    }
};
