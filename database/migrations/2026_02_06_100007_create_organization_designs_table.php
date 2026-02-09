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
        Schema::create('organization_designs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->enum('status', ['not_started', 'in_progress', 'submitted', 'approved', 'locked'])->default('not_started');
            $table->enum('structure_type', ['functional', 'divisional', 'matrix', 'team', 'hq_subsidiary', 'undefined'])->nullable();
            $table->enum('job_grade_structure', ['single', 'multi', 'integrated', 'separated'])->nullable();
            $table->json('job_grade_details')->nullable()->comment('JSON: Additional job grade configuration');
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
        Schema::dropIfExists('organization_designs');
    }
};
