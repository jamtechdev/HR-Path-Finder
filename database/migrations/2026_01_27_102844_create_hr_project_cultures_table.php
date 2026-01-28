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
        Schema::create('hr_project_cultures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->enum('work_format', ['on_site', 'hybrid', 'remote', 'flexible'])->nullable();
            $table->enum('decision_making_style', ['top_down', 'collaborative', 'consensus', 'decentralized'])->nullable();
            $table->json('core_values')->nullable()->comment('Array of core values (max 5)');
            $table->timestamps();
            
            // Ensure one culture record per HR project
            $table->unique('hr_project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_project_cultures');
    }
};
