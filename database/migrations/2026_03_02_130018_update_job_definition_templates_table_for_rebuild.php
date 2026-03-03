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
        // Update CSFs JSON structure to include strategic_importance and execution_capability
        // Note: This is a structural change that doesn't require schema modification
        // The JSON field can store the new structure without migration changes
        // CSFs will be stored as: [{name, description, strategic_importance, execution_capability, rank}]
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No changes to revert
    }
};
