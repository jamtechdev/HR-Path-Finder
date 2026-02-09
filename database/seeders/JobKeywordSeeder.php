<?php

namespace Database\Seeders;

use App\Models\JobKeyword;
use Illuminate\Database\Seeder;

class JobKeywordSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Common job keywords that apply to most industries
        $commonJobs = [
            'Accounting',
            'Finance',
            'HR',
            'General Affairs',
            'Treasury',
            'IT',
            'Business Planning',
            'Quality',
            'CS',
            'Procurement',
            'Logistics',
        ];

        foreach ($commonJobs as $index => $job) {
            JobKeyword::create([
                'name' => $job,
                'industry_category' => null, // Applies to all industries
                'company_size_range' => null, // Applies to all sizes
                'order' => $index + 1,
                'is_active' => true,
            ]);
        }

        // Manufacturing-specific jobs
        $manufacturingJobs = [
            'Process Engineering',
            'Product Development',
            'Production Management',
            'Quality Control',
            'Supply Chain Management',
        ];

        foreach ($manufacturingJobs as $index => $job) {
            JobKeyword::create([
                'name' => $job,
                'industry_category' => 'Manufacturing',
                'company_size_range' => null,
                'order' => $index + 1,
                'is_active' => true,
            ]);
        }

        // Technology-specific jobs
        $techJobs = [
            'Software Development',
            'Product Management',
            'Data Analytics',
            'Cybersecurity',
            'DevOps',
        ];

        foreach ($techJobs as $index => $job) {
            JobKeyword::create([
                'name' => $job,
                'industry_category' => 'Technology',
                'company_size_range' => null,
                'order' => $index + 1,
                'is_active' => true,
            ]);
        }

        // Finance-specific jobs
        $financeJobs = [
            'Risk Management',
            'Investment Analysis',
            'Compliance',
            'Internal Audit',
        ];

        foreach ($financeJobs as $index => $job) {
            JobKeyword::create([
                'name' => $job,
                'industry_category' => 'Finance',
                'company_size_range' => null,
                'order' => $index + 1,
                'is_active' => true,
            ]);
        }

        // Healthcare-specific jobs
        $healthcareJobs = [
            'Clinical Operations',
            'Regulatory Affairs',
            'Medical Affairs',
            'Quality Assurance',
        ];

        foreach ($healthcareJobs as $index => $job) {
            JobKeyword::create([
                'name' => $job,
                'industry_category' => 'Healthcare',
                'company_size_range' => null,
                'order' => $index + 1,
                'is_active' => true,
            ]);
        }

        $this->command->info('Job keywords seeded successfully!');
        $this->command->info('Total keywords created: ' . JobKeyword::count());
    }
}
