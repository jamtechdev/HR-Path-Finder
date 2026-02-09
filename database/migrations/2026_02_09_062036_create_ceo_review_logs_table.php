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
        Schema::create('ceo_review_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->string('field_name')->comment('Name of the field that was modified');
            $table->string('field_type')->comment('Type: company, diagnosis, etc.');
            $table->text('original_value')->nullable();
            $table->text('modified_value')->nullable();
            $table->foreignId('modified_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index('hr_project_id');
            $table->index('modified_by');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ceo_review_logs');
    }
};
