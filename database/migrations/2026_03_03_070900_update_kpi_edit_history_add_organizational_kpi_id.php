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
        Schema::table('kpi_edit_history', function (Blueprint $table) {
            // Add organizational_kpi_id if it doesn't exist
            if (!Schema::hasColumn('kpi_edit_history', 'organizational_kpi_id')) {
                // If kpi_id exists, rename it to organizational_kpi_id
                if (Schema::hasColumn('kpi_edit_history', 'kpi_id')) {
                    $table->renameColumn('kpi_id', 'organizational_kpi_id');
                } else {
                    // Otherwise add it
                    $table->foreignId('organizational_kpi_id')->nullable()->after('id')->constrained('organizational_kpis')->onDelete('cascade');
                }
            }
            
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('kpi_edit_history', 'edited_by_type')) {
                $table->string('edited_by_type')->nullable()->after('organizational_kpi_id')->comment('hr_manager, org_manager, ceo');
            }
            if (!Schema::hasColumn('kpi_edit_history', 'edited_by_id')) {
                $table->unsignedBigInteger('edited_by_id')->nullable()->after('edited_by_type');
            }
            if (!Schema::hasColumn('kpi_edit_history', 'edited_by_name')) {
                $table->string('edited_by_name')->nullable()->after('edited_by_id');
            }
            if (!Schema::hasColumn('kpi_edit_history', 'changes')) {
                $table->json('changes')->nullable()->after('edited_by_name')->comment('JSON object with before/after values');
            }
            
            // Drop old columns if they exist and new ones are added
            if (Schema::hasColumn('kpi_edit_history', 'organizational_kpi_id')) {
                if (Schema::hasColumn('kpi_edit_history', 'editor_name')) {
                    $table->dropColumn('editor_name');
                }
                if (Schema::hasColumn('kpi_edit_history', 'editor_email')) {
                    $table->dropColumn('editor_email');
                }
                if (Schema::hasColumn('kpi_edit_history', 'action')) {
                    $table->dropColumn('action');
                }
                if (Schema::hasColumn('kpi_edit_history', 'old_values')) {
                    $table->dropColumn('old_values');
                }
                if (Schema::hasColumn('kpi_edit_history', 'new_values')) {
                    $table->dropColumn('new_values');
                }
                if (Schema::hasColumn('kpi_edit_history', 'change_description')) {
                    $table->dropColumn('change_description');
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kpi_edit_history', function (Blueprint $table) {
            // Revert changes if needed
            if (Schema::hasColumn('kpi_edit_history', 'organizational_kpi_id') && !Schema::hasColumn('kpi_edit_history', 'kpi_id')) {
                $table->renameColumn('organizational_kpi_id', 'kpi_id');
            }
        });
    }
};
