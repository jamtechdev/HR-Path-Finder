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
            $table->unsignedInteger('sort_order')->nullable()->after('job_specialists');
            $table->unsignedBigInteger('parent_id')->nullable()->after('sort_order');
        });
        Schema::table('org_chart_mappings', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('org_chart_mappings')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('org_chart_mappings', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['sort_order', 'parent_id']);
        });
    }
};
