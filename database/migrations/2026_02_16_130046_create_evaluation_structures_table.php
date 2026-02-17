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
        Schema::create('evaluation_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            
            // Organizational Evaluation
            $table->string('org_evaluation_cycle')->nullable()->comment('annual, semi_annual, quarterly');
            $table->string('org_evaluation_timing')->nullable()->comment('Month number 1-12');
            $table->string('org_evaluator_type')->nullable()->comment('top_down');
            $table->string('org_evaluation_method')->nullable()->comment('absolute, relative');
            $table->string('org_rating_scale')->nullable()->comment('3_level, 4_level');
            $table->json('org_rating_distribution')->nullable()->comment('JSON: {A: 30%, B: 40%, C: 30%}');
            $table->string('org_evaluation_group')->nullable()->comment('team_level, executive_level');
            $table->json('org_use_of_results')->nullable()->comment('JSON array');
            
            // Individual Evaluation
            $table->string('individual_evaluation_cycle')->nullable();
            $table->string('individual_evaluation_timing')->nullable();
            $table->json('individual_evaluator_types')->nullable()->comment('JSON array: top_down, multi_rater');
            $table->json('individual_evaluators')->nullable()->comment('JSON array');
            $table->string('individual_evaluation_method')->nullable();
            $table->string('individual_rating_scale')->nullable()->comment('3_level, 4_level, 5_level');
            $table->json('individual_rating_distribution')->nullable();
            $table->json('individual_evaluation_groups')->nullable()->comment('JSON array');
            $table->json('individual_use_of_results')->nullable()->comment('JSON array');
            $table->string('organization_leader_evaluation')->nullable()->comment('replaced_by_org, separate_individual');
            
            $table->timestamps();
            
            $table->unique('hr_project_id', 'eval_structure_project_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_structures');
    }
};
