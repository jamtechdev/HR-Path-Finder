<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Drop old diagnosis-related tables if they exist before creating new ones.
     */
    public function up(): void
    {
        // Drop tables in reverse order of dependencies
        Schema::dropIfExists('hr_project_confidential_notes');
        Schema::dropIfExists('hr_project_cultures');
        Schema::dropIfExists('hr_project_current_hr_statuses');
        Schema::dropIfExists('hr_project_workforces');
        Schema::dropIfExists('hr_project_business_profiles');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration only drops tables, so down() is intentionally empty
        // The new migrations will recreate the tables
    }
};
