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
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->string('locale', 10)->default('ko')->comment('Language code: ko, en');
            $table->string('namespace')->default('translation')->comment('Translation namespace');
            $table->string('key')->comment('Translation key (e.g., common.save, buttons.continue)');
            $table->text('value')->comment('Translated text');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique(['locale', 'namespace', 'key']);
            $table->index('locale');
            $table->index('key');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
