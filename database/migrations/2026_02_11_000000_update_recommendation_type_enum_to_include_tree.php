<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For MySQL, we need to modify the enum
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE admin_comments MODIFY COLUMN recommendation_type ENUM('performance', 'compensation', 'tree') NULL");
        } else {
            // For other databases, drop and recreate
            Schema::table('admin_comments', function (Blueprint $table) {
                $table->dropColumn('recommendation_type');
            });
            
            Schema::table('admin_comments', function (Blueprint $table) {
                $table->enum('recommendation_type', ['performance', 'compensation', 'tree'])->nullable()->after('step');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE admin_comments MODIFY COLUMN recommendation_type ENUM('performance', 'compensation') NULL");
        } else {
            Schema::table('admin_comments', function (Blueprint $table) {
                $table->dropColumn('recommendation_type');
            });
            
            Schema::table('admin_comments', function (Blueprint $table) {
                $table->enum('recommendation_type', ['performance', 'compensation'])->nullable()->after('step');
            });
        }
    }
};
