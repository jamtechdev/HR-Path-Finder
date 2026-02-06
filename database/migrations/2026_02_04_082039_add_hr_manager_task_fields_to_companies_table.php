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
        Schema::table('companies', function (Blueprint $table) {
            // Task 1: Basic Company Information
            $table->string('registration_number')->nullable()->after('name');
            $table->boolean('public_listing_status')->nullable()->after('registration_number')->comment('Is company publicly listed?');
            
            // Task 2: Industry Information
            $table->string('industry_sub_category')->nullable()->after('industry')->comment('Subcategory of industry (e.g., Electronics, Automotive, Semi-conductors)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['registration_number', 'public_listing_status', 'industry_sub_category']);
        });
    }
};
