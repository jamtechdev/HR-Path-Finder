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
        Schema::create('kpi_review_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->string('organization_name');
            $table->string('token', 64)->unique();
            $table->string('email');
            $table->string('name')->nullable();
            $table->timestamp('expires_at');
            $table->integer('max_uses')->default(1);
            $table->integer('uses_count')->default(0);
            $table->boolean('is_used')->default(false);
            $table->timestamps();
            
            $table->index('token');
            $table->index('hr_project_id');
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kpi_review_tokens');
    }
};
