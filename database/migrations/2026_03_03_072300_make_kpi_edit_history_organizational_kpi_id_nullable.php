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
        // Use raw SQL to modify the column and foreign key
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Get the actual foreign key constraint name
        $constraints = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'kpi_edit_history' 
            AND COLUMN_NAME = 'organizational_kpi_id' 
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ");
        
        if (!empty($constraints)) {
            $constraintName = $constraints[0]->CONSTRAINT_NAME;
            // Drop the existing foreign key constraint
            DB::statement("ALTER TABLE `kpi_edit_history` DROP FOREIGN KEY `{$constraintName}`");
        }
        
        // Make the column nullable
        DB::statement("ALTER TABLE `kpi_edit_history` MODIFY `organizational_kpi_id` BIGINT UNSIGNED NULL");
        
        // Re-add the foreign key constraint
        DB::statement("
            ALTER TABLE `kpi_edit_history` 
            ADD CONSTRAINT `kpi_edit_history_organizational_kpi_id_foreign` 
            FOREIGN KEY (`organizational_kpi_id`) 
            REFERENCES `organizational_kpis` (`id`) 
            ON DELETE CASCADE
        ");
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Drop the foreign key constraint
        DB::statement("ALTER TABLE `kpi_edit_history` DROP FOREIGN KEY `kpi_edit_history_organizational_kpi_id_foreign`");
        
        // Make the column NOT nullable again
        DB::statement("ALTER TABLE `kpi_edit_history` MODIFY `organizational_kpi_id` BIGINT UNSIGNED NOT NULL");
        
        // Re-add the foreign key constraint
        DB::statement("
            ALTER TABLE `kpi_edit_history` 
            ADD CONSTRAINT `kpi_edit_history_organizational_kpi_id_foreign` 
            FOREIGN KEY (`organizational_kpi_id`) 
            REFERENCES `organizational_kpis` (`id`) 
            ON DELETE CASCADE
        ");
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
};
