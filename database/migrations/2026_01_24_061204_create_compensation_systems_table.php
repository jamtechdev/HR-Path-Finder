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
        Schema::create('compensation_systems', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained()->onDelete('cascade');
            $table->enum('compensation_structure', ['fixed', 'mixed', 'performance_based'])->nullable();
            $table->enum('differentiation_method', ['merit', 'incentive', 'role_based'])->nullable();
            $table->json('incentive_components')->nullable(); // individual, organizational, task_force, long_term
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compensation_systems');
    }
};
