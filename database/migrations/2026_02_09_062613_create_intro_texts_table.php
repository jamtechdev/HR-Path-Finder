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
        Schema::create('intro_texts', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->comment('Unique identifier: ceo_survey_intro, hr_job_analysis_intro, etc.');
            $table->string('title')->nullable();
            $table->text('content');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('key');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('intro_texts');
    }
};
