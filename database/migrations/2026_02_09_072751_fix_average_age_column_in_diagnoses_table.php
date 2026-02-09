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
            // Increase precision for average_age to handle larger values (up to 999.99)
            // But also add validation to ensure reasonable age values
            $table->decimal('average_age', 5, 2)->nullable()->change();
            // Also fix average_tenure columns to ensure they can handle reasonable values
            $table->decimal('average_tenure_active', 5, 2)->nullable()->change();
            $table->decimal('average_tenure_leavers', 5, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('diagnoses', function (Blueprint $table) {
            $table->decimal('average_age', 5, 2)->nullable()->change();
            $table->decimal('average_tenure_active', 5, 2)->nullable()->change();
            $table->decimal('average_tenure_leavers', 5, 2)->nullable()->change();
        });
    }
};
