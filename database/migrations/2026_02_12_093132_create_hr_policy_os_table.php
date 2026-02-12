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
        Schema::create('hr_policy_os', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->string('status')->default('not_started');
            $table->json('policy_manual')->nullable();
            $table->json('system_handbook')->nullable();
            $table->json('implementation_roadmap')->nullable();
            $table->json('analytics_blueprint')->nullable();
            $table->json('customizations')->nullable();
            $table->timestamps();
            
            $table->unique('hr_project_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_policy_os');
    }
};
