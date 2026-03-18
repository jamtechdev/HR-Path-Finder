<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bonus_pool_configurations', function (Blueprint $table) {
            $table->decimal('ratio_value', 8, 2)->nullable()->after('bonus_pool_determination_method');
            $table->decimal('range_min', 15, 2)->nullable()->after('ratio_value');
            $table->decimal('range_max', 15, 2)->nullable()->after('range_min');
            $table->decimal('amount_value', 15, 2)->nullable()->after('range_max');
            $table->json('allocation_weights')->nullable()->after('allocation_criteria');
        });
    }

    public function down(): void
    {
        Schema::table('bonus_pool_configurations', function (Blueprint $table) {
            $table->dropColumn([
                'ratio_value',
                'range_min',
                'range_max',
                'amount_value',
                'allocation_weights',
            ]);
        });
    }
};
