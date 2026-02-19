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
        Schema::create('pay_band_zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pay_band_id')->constrained('pay_bands')->onDelete('cascade');
            $table->string('zone_type')->comment('low, middle, high');
            $table->decimal('min_value', 15, 2);
            $table->decimal('max_value', 15, 2);
            $table->decimal('percentage', 5, 2)->default(33.33)->comment('Percentage of band (typically 33.33% each)');
            $table->timestamps();
            
            $table->index('pay_band_id');
            $table->unique(['pay_band_id', 'zone_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pay_band_zones');
    }
};
