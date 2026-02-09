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
        Schema::create('job_definition_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_keyword_id')->nullable()->constrained('job_keywords')->onDelete('set null');
            $table->string('industry_category')->nullable();
            $table->string('company_size_range')->nullable();
            $table->text('job_description')->nullable()->comment('Job purpose, key responsibilities, scope');
            $table->json('job_specification')->nullable()->comment('JSON: {education: {required/preferred}, experience: {...}, skills: {...}, communication: {...}}');
            $table->json('competency_levels')->nullable()->comment('JSON array: [{level: string, description: string}]');
            $table->json('csfs')->nullable()->comment('JSON array: [{name: string, description: string}]');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('job_keyword_id');
            $table->index('industry_category');
            $table->index('company_size_range');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_definition_templates');
    }
};
