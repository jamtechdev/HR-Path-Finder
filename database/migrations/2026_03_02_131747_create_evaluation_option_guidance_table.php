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
        Schema::create('evaluation_option_guidance', function (Blueprint $table) {
            $table->id();
            $table->string('option_key')->comment('e.g., evaluation_cycle, rating_scale');
            $table->string('option_value')->comment('e.g., annual, 3-level');
            $table->text('concept')->nullable()->comment('Brief definition');
            $table->text('key_characteristics')->nullable();
            $table->text('example')->nullable();
            $table->text('pros')->nullable();
            $table->text('cons')->nullable();
            $table->text('best_fit_organizations')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['option_key', 'option_value']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_option_guidance');
    }
};
