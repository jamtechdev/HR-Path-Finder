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
        // Org chart mappings table already has the correct structure
        // It already supports org_unit_name, job_keyword_ids, org_head fields, and job_specialists
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
