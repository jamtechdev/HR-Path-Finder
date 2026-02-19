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
        Schema::create('salary_table_performance_increases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salary_table_id')->constrained('salary_tables')->onDelete('cascade');
            $table->string('rating')->comment('S, A, B, C, D');
            $table->decimal('increase_amount', 15, 2)->comment('Fixed amount, non-cumulative');
            $table->timestamps();
            
            $table->unique(['salary_table_id', 'rating']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_table_performance_increases');
    }
};
