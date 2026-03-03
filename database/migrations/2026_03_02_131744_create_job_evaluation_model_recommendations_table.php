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
        Schema::create('job_evaluation_model_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_keyword_id')->constrained('job_keywords')->onDelete('cascade');
            $table->string('recommended_model')->comment('mbo, bsc, okr');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique('job_keyword_id');
            $table->index('recommended_model');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_evaluation_model_recommendations');
    }
};
