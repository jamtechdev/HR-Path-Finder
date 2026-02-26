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
            if (!Schema::hasColumn('companies', 'foundation_date')) {
                $table->date('foundation_date')->nullable()->after('name');
            }
            if (!Schema::hasColumn('companies', 'brand_name')) {
                $table->string('brand_name')->nullable()->after('foundation_date');
            }
            if (!Schema::hasColumn('companies', 'is_public')) {
                $table->boolean('is_public')->default(false)->after('public_listing_status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['foundation_date', 'brand_name', 'is_public']);
        });
    }
};
