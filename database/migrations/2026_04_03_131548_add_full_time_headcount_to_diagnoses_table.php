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
        if (!Schema::hasColumn('diagnoses', 'full_time_headcount')) {
            Schema::table('diagnoses', function (Blueprint $table) {
                $table->integer('full_time_headcount')->default(0);
            });
        }

        if (!Schema::hasColumn('diagnoses', 'contract_headcount')) {
            Schema::table('diagnoses', function (Blueprint $table) {
                $table->integer('contract_headcount')->default(0);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('diagnoses', 'full_time_headcount')) {
            Schema::table('diagnoses', function (Blueprint $table) {
                $table->dropColumn('full_time_headcount');
            });
        }

        if (Schema::hasColumn('diagnoses', 'contract_headcount')) {
            Schema::table('diagnoses', function (Blueprint $table) {
                $table->dropColumn('contract_headcount');
            });
        }
    }
};
