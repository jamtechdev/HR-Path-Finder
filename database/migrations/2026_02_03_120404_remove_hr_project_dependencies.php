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
        // Helper function to safely drop foreign key
        $dropForeignKeyIfExists = function ($tableName, $columnName) {
            $foreignKeys = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = ? 
                AND COLUMN_NAME = ? 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ", [$tableName, $columnName]);
            
            foreach ($foreignKeys as $fk) {
                DB::statement("ALTER TABLE `{$tableName}` DROP FOREIGN KEY `{$fk->CONSTRAINT_NAME}`");
            }
        };
        
        // Step 1: Update business_profiles table (before renaming)
        $dropForeignKeyIfExists('hr_project_business_profiles', 'hr_project_id');
        
        Schema::table('hr_project_business_profiles', function (Blueprint $table) {
            $table->dropUnique(['hr_project_id']);
            $table->foreignId('company_id')->after('id');
        });
        
        // Migrate data: hr_project_id -> company_id
        DB::statement('UPDATE hr_project_business_profiles bp 
            INNER JOIN hr_projects hp ON bp.hr_project_id = hp.id 
            SET bp.company_id = hp.company_id');
        
        Schema::table('hr_project_business_profiles', function (Blueprint $table) {
            $table->dropColumn('hr_project_id');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->unique('company_id');
        });
        
        // Step 2: Update workforces table (before renaming)
        $dropForeignKeyIfExists('hr_project_workforces', 'hr_project_id');
        
        Schema::table('hr_project_workforces', function (Blueprint $table) {
            $table->dropUnique(['hr_project_id']);
            $table->foreignId('company_id')->after('id');
        });
        
        DB::statement('UPDATE hr_project_workforces w 
            INNER JOIN hr_projects hp ON w.hr_project_id = hp.id 
            SET w.company_id = hp.company_id');
        
        Schema::table('hr_project_workforces', function (Blueprint $table) {
            $table->dropColumn('hr_project_id');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->unique('company_id');
        });
        
        // Step 3: Update current_hr_statuses table (before renaming)
        $dropForeignKeyIfExists('hr_project_current_hr_statuses', 'hr_project_id');
        
        Schema::table('hr_project_current_hr_statuses', function (Blueprint $table) {
            $table->dropUnique(['hr_project_id']);
            $table->foreignId('company_id')->after('id');
        });
        
        DB::statement('UPDATE hr_project_current_hr_statuses chs 
            INNER JOIN hr_projects hp ON chs.hr_project_id = hp.id 
            SET chs.company_id = hp.company_id');
        
        Schema::table('hr_project_current_hr_statuses', function (Blueprint $table) {
            $table->dropColumn('hr_project_id');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->unique('company_id');
        });
        
        // Step 4: Update cultures table (before renaming)
        $dropForeignKeyIfExists('hr_project_cultures', 'hr_project_id');
        
        Schema::table('hr_project_cultures', function (Blueprint $table) {
            $table->dropUnique(['hr_project_id']);
            $table->foreignId('company_id')->after('id');
        });
        
        DB::statement('UPDATE hr_project_cultures c 
            INNER JOIN hr_projects hp ON c.hr_project_id = hp.id 
            SET c.company_id = hp.company_id');
        
        Schema::table('hr_project_cultures', function (Blueprint $table) {
            $table->dropColumn('hr_project_id');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->unique('company_id');
        });
        
        // Step 5: Update confidential_notes table (before renaming)
        $dropForeignKeyIfExists('hr_project_confidential_notes', 'hr_project_id');
        
        Schema::table('hr_project_confidential_notes', function (Blueprint $table) {
            $table->dropUnique(['hr_project_id']);
            $table->foreignId('company_id')->after('id');
        });
        
        DB::statement('UPDATE hr_project_confidential_notes cn 
            INNER JOIN hr_projects hp ON cn.hr_project_id = hp.id 
            SET cn.company_id = hp.company_id');
        
        Schema::table('hr_project_confidential_notes', function (Blueprint $table) {
            $table->dropColumn('hr_project_id');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->unique('company_id');
        });
        
        // Step 6: Rename tables (after foreign keys are updated)
        Schema::rename('hr_project_business_profiles', 'business_profiles');
        Schema::rename('hr_project_workforces', 'workforces');
        Schema::rename('hr_project_current_hr_statuses', 'current_hr_statuses');
        Schema::rename('hr_project_cultures', 'cultures');
        Schema::rename('hr_project_confidential_notes', 'confidential_notes');
        
        // Step 7: Drop foreign keys from other tables that reference hr_projects
        // These tables are for later workflow steps, but we need to drop FKs to remove hr_projects
        $tablesWithHrProjectFk = [
            'company_attributes',
            'organizational_sentiments',
            'ceo_philosophy_surveys',
            'organization_designs',
            'performance_systems',
            'compensation_systems',
            'consultant_reviews',
            'ceo_approvals',
            'hr_project_audits',
        ];
        
        foreach ($tablesWithHrProjectFk as $tableName) {
            if (Schema::hasTable($tableName)) {
                $dropForeignKeyIfExists($tableName, 'hr_project_id');
            }
        }
        
        // Step 8: Drop hr_projects table (after all foreign keys are removed)
        Schema::dropIfExists('hr_projects');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate hr_projects table
        Schema::create('hr_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['not_started', 'in_progress', 'completed', 'locked'])->default('not_started');
            $table->string('current_step')->nullable();
            $table->timestamps();
        });
        
        // Reverse table renames and foreign key changes
        // This is complex and may lose data, so we'll keep it simple
        // In production, you'd want to backup data first
        
        Schema::rename('business_profiles', 'hr_project_business_profiles');
        Schema::rename('workforces', 'hr_project_workforces');
        Schema::rename('current_hr_statuses', 'hr_project_current_hr_statuses');
        Schema::rename('cultures', 'hr_project_cultures');
        Schema::rename('confidential_notes', 'hr_project_confidential_notes');
        
        // Reverse foreign key changes (simplified - would need data migration in production)
        foreach (['hr_project_business_profiles', 'hr_project_workforces', 'hr_project_current_hr_statuses', 'hr_project_cultures', 'hr_project_confidential_notes'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->dropForeign(['company_id']);
                $table->dropUnique(['company_id']);
                $table->dropColumn('company_id');
                $table->foreignId('hr_project_id')->after('id');
                $table->foreign('hr_project_id')->references('id')->on('hr_projects')->onDelete('cascade');
                $table->unique('hr_project_id');
            });
        }
    }
};
