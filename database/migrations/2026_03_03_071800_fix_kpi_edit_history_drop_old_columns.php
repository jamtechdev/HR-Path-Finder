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
        Schema::table('kpi_edit_history', function (Blueprint $table) {
            // Drop old columns if they exist
            $columns = Schema::getColumnListing('kpi_edit_history');
            
            if (in_array('editor_name', $columns)) {
                $table->dropColumn('editor_name');
            }
            if (in_array('editor_email', $columns)) {
                $table->dropColumn('editor_email');
            }
            if (in_array('action', $columns)) {
                $table->dropColumn('action');
            }
            if (in_array('old_values', $columns)) {
                $table->dropColumn('old_values');
            }
            if (in_array('new_values', $columns)) {
                $table->dropColumn('new_values');
            }
            if (in_array('change_description', $columns)) {
                $table->dropColumn('change_description');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kpi_edit_history', function (Blueprint $table) {
            // Re-add old columns if needed
            if (!Schema::hasColumn('kpi_edit_history', 'editor_name')) {
                $table->string('editor_name')->nullable()->after('organizational_kpi_id');
            }
            if (!Schema::hasColumn('kpi_edit_history', 'editor_email')) {
                $table->string('editor_email')->nullable()->after('editor_name');
            }
            if (!Schema::hasColumn('kpi_edit_history', 'action')) {
                $table->string('action')->nullable()->after('editor_email');
            }
            if (!Schema::hasColumn('kpi_edit_history', 'old_values')) {
                $table->json('old_values')->nullable()->after('action');
            }
            if (!Schema::hasColumn('kpi_edit_history', 'new_values')) {
                $table->json('new_values')->nullable()->after('old_values');
            }
            if (!Schema::hasColumn('kpi_edit_history', 'change_description')) {
                $table->text('change_description')->nullable()->after('new_values');
            }
        });
    }
};
