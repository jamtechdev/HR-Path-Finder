<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diagnoses', function (Blueprint $table) {
            $table->json('job_grade_headcounts')->nullable()->after('promotion_years')->comment('JSON: {grade_name: headcount}');
            $table->json('job_grade_expected_roles')->nullable()->after('job_grade_headcounts')->comment('JSON: {grade_name: expected_role_text}');
        });
    }

    public function down(): void
    {
        Schema::table('diagnoses', function (Blueprint $table) {
            $table->dropColumn(['job_grade_headcounts', 'job_grade_expected_roles']);
        });
    }
};
