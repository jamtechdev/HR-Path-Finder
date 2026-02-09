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
        Schema::create('policy_snapshot_questions', function (Blueprint $table) {
            $table->id();
            $table->text('question_text');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('has_conditional_text')->default(false)->comment('If true, shows text input when Yes is selected');
            $table->timestamps();
            
            $table->index('is_active');
            $table->index('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('policy_snapshot_questions');
    }
};
