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
        Schema::create('executives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('position_title')->comment('Executive position title (e.g., CEO, CTO, CFO)');
            $table->integer('number_of_executives')->default(1)->comment('Number of executives holding this position');
            $table->boolean('is_custom')->default(false)->comment('Whether this is a custom title added by user');
            $table->timestamps();
            
            // Index for faster queries
            $table->index('company_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('executives');
    }
};
