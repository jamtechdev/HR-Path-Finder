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
        Schema::table('company_invitations', function (Blueprint $table) {
            $table->foreignId('hr_project_id')->nullable()->after('company_id')->constrained('hr_projects')->onDelete('cascade');
            $table->index('hr_project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_invitations', function (Blueprint $table) {
            $table->dropForeign(['hr_project_id']);
            $table->dropIndex(['hr_project_id']);
            $table->dropColumn('hr_project_id');
        });
    }
};
