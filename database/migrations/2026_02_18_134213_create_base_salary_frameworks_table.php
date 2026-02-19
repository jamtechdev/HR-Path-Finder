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
        Schema::create('base_salary_frameworks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->string('salary_structure_type')->nullable()->comment('annual_accumulated, annual_non_accumulated, annual_hybrid, seniority_based, job_based');
            $table->string('salary_adjustment_unit')->nullable()->comment('percentage, krw');
            $table->string('salary_adjustment_grouping')->nullable()->comment('single, dual');
            $table->json('salary_adjustment_timing')->nullable()->comment('JSON array of months (1-12)');
            $table->string('salary_determination_standard')->nullable()->comment('pay_band, salary_table');
            $table->string('common_salary_increase_rate')->nullable()->comment('required, not_required');
            $table->string('common_increase_rate_basis')->nullable()->comment('inflation, company_performance, management_discretion');
            $table->string('performance_based_increase_differentiation')->nullable()->comment('strong, moderate, none');
            $table->timestamps();
            
            $table->unique('hr_project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('base_salary_frameworks');
    }
};
