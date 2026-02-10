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
        Schema::table('admin_comments', function (Blueprint $table) {
            $table->enum('recommendation_type', ['performance', 'compensation'])->nullable()->after('step');
            $table->string('recommended_option')->nullable()->after('recommendation_type');
            $table->text('rationale')->nullable()->after('recommended_option');
            $table->boolean('is_recommendation')->default(false)->after('rationale');
            
            $table->index('recommendation_type');
            $table->index('is_recommendation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admin_comments', function (Blueprint $table) {
            $table->dropIndex(['recommendation_type']);
            $table->dropIndex(['is_recommendation']);
            $table->dropColumn(['recommendation_type', 'recommended_option', 'rationale', 'is_recommendation']);
        });
    }
};
