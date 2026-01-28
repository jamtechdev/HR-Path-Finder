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
        Schema::create('hr_project_business_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->decimal('annual_revenue', 15, 2)->nullable()->comment('Annual revenue in actual currency value');
            $table->decimal('operational_margin_rate', 5, 2)->nullable()->comment('Operational margin rate as percentage (0-100)');
            $table->decimal('annual_human_cost', 15, 2)->nullable()->comment('Annual human cost in actual currency value');
            $table->enum('business_type', ['b2b', 'b2c', 'b2b2c'])->nullable();
            $table->timestamps();
            
            // Ensure one business profile per HR project
            $table->unique('hr_project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_project_business_profiles');
    }
};
