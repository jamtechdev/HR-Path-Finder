<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->enum('diagnosis_status', ['not_started', 'in_progress', 'completed'])->default('not_started')->after('longitude');
            $table->enum('organization_status', ['not_started', 'in_progress', 'completed'])->default('not_started')->after('diagnosis_status');
            $table->enum('performance_status', ['not_started', 'in_progress', 'completed'])->default('not_started')->after('organization_status');
            $table->enum('compensation_status', ['not_started', 'in_progress', 'completed'])->default('not_started')->after('performance_status');
            $table->enum('ceo_survey_status', ['not_started', 'in_progress', 'completed'])->default('not_started')->after('compensation_status');
            $table->enum('overall_status', ['not_started', 'in_progress', 'completed', 'locked'])->default('not_started')->after('ceo_survey_status');
        });
        
        // Migrate existing hr_projects status to companies (if hr_projects still exists)
        // This will only run if hr_projects table exists (before it's dropped)
        if (Schema::hasTable('hr_projects')) {
            DB::statement('UPDATE companies c 
                INNER JOIN hr_projects hp ON c.id = hp.company_id 
                SET c.diagnosis_status = CASE 
                    WHEN hp.status = "completed" AND hp.current_step = "diagnosis" THEN "completed"
                    WHEN hp.status = "in_progress" AND hp.current_step = "diagnosis" THEN "in_progress"
                    ELSE "not_started"
                END,
                c.overall_status = CASE 
                    WHEN hp.status = "locked" THEN "locked"
                    WHEN hp.status = "completed" THEN "completed"
                    WHEN hp.status = "in_progress" THEN "in_progress"
                    ELSE "not_started"
                END');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'diagnosis_status',
                'organization_status',
                'performance_status',
                'compensation_status',
                'ceo_survey_status',
                'overall_status',
            ]);
        });
    }
};
