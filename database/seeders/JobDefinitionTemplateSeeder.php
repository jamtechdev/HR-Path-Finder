<?php

namespace Database\Seeders;

use App\Models\JobDefinitionTemplate;
use App\Models\JobKeyword;
use Illuminate\Database\Seeder;

class JobDefinitionTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get common job keywords (these should exist from JobKeywordSeeder)
        $accounting = JobKeyword::where('name', 'Accounting')->first();
        $finance = JobKeyword::where('name', 'Finance')->first();
        $hr = JobKeyword::where('name', 'HR')->first();
        $it = JobKeyword::where('name', 'IT')->first();
        $businessPlanning = JobKeyword::where('name', 'Business Planning')->first();
        
        if (!$accounting || !$hr || !$it || !$businessPlanning) {
            $this->command->warn('Some job keywords not found. Make sure JobKeywordSeeder runs before this seeder.');
            return;
        }

        $templates = [];

        // Accounting Template
        if ($accounting) {
            $templates[] = [
                'job_keyword_id' => $accounting->id,
                'industry_category' => null,
                'company_size_range' => null,
                'job_description' => "Manage and oversee all accounting operations including financial records, accounts payable/receivable, payroll, and financial reporting. Ensure compliance with accounting standards and regulations. Prepare monthly, quarterly, and annual financial statements.",
                'job_specification' => [
                    'education' => [
                        'required' => 'Bachelor\'s degree in Accounting, Finance, or related field',
                        'preferred' => 'CPA or equivalent certification'
                    ],
                    'experience' => [
                        'required' => '3+ years of accounting experience',
                        'preferred' => '5+ years in accounting, experience with ERP systems'
                    ],
                    'skills' => [
                        'required' => 'Proficiency in accounting software, Excel, financial analysis',
                        'preferred' => 'Knowledge of IFRS, tax regulations, audit experience'
                    ],
                    'communication' => [
                        'required' => 'Clear written and verbal communication',
                        'preferred' => 'Ability to explain complex financial concepts to non-financial stakeholders'
                    ]
                ],
                'competency_levels' => [
                    ['level' => 'LV1', 'description' => 'Junior Accountant: Handles basic bookkeeping, data entry, and assists with month-end closing'],
                    ['level' => 'LV2', 'description' => 'Accountant: Manages full accounting cycle, prepares financial statements, handles reconciliations'],
                    ['level' => 'LV3', 'description' => 'Senior Accountant: Oversees accounting operations, provides financial analysis, ensures compliance']
                ],
                'csfs' => [
                    ['name' => 'Accuracy in Financial Records', 'description' => 'Maintain accurate and complete financial records with zero tolerance for errors'],
                    ['name' => 'Timely Reporting', 'description' => 'Deliver financial reports and statements on schedule'],
                    ['name' => 'Compliance', 'description' => 'Ensure all accounting practices comply with regulations and standards'],
                    ['name' => 'Financial Analysis', 'description' => 'Provide meaningful financial insights to support business decisions']
                ],
                'is_active' => true,
            ];
        }

        // HR Template
        if ($hr) {
            $templates[] = [
                'job_keyword_id' => $hr->id,
                'industry_category' => null,
                'company_size_range' => null,
                'job_description' => "Manage human resources functions including recruitment, employee relations, performance management, compensation, and HR policies. Support organizational development and employee engagement initiatives.",
                'job_specification' => [
                    'education' => [
                        'required' => 'Bachelor\'s degree in Human Resources, Business Administration, or related field',
                        'preferred' => 'Master\'s degree in HR or HR certification (SHRM, PHR)'
                    ],
                    'experience' => [
                        'required' => '3+ years of HR experience',
                        'preferred' => '5+ years in HR, experience with HRIS systems, labor relations'
                    ],
                    'skills' => [
                        'required' => 'Knowledge of HR practices, employment law, recruitment, employee relations',
                        'preferred' => 'HR analytics, organizational development, change management, conflict resolution'
                    ],
                    'communication' => [
                        'required' => 'Strong interpersonal and communication skills',
                        'preferred' => 'Ability to handle sensitive situations, negotiation skills, presentation skills'
                    ]
                ],
                'competency_levels' => [
                    ['level' => 'LV1', 'description' => 'HR Coordinator: Handles administrative tasks, supports recruitment, maintains employee records'],
                    ['level' => 'LV2', 'description' => 'HR Specialist: Manages specific HR functions (recruitment, compensation, etc.), handles employee relations'],
                    ['level' => 'LV3', 'description' => 'HR Manager: Develops HR strategies, oversees all HR functions, supports organizational development']
                ],
                'csfs' => [
                    ['name' => 'Talent Acquisition', 'description' => 'Successfully recruit and onboard qualified candidates'],
                    ['name' => 'Employee Relations', 'description' => 'Maintain positive employee relations and resolve conflicts effectively'],
                    ['name' => 'HR Compliance', 'description' => 'Ensure compliance with labor laws and regulations'],
                    ['name' => 'Organizational Development', 'description' => 'Support organizational growth and employee development']
                ],
                'is_active' => true,
            ];
        }

        // IT Template
        if ($it) {
            $templates[] = [
                'job_keyword_id' => $it->id,
                'industry_category' => null,
                'company_size_range' => null,
                'job_description' => "Manage IT infrastructure, systems, and support services. Ensure system security, availability, and performance. Support business operations through technology solutions and manage IT projects.",
                'job_specification' => [
                    'education' => [
                        'required' => 'Bachelor\'s degree in Computer Science, Information Technology, or related field',
                        'preferred' => 'Master\'s degree or relevant IT certifications (CISSP, PMP, etc.)'
                    ],
                    'experience' => [
                        'required' => '3+ years of IT experience',
                        'preferred' => '5+ years in IT, experience with cloud infrastructure, cybersecurity, project management'
                    ],
                    'skills' => [
                        'required' => 'Technical skills in systems administration, networking, troubleshooting',
                        'preferred' => 'Cloud platforms (AWS, Azure), cybersecurity, database management, programming'
                    ],
                    'communication' => [
                        'required' => 'Ability to explain technical concepts to non-technical users',
                        'preferred' => 'Project management, vendor management, technical documentation'
                    ]
                ],
                'competency_levels' => [
                    ['level' => 'LV1', 'description' => 'IT Support: Provides technical support, troubleshoots issues, maintains systems'],
                    ['level' => 'LV2', 'description' => 'IT Specialist: Manages specific IT systems, implements solutions, handles complex technical issues'],
                    ['level' => 'LV3', 'description' => 'IT Manager: Develops IT strategy, oversees IT operations, manages IT projects and team']
                ],
                'csfs' => [
                    ['name' => 'System Availability', 'description' => 'Ensure high system uptime and availability'],
                    ['name' => 'Security', 'description' => 'Maintain robust cybersecurity and data protection'],
                    ['name' => 'Technical Support', 'description' => 'Provide timely and effective technical support'],
                    ['name' => 'Innovation', 'description' => 'Identify and implement technology solutions that improve business operations']
                ],
                'is_active' => true,
            ];
        }

        // Business Planning Template
        if ($businessPlanning) {
            $templates[] = [
                'job_keyword_id' => $businessPlanning->id,
                'industry_category' => null,
                'company_size_range' => null,
                'job_description' => "Develop and execute business strategies, plans, and initiatives. Conduct market analysis, financial planning, and performance monitoring. Support executive decision-making through data analysis and strategic insights.",
                'job_specification' => [
                    'education' => [
                        'required' => 'Bachelor\'s degree in Business Administration, Economics, or related field',
                        'preferred' => 'MBA or Master\'s degree in Business or Finance'
                    ],
                    'experience' => [
                        'required' => '3+ years in business planning, strategy, or consulting',
                        'preferred' => '5+ years in strategic planning, experience in management consulting, financial analysis'
                    ],
                    'skills' => [
                        'required' => 'Strategic thinking, financial analysis, data analysis, presentation skills',
                        'preferred' => 'Market research, competitive analysis, project management, business modeling'
                    ],
                    'communication' => [
                        'required' => 'Strong presentation and communication skills',
                        'preferred' => 'Executive presentation skills, stakeholder management, negotiation'
                    ]
                ],
                'competency_levels' => [
                    ['level' => 'LV1', 'description' => 'Business Analyst: Supports planning activities, conducts analysis, prepares reports'],
                    ['level' => 'LV2', 'description' => 'Business Planner: Develops business plans, conducts strategic analysis, supports decision-making'],
                    ['level' => 'LV3', 'description' => 'Strategic Planner: Develops long-term strategies, leads strategic initiatives, advises executives']
                ],
                'csfs' => [
                    ['name' => 'Strategic Planning', 'description' => 'Develop effective business strategies and plans'],
                    ['name' => 'Data Analysis', 'description' => 'Provide accurate and insightful data analysis'],
                    ['name' => 'Execution Support', 'description' => 'Support successful execution of business plans'],
                    ['name' => 'Decision Support', 'description' => 'Provide valuable insights to support executive decision-making']
                ],
                'is_active' => true,
            ];
        }

        foreach ($templates as $template) {
            JobDefinitionTemplate::updateOrCreate(
                [
                    'job_keyword_id' => $template['job_keyword_id'],
                    'industry_category' => $template['industry_category'],
                    'company_size_range' => $template['company_size_range'],
                ],
                $template
            );
        }

        $this->command->info('Job Definition Templates seeded successfully!');
        $this->command->info('Total templates created: ' . JobDefinitionTemplate::count());
    }
}
