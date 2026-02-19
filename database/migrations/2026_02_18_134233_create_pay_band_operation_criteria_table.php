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
        Schema::create('pay_band_operation_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->string('outlier_handling')->nullable()->comment('not_allowed, allowed_with_ceo_approval');
            $table->string('promotion_movement_rule')->nullable()->comment('guarantee_minimum, below_minimum_allowed');
            $table->string('band_review_cycle')->nullable()->comment('annual, every_2_years, ad_hoc');
            $table->timestamps();
            
            $table->unique('hr_project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pay_band_operation_criteria');
    }
};
