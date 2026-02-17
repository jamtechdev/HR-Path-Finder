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
        Schema::create('performance_snapshot_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('performance_snapshot_questions')->onDelete('cascade');
            $table->json('response')->comment('JSON array of selected option IDs or text response');
            $table->text('text_response')->nullable()->comment('For "Other" text responses');
            $table->timestamps();
            
            $table->unique(['hr_project_id', 'question_id']);
            $table->index('hr_project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performance_snapshot_responses');
    }
};
