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
        Schema::create('benefits_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->decimal('previous_year_total_salary', 15, 2)->nullable();
            $table->decimal('previous_year_total_benefits_expense', 15, 2)->nullable();
            $table->decimal('benefits_expense_ratio', 5, 2)->nullable()->comment('Auto-calculated percentage');
            $table->json('benefits_strategic_direction')->nullable()->comment('JSON array with primary/secondary objectives');
            $table->json('current_benefits_programs')->nullable()->comment('JSON array with program name and status');
            $table->json('future_programs')->nullable()->comment('JSON array: internal_welfare_fund, esop with status');
            $table->timestamps();
            
            $table->unique('hr_project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('benefits_configurations');
    }
};
