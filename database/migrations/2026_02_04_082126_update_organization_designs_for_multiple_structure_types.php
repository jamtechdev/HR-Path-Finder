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
        Schema::table('organization_designs', function (Blueprint $table) {
            // Task 8: Support multiple organizational structure types
            // Change from single enum to JSON array to support multiple selections
            $table->json('structure_types')->nullable()->after('hr_project_id')->comment('Array of structure types: functional, divisional, project_matrix, hq_subsidiary, no_clearly_defined');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organization_designs', function (Blueprint $table) {
            $table->dropColumn('structure_types');
        });
    }
};
