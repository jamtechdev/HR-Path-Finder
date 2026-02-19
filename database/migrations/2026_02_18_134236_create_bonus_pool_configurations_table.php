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
        Schema::create('bonus_pool_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->string('payment_trigger_condition')->nullable();
            $table->string('bonus_pool_determination_criteria')->nullable();
            $table->string('bonus_pool_determination_method')->nullable();
            $table->string('eligibility_scope')->nullable();
            $table->string('eligibility_criteria')->nullable();
            $table->string('inclusion_of_employees_on_leave')->nullable();
            $table->string('bonus_calculation_unit')->nullable()->comment('percentage, fixed_amount');
            $table->string('allocation_scope')->nullable();
            $table->json('allocation_criteria')->nullable()->comment('JSON array of criteria');
            $table->integer('bonus_pool_finalization_timing')->nullable()->comment('Month 1-12');
            $table->integer('bonus_payment_month')->nullable()->comment('Month 1-12');
            $table->date('calculation_period_start')->nullable();
            $table->date('calculation_period_end')->nullable();
            $table->timestamps();
            
            $table->unique('hr_project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bonus_pool_configurations');
    }
};
