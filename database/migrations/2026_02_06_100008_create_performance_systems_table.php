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
        Schema::create('performance_systems', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->enum('status', ['not_started', 'in_progress', 'submitted', 'approved', 'locked'])->default('not_started');
            $table->enum('evaluation_unit', ['individual', 'organization', 'hybrid'])->nullable();
            $table->enum('performance_method', ['kpi', 'mbo', 'okr', 'bsc'])->nullable();
            $table->enum('evaluation_logic', ['quantitative', 'qualitative', 'mixed'])->nullable();
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
        Schema::dropIfExists('performance_systems');
    }
};
