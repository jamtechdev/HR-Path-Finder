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
        Schema::create('organizational_sentiments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained()->onDelete('cascade');
            $table->integer('openness_to_change')->nullable(); // 1-5 scale
            $table->integer('trust_level')->nullable(); // 1-5 scale
            $table->integer('evaluation_acceptance')->nullable(); // 1-5 scale
            $table->integer('reward_sensitivity')->nullable(); // 1-5 scale
            $table->integer('conflict_perception')->nullable(); // 1-5 scale
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizational_sentiments');
    }
};
