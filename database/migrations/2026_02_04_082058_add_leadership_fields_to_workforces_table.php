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
        Schema::table('workforces', function (Blueprint $table) {
            // Task 5: Leadership Information
            $table->integer('total_leaders_above_team_leader')->nullable()->after('female_employees')->comment('Total number of leaders above team leader level');
            $table->decimal('leaders_percentage', 5, 2)->nullable()->after('total_leaders_above_team_leader')->comment('Percentage of total workforce represented by leaders above team leader level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workforces', function (Blueprint $table) {
            $table->dropColumn(['total_leaders_above_team_leader', 'leaders_percentage']);
        });
    }
};
