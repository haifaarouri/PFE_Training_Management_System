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
        Schema::create('document_template_variable', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_template_id')->constrained('document_templates');
            $table->foreignId('variable_template_id')->constrained('variable_templates');
            $table->timestamps();
            $table->unique(['document_template_id', 'variable_template_id'], 'document_variable_unique');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('document_template_variable');
    }
};
