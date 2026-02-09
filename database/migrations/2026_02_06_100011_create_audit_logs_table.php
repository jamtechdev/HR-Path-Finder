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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('action')->comment('e.g., update, approve, lock');
            $table->string('model_type')->nullable()->comment('Model class name');
            $table->unsignedBigInteger('model_id')->nullable();
            $table->json('changes')->nullable()->comment('JSON: {field: {old: value, new: value}}');
            $table->timestamps();
            
            $table->index('hr_project_id');
            $table->index('user_id');
            $table->index(['model_type', 'model_id']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
