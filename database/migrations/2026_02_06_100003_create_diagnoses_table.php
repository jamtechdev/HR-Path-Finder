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
        Schema::create('diagnoses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->enum('status', ['not_started', 'in_progress', 'submitted', 'approved', 'locked'])->default('not_started');
            
            // Industry Information
            $table->string('industry_category')->nullable();
            $table->string('industry_subcategory')->nullable();
            $table->string('industry_other')->nullable();
            
            // Workforce Data
            $table->integer('present_headcount')->nullable();
            $table->integer('expected_headcount_1y')->nullable();
            $table->integer('expected_headcount_2y')->nullable();
            $table->integer('expected_headcount_3y')->nullable();
            $table->decimal('average_tenure_active', 5, 2)->nullable();
            $table->decimal('average_tenure_leavers', 5, 2)->nullable();
            $table->decimal('average_age', 5, 2)->nullable();
            $table->integer('gender_male')->nullable();
            $table->integer('gender_female')->nullable();
            $table->integer('gender_other')->nullable();
            $table->decimal('gender_ratio', 5, 2)->nullable();
            
            // Leadership & Executives
            $table->integer('total_executives')->nullable();
            $table->json('executive_positions')->nullable()->comment('JSON: {position_name: count}');
            $table->integer('leadership_count')->nullable();
            $table->decimal('leadership_percentage', 5, 2)->nullable();
            
            // Job Grade System
            $table->json('job_grade_names')->nullable();
            $table->json('promotion_years')->nullable()->comment('JSON: {grade_name: years}');
            
            // Organizational Structure
            $table->json('organizational_charts')->nullable()->comment('JSON: {year: file_path}');
            $table->json('org_structure_types')->nullable();
            $table->json('org_structure_explanations')->nullable()->comment('JSON: {type: explanation}');
            
            // HR Issues
            $table->json('hr_issues')->nullable();
            $table->text('custom_hr_issues')->nullable();
            
            $table->timestamps();
            
            $table->unique('hr_project_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnoses');
    }
};
