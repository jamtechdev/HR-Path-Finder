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
        Schema::create('job_analysis_intros', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->comment('Unique key identifier (e.g., hr_job_analysis_intro)');
            $table->string('title');
            $table->text('content')->comment('Admin-editable intro text content');
            $table->string('version')->nullable()->comment('Version for tracking changes');
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
        Schema::dropIfExists('job_analysis_intros');
    }
};
