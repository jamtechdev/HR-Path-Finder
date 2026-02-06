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
        Schema::create('hr_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['not_started', 'in_progress', 'completed', 'locked', 'pending_consultant_review'])->default('not_started');
            $table->string('current_step')->nullable(); // e.g., 'diagnosis', 'organization', 'performance', etc.
            $table->json('step_statuses')->nullable(); // Store step statuses: diagnosis, organization, performance, compensation
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_projects');
    }
};
