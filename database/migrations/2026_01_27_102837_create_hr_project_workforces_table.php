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
        Schema::create('hr_project_workforces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->integer('headcount_year_minus_2')->nullable()->comment('Headcount 2 years ago');
            $table->integer('headcount_year_minus_1')->nullable()->comment('Headcount 1 year ago');
            $table->integer('headcount_current')->nullable()->comment('Current headcount');
            $table->integer('total_employees')->nullable()->comment('Total number of employees');
            $table->integer('contract_employees')->nullable()->comment('Number of contract employees');
            $table->string('org_chart_path')->nullable()->comment('Path to uploaded organization chart file');
            $table->timestamps();
            
            // Ensure one workforce record per HR project
            $table->unique('hr_project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_project_workforces');
    }
};
