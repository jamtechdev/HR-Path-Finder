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
        Schema::table('diagnoses', function (Blueprint $table) {
            $table->json('job_categories')->nullable()->after('custom_hr_issues')->comment('JSON array of job categories');
            $table->json('job_functions')->nullable()->after('job_categories')->comment('JSON array of job functions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('diagnoses', function (Blueprint $table) {
            $table->dropColumn(['job_categories', 'job_functions']);
        });
    }
};
