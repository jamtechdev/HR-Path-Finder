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
            $table->foreignId('hr_project_id')->constrained()->onDelete('cascade');
            $table->enum('structure_type', ['functional', 'team', 'divisional', 'matrix'])->nullable();
            $table->enum('job_grade_structure', ['single', 'multi'])->nullable();
            $table->enum('grade_title_relationship', ['integrated', 'separated'])->nullable();
            $table->text('managerial_role_definition')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
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
