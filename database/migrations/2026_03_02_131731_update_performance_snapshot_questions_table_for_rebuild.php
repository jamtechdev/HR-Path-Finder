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
        Schema::table('performance_snapshot_questions', function (Blueprint $table) {
            // Add version and recommendation_rule_id if they don't exist
            if (!Schema::hasColumn('performance_snapshot_questions', 'version')) {
                $table->string('version')->nullable()->after('is_active');
            }
            if (!Schema::hasColumn('performance_snapshot_questions', 'recommendation_rule_id')) {
                $table->string('recommendation_rule_id')->nullable()->after('version')->comment('For future consultant recommendation automation');
            }
            // Ensure answer_type and options columns exist
            if (!Schema::hasColumn('performance_snapshot_questions', 'answer_type')) {
                $table->string('answer_type')->default('select_one')->after('question_text')->comment('select_one, select_up_to_2, select_all_that_apply');
            }
            if (!Schema::hasColumn('performance_snapshot_questions', 'options')) {
                $table->json('options')->nullable()->after('answer_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('performance_snapshot_questions', function (Blueprint $table) {
            if (Schema::hasColumn('performance_snapshot_questions', 'version')) {
                $table->dropColumn('version');
            }
            if (Schema::hasColumn('performance_snapshot_questions', 'recommendation_rule_id')) {
                $table->dropColumn('recommendation_rule_id');
            }
        });
    }
};
