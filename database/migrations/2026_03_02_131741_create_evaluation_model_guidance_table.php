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
        Schema::create('evaluation_model_guidance', function (Blueprint $table) {
            $table->id();
            $table->string('model_type')->comment('mbo, bsc, okr');
            $table->text('concept')->comment('Brief definition explaining what the model is');
            $table->text('key_characteristics')->comment('Key structural and operational characteristics');
            $table->text('example')->comment('Simple example illustrating how it works');
            $table->text('pros')->nullable()->comment('Advantages');
            $table->text('cons')->nullable()->comment('Potential drawbacks');
            $table->text('best_fit_organizations')->nullable()->comment('Types of organizations for which this is most suitable');
            $table->json('recommended_job_keyword_ids')->nullable()->comment('Recommended job keyword IDs');
            $table->string('version')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('model_type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_model_guidance');
    }
};
