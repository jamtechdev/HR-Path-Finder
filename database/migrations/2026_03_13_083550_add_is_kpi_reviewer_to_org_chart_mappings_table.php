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
        Schema::table('org_chart_mappings', function (Blueprint $table) {
            $table->boolean('is_kpi_reviewer')->default(false)->after('org_head_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('org_chart_mappings', function (Blueprint $table) {
            $table->dropColumn('is_kpi_reviewer');
        });
    }
};
