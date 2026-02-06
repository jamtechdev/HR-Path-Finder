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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('brand_name')->nullable();
            $table->date('foundation_date')->nullable();
            $table->string('hq_location')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('industry')->nullable();
            $table->json('secondary_industries')->nullable();
            $table->string('size')->nullable(); // e.g., 'small', 'medium', 'large'
            $table->enum('growth_stage', ['early', 'growth', 'maturity', 'decline'])->nullable();
            $table->string('logo_path')->nullable();
            $table->string('image_path')->nullable();
            $table->enum('diagnosis_status', ['not_started', 'in_progress', 'completed'])->default('not_started');
            $table->enum('organization_status', ['not_started', 'in_progress', 'completed'])->default('not_started');
            $table->enum('performance_status', ['not_started', 'in_progress', 'completed'])->default('not_started');
            $table->enum('compensation_status', ['not_started', 'in_progress', 'completed'])->default('not_started');
            $table->enum('ceo_survey_status', ['not_started', 'in_progress', 'completed'])->default('not_started');
            $table->enum('overall_status', ['not_started', 'in_progress', 'completed', 'locked'])->default('not_started');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
