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
        // Job keywords table already has the correct structure
        // No changes needed - it already supports industry_category and company_size_range
        // This migration is kept for consistency but doesn't modify the table
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No changes to revert
    }
};
