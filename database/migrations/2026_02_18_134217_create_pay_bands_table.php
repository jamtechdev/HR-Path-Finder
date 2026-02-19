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
        Schema::create('pay_bands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->string('job_grade');
            $table->decimal('min_salary', 15, 2);
            $table->decimal('max_salary', 15, 2);
            $table->decimal('target_salary', 15, 2)->nullable();
            $table->decimal('width', 15, 2)->nullable();
            $table->decimal('factor_a', 10, 4)->nullable()->comment('Target rate increase (~2)');
            $table->decimal('factor_b', 10, 4)->nullable()->comment('Min Setting Rate');
            $table->decimal('min_setting_rate_1_2', 5, 2)->nullable()->comment('Min Setting Rate for years 1-2');
            $table->decimal('min_setting_rate_3_plus', 5, 2)->nullable()->comment('Min Setting Rate for years 3+');
            $table->decimal('target_rate_increase_1_2', 5, 2)->nullable()->comment('Target rate increase for years 1-2');
            $table->decimal('target_rate_increase_3_plus', 5, 2)->nullable()->comment('Target rate increase for years 3+');
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->index(['hr_project_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pay_bands');
    }
};
