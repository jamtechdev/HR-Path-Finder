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
        Schema::table('ceo_philosophies', function (Blueprint $table) {
            $table->json('management_philosophy_responses')->nullable()->after('survey_responses');
            $table->json('vision_mission_responses')->nullable()->after('management_philosophy_responses');
            $table->string('growth_stage')->nullable()->after('vision_mission_responses');
            $table->json('leadership_responses')->nullable()->after('growth_stage');
            $table->json('general_responses')->nullable()->after('leadership_responses');
            $table->json('organizational_issues')->nullable()->after('general_responses');
            $table->text('concerns')->nullable()->after('organizational_issues');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ceo_philosophies', function (Blueprint $table) {
            //
        });
    }
};
