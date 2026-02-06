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
            // Task 3: Workforce Information - Expanded fields
            // Rename headcount_current to present_workforce for clarity
            // Expected workforce after 1, 2, 3 years
            $table->integer('expected_workforce_1_year')->nullable()->after('headcount_current')->comment('Expected number of employees in 1 year');
            $table->integer('expected_workforce_2_years')->nullable()->after('expected_workforce_1_year')->comment('Expected number of employees in 2 years');
            $table->integer('expected_workforce_3_years')->nullable()->after('expected_workforce_2_years')->comment('Expected number of employees in 3 years');
            
            // Average tenure
            $table->decimal('average_tenure_active', 5, 2)->nullable()->after('expected_workforce_3_years')->comment('Average tenure of active employees (years)');
            $table->decimal('average_tenure_leavers', 5, 2)->nullable()->after('average_tenure_active')->comment('Average tenure of employees who left (years)');
            
            // Average age
            $table->decimal('average_age_active', 5, 2)->nullable()->after('average_tenure_leavers')->comment('Average age of active employees');
            
            // Gender breakdown
            $table->integer('male_employees')->nullable()->after('average_age_active')->comment('Number of male employees');
            $table->integer('female_employees')->nullable()->after('male_employees')->comment('Number of female employees');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('workforces', function (Blueprint $table) {
            $table->dropColumn([
                'expected_workforce_1_year',
                'expected_workforce_2_years',
                'expected_workforce_3_years',
                'average_tenure_active',
                'average_tenure_leavers',
                'average_age_active',
                'male_employees',
                'female_employees',
            ]);
        });
    }
};
