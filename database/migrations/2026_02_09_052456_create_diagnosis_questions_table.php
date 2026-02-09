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
        Schema::create('diagnosis_questions', function (Blueprint $table) {
            $table->id();
            $table->string('category'); // management_philosophy, vision_mission, growth_stage, leadership, general, issues, concerns
            $table->text('question_text');
            $table->string('question_type'); // likert, text, select, slider, number
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable(); // For slider ranges, likert scales, etc.
            $table->json('options')->nullable(); // For select type questions
            $table->timestamps();
            
            $table->index('category');
            $table->index('is_active');
            $table->index('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diagnosis_questions');
    }
};
