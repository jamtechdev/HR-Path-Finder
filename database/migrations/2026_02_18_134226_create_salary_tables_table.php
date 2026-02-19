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
        Schema::create('salary_tables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hr_project_id')->constrained('hr_projects')->onDelete('cascade');
            $table->string('job_role');
            $table->string('grade');
            $table->integer('years_in_grade');
            $table->decimal('level_1', 15, 2)->nullable();
            $table->decimal('level_2', 15, 2)->nullable();
            $table->decimal('level_3', 15, 2)->nullable();
            $table->decimal('level_4', 15, 2)->nullable();
            $table->decimal('level_5', 15, 2)->nullable();
            $table->text('explanation')->nullable()->comment('Job role explanation');
            $table->integer('order')->default(0);
            $table->timestamps();
            
            $table->index(['hr_project_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_tables');
    }
};
