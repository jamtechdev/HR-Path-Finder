<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('evaluation_model_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->foreignId('job_definition_id')->constrained('job_definitions')->onDelete('cascade');
            $table->enum('evaluation_model', ['mbo', 'bsc', 'okr']);
            $table->timestamps();
            
            $table->unique(['hr_project_id', 'job_definition_id'], 'eval_model_assign_unique');
            $table->index('hr_project_id');
            $table->index('evaluation_model');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_model_assignments');
    }
};
