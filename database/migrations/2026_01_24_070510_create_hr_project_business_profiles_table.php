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
            $table->foreignId('hr_project_id')->constrained()->onDelete('cascade');
            $table->decimal('annual_revenue', 10, 1)->nullable(); // billions
            $table->decimal('operational_margin_rate', 5, 2)->nullable(); // percent
            $table->decimal('annual_human_cost', 10, 1)->nullable(); // billions
            $table->enum('business_type', ['b2b', 'b2c', 'b2b2c'])->nullable();
            $table->timestamps();
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
