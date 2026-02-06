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
        Schema::create('organizational_charts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('chart_year_month', 7)->comment('Year and month in format YYYY.MM (e.g., 2023.12)');
            $table->string('file_path')->comment('Path to uploaded organizational chart file');
            $table->string('file_name')->nullable()->comment('Original file name');
            $table->string('file_type')->nullable()->comment('File type (pdf, png, jpg, etc.)');
            $table->integer('file_size')->nullable()->comment('File size in bytes');
            $table->timestamps();
            
            // Ensure one chart per year-month per company
            $table->unique(['company_id', 'chart_year_month']);
            $table->index('company_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizational_charts');
    }
};
