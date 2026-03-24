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
        Schema::create('org_chart_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->string('org_unit_name');
            $table->json('job_keyword_ids')->nullable()->comment('JSON array of job_keyword_ids mapped to this org unit');
            $table->string('org_head_name')->nullable();
            $table->string('org_head_rank')->nullable();
            $table->string('org_head_title')->nullable();
            $table->string('org_head_email')->nullable();
            $table->boolean('is_kpi_reviewer')->default(false);
            $table->json('job_specialists')->nullable()->comment('JSON array: [{name, rank, title, email, job_keyword_id}]');
            $table->unsignedInteger('sort_order')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->timestamps();
            
            $table->index('hr_project_id');
            $table->foreign('parent_id')->references('id')->on('org_chart_mappings')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('org_chart_mappings');
    }
};
