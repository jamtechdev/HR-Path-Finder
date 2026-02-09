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
        Schema::create('ceo_philosophies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->comment('CEO user');
            $table->json('survey_responses')->nullable()->comment('JSON: {question_id: answer}');
            $table->string('main_trait')->nullable()->comment('Primary management trait');
            $table->string('secondary_trait')->nullable()->comment('Secondary management trait');
            $table->timestamps();
            
            $table->unique('hr_project_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ceo_philosophies');
    }
};
