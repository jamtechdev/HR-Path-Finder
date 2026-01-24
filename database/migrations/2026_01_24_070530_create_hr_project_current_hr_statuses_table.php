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
        Schema::create('hr_project_current_hr_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained()->onDelete('cascade');
            $table->boolean('dedicated_hr_team')->default(false);
            $table->boolean('labor_union_present')->default(false);
            $table->enum('labor_relations_stability', ['stable', 'moderate', 'unstable'])->nullable();
            $table->enum('evaluation_system_status', ['none', 'informal', 'basic', 'advanced'])->nullable();
            $table->enum('compensation_system_status', ['none', 'informal', 'basic', 'advanced'])->nullable();
            $table->text('evaluation_system_issues')->nullable();
            $table->integer('job_rank_levels')->nullable();
            $table->integer('job_title_levels')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_project_current_hr_statuses');
    }
};
