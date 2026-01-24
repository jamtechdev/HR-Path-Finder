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
        Schema::create('hr_project_workforces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained()->onDelete('cascade');
            $table->integer('headcount_year_minus_2')->nullable();
            $table->integer('headcount_year_minus_1')->nullable();
            $table->integer('headcount_current')->nullable();
            $table->integer('total_employees')->nullable();
            $table->integer('contract_employees')->nullable();
            $table->string('org_chart_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_project_workforces');
    }
};
