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
        if (Schema::hasTable('kpi_edit_history')) {
            return;
        }
        
        Schema::create('kpi_edit_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizational_kpi_id')->constrained('organizational_kpis')->onDelete('cascade');
            $table->string('edited_by_type')->comment('hr_manager, org_manager, ceo');
            $table->unsignedBigInteger('edited_by_id')->nullable();
            $table->string('edited_by_name')->nullable();
            $table->json('changes')->comment('JSON object with before/after values');
            $table->timestamps();
            
            $table->index('organizational_kpi_id');
            $table->index('edited_by_type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kpi_edit_history');
    }
};
