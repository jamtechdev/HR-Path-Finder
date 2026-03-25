<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_us_submissions', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('manager_name');
            $table->string('manager_email');
            $table->string('phone', 50)->nullable();
            $table->longText('inquiry');
            $table->boolean('agreed_personal_information')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_us_submissions');
    }
};

