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
        Schema::create('variable_templates', function (Blueprint $table) {
            $table->id();
            $table->string('variable_name');
            $table->string('description');
            $table->string('source_model');
            $table->string('source_field');
            $table->string('key_field')->default('id');
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
        Schema::dropIfExists('variable_templates');
    }
};
