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
        Schema::create('organizational_kpis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->string('organization_name')->comment('Organization unit name from org chart');
            $table->string('kpi_name');
            $table->text('purpose')->nullable();
            $table->string('category')->nullable()->comment('KPI category');
            $table->foreignId('linked_job_id')->nullable()->constrained('job_definitions')->onDelete('set null');
            $table->string('linked_csf')->nullable()->comment('Linked Critical Success Factor');
            $table->text('formula')->nullable();
            $table->text('measurement_method')->nullable();
            $table->decimal('weight', 5, 2)->nullable()->comment('Weight percentage');
            $table->boolean('is_active')->default(true);
            $table->enum('status', ['draft', 'proposed', 'approved', 'revision_requested'])->default('draft');
            $table->text('revision_comment')->nullable();
            $table->timestamps();
            
            $table->index('hr_project_id');
            $table->index('organization_name');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizational_kpis');
    }
};
