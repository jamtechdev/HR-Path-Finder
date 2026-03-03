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
        Schema::table('organizational_kpis', function (Blueprint $table) {
            // Add status and workflow fields if they don't exist
            if (!Schema::hasColumn('organizational_kpis', 'status')) {
                $table->string('status')->default('draft')->after('is_active')->comment('draft, proposed_by_manager, approved_by_ceo');
            }
            if (!Schema::hasColumn('organizational_kpis', 'proposed_by_manager_id')) {
                $table->unsignedBigInteger('proposed_by_manager_id')->nullable()->after('status');
            }
            if (!Schema::hasColumn('organizational_kpis', 'proposed_at')) {
                $table->timestamp('proposed_at')->nullable()->after('proposed_by_manager_id');
            }
            if (!Schema::hasColumn('organizational_kpis', 'ceo_approval_status')) {
                $table->string('ceo_approval_status')->nullable()->after('proposed_at')->comment('approved, revision_requested');
            }
            if (!Schema::hasColumn('organizational_kpis', 'ceo_revision_comment')) {
                $table->text('ceo_revision_comment')->nullable()->after('ceo_approval_status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organizational_kpis', function (Blueprint $table) {
            if (Schema::hasColumn('organizational_kpis', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('organizational_kpis', 'proposed_by_manager_id')) {
                $table->dropColumn('proposed_by_manager_id');
            }
            if (Schema::hasColumn('organizational_kpis', 'proposed_at')) {
                $table->dropColumn('proposed_at');
            }
            if (Schema::hasColumn('organizational_kpis', 'ceo_approval_status')) {
                $table->dropColumn('ceo_approval_status');
            }
            if (Schema::hasColumn('organizational_kpis', 'ceo_revision_comment')) {
                $table->dropColumn('ceo_revision_comment');
            }
        });
    }
};
