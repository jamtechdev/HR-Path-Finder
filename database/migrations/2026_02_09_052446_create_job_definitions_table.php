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
        Schema::create('job_definitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->foreignId('job_keyword_id')->nullable()->constrained('job_keywords')->onDelete('set null');
            $table->string('job_name')->comment('Job name (can be grouped job name)');
            $table->json('grouped_job_keyword_ids')->nullable()->comment('If grouped, contains array of job_keyword_ids');
            $table->text('job_description')->nullable()->comment('Job purpose, key responsibilities, scope');
            $table->json('job_specification')->nullable()->comment('JSON: {education: {required/preferred}, experience: {...}, skills: {...}, communication: {...}}');
            $table->json('competency_levels')->nullable()->comment('JSON array: [{level: string, description: string}]');
            $table->json('csfs')->nullable()->comment('JSON array: [{name: string, description: string}]');
            $table->boolean('is_finalized')->default(false);
            $table->timestamps();
            
            $table->index('hr_project_id');
            $table->index('job_keyword_id');
            $table->index('is_finalized');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_definitions');
    }
};
