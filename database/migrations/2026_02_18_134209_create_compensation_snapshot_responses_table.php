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
        Schema::create('compensation_snapshot_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('compensation_snapshot_questions')->onDelete('cascade');
            $table->json('response')->nullable()->comment('JSON array of selected options');
            $table->text('text_response')->nullable()->comment('For text responses');
            $table->decimal('numeric_response', 15, 2)->nullable()->comment('For numeric responses (KRW amounts, percentages)');
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
        Schema::dropIfExists('compensation_snapshot_responses');
    }
};
