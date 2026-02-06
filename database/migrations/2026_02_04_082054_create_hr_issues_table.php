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
        Schema::create('hr_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('issue_type')->comment('Type of HR/Org issue (e.g., Recruitment, Retention, Evaluation, Leadership, Upskilling)');
            $table->boolean('is_custom')->default(false)->comment('Whether this is a custom issue added by user');
            $table->text('description')->nullable()->comment('Additional description or notes about the issue');
            $table->timestamps();
            
            // Index for faster queries
            $table->index('company_id');
            $table->index('issue_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hr_issues');
    }
};
