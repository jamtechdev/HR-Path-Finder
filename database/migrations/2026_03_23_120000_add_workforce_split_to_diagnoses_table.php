<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diagnoses', function (Blueprint $table) {
            $table->integer('full_time_headcount')->nullable()->after('present_headcount');
            $table->integer('contract_headcount')->nullable()->after('full_time_headcount');
        });

        if (Schema::hasColumn('diagnoses', 'present_headcount')) {
            DB::table('diagnoses')
                ->whereNotNull('present_headcount')
                ->whereNull('full_time_headcount')
                ->update([
                    'full_time_headcount' => DB::raw('present_headcount'),
                    'contract_headcount' => 0,
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('diagnoses', function (Blueprint $table) {
            $table->dropColumn(['full_time_headcount', 'contract_headcount']);
        });
    }
};
