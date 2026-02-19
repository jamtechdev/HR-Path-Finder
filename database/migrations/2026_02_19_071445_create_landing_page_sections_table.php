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
        Schema::create('landing_page_sections', function (Blueprint $table) {
            $table->id();
            $table->string('section_key')->comment('Unique identifier for the section (e.g., hero_title, hero_description)');
            $table->string('section_type')->default('text')->comment('Type: text, textarea, image, html, json');
            $table->text('content')->nullable()->comment('Section content (text, HTML, JSON, etc.)');
            $table->string('locale', 10)->default('ko')->comment('Language: ko, en');
            $table->integer('order')->default(0)->comment('Display order');
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable()->comment('Additional metadata (image URL, links, etc.)');
            $table->timestamps();
            
            // Unique constraint on section_key + locale combination
            $table->unique(['section_key', 'locale']);
            
            $table->index('section_key');
            $table->index('locale');
            $table->index('order');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('landing_page_sections');
    }
};
