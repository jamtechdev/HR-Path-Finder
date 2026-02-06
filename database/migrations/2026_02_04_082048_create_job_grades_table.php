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
        Schema::create('job_grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('grade_name')->comment('Job grade name (e.g., Associate, Assistant Manager, Manager)');
            $table->integer('grade_order')->nullable()->comment('Order/level of the grade for sorting');
            $table->text('promotion_rules')->nullable()->comment('Promotion rules for this grade');
            $table->string('promotion_to_grade')->nullable()->comment('Next grade this promotes to');
            $table->timestamps();
            
            // Index for faster queries
            $table->index('company_id');
            $table->index('grade_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_grades');
    }
};
