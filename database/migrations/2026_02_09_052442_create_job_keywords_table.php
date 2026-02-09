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
        Schema::create('job_keywords', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('industry_category')->nullable()->comment('Filter by industry category');
            $table->string('company_size_range')->nullable()->comment('e.g., small, medium, large or 1-50, 51-200, 201-500, 500+');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('industry_category');
            $table->index('company_size_range');
            $table->index('is_active');
            $table->index('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_keywords');
    }
};
