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
        Schema::create('candidat_formation', function (Blueprint $table) {
            $table->id();
            $table->date('registerDate');
            $table->string('registerStatus');
            $table->string('motivation');
            $table->string('paymentMethod');
            $table->foreignId('candidat_id')->constrained('candidats');
            $table->foreignId('formation_id')->constrained('formations');
            $table->timestamps();
            $table->unique(['candidat_id', 'formation_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('candidat_formation');
    }
};
