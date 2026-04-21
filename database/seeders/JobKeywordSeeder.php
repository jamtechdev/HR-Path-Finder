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
        $commonJobs = [
            ['slug' => 'accounting', 'name' => '회계'],
            ['slug' => 'finance', 'name' => '재무'],
            ['slug' => 'hr', 'name' => '인사'],
            ['slug' => 'general_affairs', 'name' => '총무'],
            ['slug' => 'treasury', 'name' => '자금'],
            ['slug' => 'it', 'name' => '정보기술(IT)'],
            ['slug' => 'business_planning', 'name' => '경영기획'],
            ['slug' => 'quality', 'name' => '품질'],
            ['slug' => 'cs', 'name' => '고객지원(CS)'],
            ['slug' => 'procurement', 'name' => '구매'],
            ['slug' => 'logistics', 'name' => '물류'],
        ];

        foreach ($commonJobs as $index => $job) {
            JobKeyword::updateOrCreate(
                ['slug' => $job['slug']],
                [
                    'name' => $job['name'],
                    'industry_category' => null,
                    'company_size_range' => null,
                    'order' => $index + 1,
                    'is_active' => true,
                ]
            );
        }

        $manufacturingJobs = [
            ['slug' => 'process_engineering', 'name' => '공정엔지니어링'],
            ['slug' => 'product_development', 'name' => '제품개발'],
            ['slug' => 'production_management', 'name' => '생산관리'],
            ['slug' => 'quality_control', 'name' => '품질관리'],
            ['slug' => 'supply_chain_management', 'name' => '공급망관리'],
        ];

        foreach ($manufacturingJobs as $index => $job) {
            JobKeyword::updateOrCreate(
                ['slug' => $job['slug']],
                [
                    'name' => $job['name'],
                    'industry_category' => 'Manufacturing',
                    'company_size_range' => null,
                    'order' => $index + 1,
                    'is_active' => true,
                ]
            );
        }

        $techJobs = [
            ['slug' => 'software_development', 'name' => '소프트웨어개발'],
            ['slug' => 'product_management', 'name' => '제품관리'],
            ['slug' => 'data_analytics', 'name' => '데이터분석'],
            ['slug' => 'cybersecurity', 'name' => '사이버보안'],
            ['slug' => 'devops', 'name' => 'DevOps'],
        ];

        foreach ($techJobs as $index => $job) {
            JobKeyword::updateOrCreate(
                ['slug' => $job['slug']],
                [
                    'name' => $job['name'],
                    'industry_category' => 'Technology',
                    'company_size_range' => null,
                    'order' => $index + 1,
                    'is_active' => true,
                ]
            );
        }

        $financeJobs = [
            ['slug' => 'risk_management', 'name' => '리스크관리'],
            ['slug' => 'investment_analysis', 'name' => '투자분석'],
            ['slug' => 'compliance', 'name' => '컴플라이언스'],
            ['slug' => 'internal_audit', 'name' => '내부감사'],
        ];

        foreach ($financeJobs as $index => $job) {
            JobKeyword::updateOrCreate(
                ['slug' => $job['slug']],
                [
                    'name' => $job['name'],
                    'industry_category' => 'Finance',
                    'company_size_range' => null,
                    'order' => $index + 1,
                    'is_active' => true,
                ]
            );
        }

        $healthcareJobs = [
            ['slug' => 'clinical_operations', 'name' => '임상운영'],
            ['slug' => 'regulatory_affairs', 'name' => '규제담당'],
            ['slug' => 'medical_affairs', 'name' => '메디컬어페어'],
            ['slug' => 'quality_assurance', 'name' => '품질보증(의료)'],
        ];

        foreach ($healthcareJobs as $index => $job) {
            JobKeyword::updateOrCreate(
                ['slug' => $job['slug']],
                [
                    'name' => $job['name'],
                    'industry_category' => 'Healthcare',
                    'company_size_range' => null,
                    'order' => $index + 1,
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('Job keywords seeded successfully!');
        $this->command->info('Total keywords: ' . JobKeyword::count());
    }
}
