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
        Schema::create('policy_snapshot_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('policy_snapshot_questions')->onDelete('cascade');
            $table->string('answer')->comment('yes, no, or not_sure');
            $table->text('conditional_text')->nullable()->comment('Text input when answer is yes and question has conditional_text');
            $table->timestamps();
            
            $table->unique(['hr_project_id', 'question_id']);
            $table->index('hr_project_id');
            $table->index('question_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('policy_snapshot_answers');
    }
};
