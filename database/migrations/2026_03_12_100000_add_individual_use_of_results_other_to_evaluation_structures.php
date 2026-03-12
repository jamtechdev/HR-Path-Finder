<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluation_structures', function (Blueprint $table) {
            $table->text('individual_use_of_results_other')->nullable()->after('individual_use_of_results');
        });
    }

    public function down(): void
    {
        Schema::table('evaluation_structures', function (Blueprint $table) {
            $table->dropColumn('individual_use_of_results_other');
        });
    }
};
