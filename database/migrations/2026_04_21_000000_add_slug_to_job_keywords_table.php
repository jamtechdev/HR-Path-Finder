<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('job_keywords', function (Blueprint $table) {
            $table->string('slug')->nullable()->unique()->after('id');
        });

        $map = [
            'Accounting' => 'accounting',
            'Finance' => 'finance',
            'HR' => 'hr',
            'General Affairs' => 'general_affairs',
            'Treasury' => 'treasury',
            'IT' => 'it',
            'Business Planning' => 'business_planning',
            'Quality' => 'quality',
            'CS' => 'cs',
            'Procurement' => 'procurement',
            'Logistics' => 'logistics',
            'Process Engineering' => 'process_engineering',
            'Product Development' => 'product_development',
            'Production Management' => 'production_management',
            'Quality Control' => 'quality_control',
            'Supply Chain Management' => 'supply_chain_management',
            'Software Development' => 'software_development',
            'Product Management' => 'product_management',
            'Data Analytics' => 'data_analytics',
            'Cybersecurity' => 'cybersecurity',
            'DevOps' => 'devops',
            'Risk Management' => 'risk_management',
            'Investment Analysis' => 'investment_analysis',
            'Compliance' => 'compliance',
            'Internal Audit' => 'internal_audit',
            'Clinical Operations' => 'clinical_operations',
            'Regulatory Affairs' => 'regulatory_affairs',
            'Medical Affairs' => 'medical_affairs',
            'Quality Assurance' => 'quality_assurance',
        ];

        foreach ($map as $name => $slug) {
            DB::table('job_keywords')->where('name', $name)->whereNull('slug')->update(['slug' => $slug]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_keywords', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
