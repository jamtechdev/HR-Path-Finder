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
        Schema::create('kpi_edit_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kpi_id')->constrained('organizational_kpis')->onDelete('cascade');
            $table->string('editor_name')->nullable()->comment('Organization manager name');
            $table->string('editor_email')->nullable();
            $table->string('action')->comment('created, updated, deleted');
            $table->json('old_values')->nullable()->comment('Previous values before change');
            $table->json('new_values')->nullable()->comment('New values after change');
            $table->text('change_description')->nullable();
            $table->timestamps();
            
            $table->index('kpi_id');
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
