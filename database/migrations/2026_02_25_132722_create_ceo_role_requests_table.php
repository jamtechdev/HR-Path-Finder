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
        Schema::create('ceo_role_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // HR Manager requesting
            $table->foreignId('company_id')->constrained()->onDelete('cascade'); // Company they want to be CEO for
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null'); // Admin who reviewed
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            
            // Ensure one pending request per user-company combination
            $table->unique(['user_id', 'company_id', 'status'], 'unique_pending_request');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ceo_role_requests');
    }
};
