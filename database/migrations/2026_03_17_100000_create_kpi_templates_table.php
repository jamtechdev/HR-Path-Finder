<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kpi_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->string('org_unit_name')->nullable()->comment('Org unit name; null = company-wide template');
            $table->string('kpi_name');
            $table->text('purpose')->nullable();
            $table->string('category')->nullable();
            $table->text('formula')->nullable();
            $table->text('measurement_method')->nullable();
            $table->decimal('weight', 8, 2)->default(0);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kpi_templates');
    }
};
