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
            $table->string('brand_name')->nullable()->after('name');
            $table->date('foundation_date')->nullable()->after('brand_name');
            $table->string('hq_location')->nullable()->after('foundation_date');
            $table->json('secondary_industries')->nullable()->after('industry');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'brand_name',
                'foundation_date',
                'hq_location',
                'secondary_industries',
            ]);
        });
    }
};
