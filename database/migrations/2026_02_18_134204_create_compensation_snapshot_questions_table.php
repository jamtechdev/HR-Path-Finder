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
        Schema::create('compensation_snapshot_questions', function (Blueprint $table) {
            $table->id();
            $table->text('question_text');
            $table->string('answer_type')->comment('select_one, select_up_to_2, multiple, numeric, text');
            $table->json('options')->nullable()->comment('JSON array of answer options (null for numeric/text)');
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('version')->nullable()->comment('For versioning/effective date handling');
            $table->json('metadata')->nullable()->comment('For mapping to recommendation rules');
            $table->timestamps();
            
            $table->index('order');
            $table->index('is_active');
            $table->index('version');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compensation_snapshot_questions');
    }
};
