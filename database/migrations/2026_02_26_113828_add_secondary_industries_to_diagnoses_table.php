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
        Schema::table('diagnoses', function (Blueprint $table) {
            if (!Schema::hasColumn('diagnoses', 'secondary_industries')) {
                $table->json('secondary_industries')->nullable()->after('industry_other');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('diagnoses', function (Blueprint $table) {
            if (Schema::hasColumn('diagnoses', 'secondary_industries')) {
                $table->dropColumn('secondary_industries');
            }
        });
    }
};
