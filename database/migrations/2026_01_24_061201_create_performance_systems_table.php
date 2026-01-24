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
            $table->foreignId('hr_project_id')->constrained()->onDelete('cascade');
            $table->enum('performance_unit', ['individual', 'organization', 'hybrid'])->nullable();
            $table->enum('performance_method', ['kpi', 'mbo', 'okr', 'bsc'])->nullable();
            $table->enum('evaluation_structure_quantitative', ['quantitative', 'qualitative', 'hybrid'])->nullable();
            $table->enum('evaluation_structure_relative', ['relative', 'absolute'])->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
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
