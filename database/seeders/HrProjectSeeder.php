<?php

namespace Database\Seeders;

use App\Models\CeoApproval;
use App\Models\CeoPhilosophy;
use App\Models\Company;
use App\Models\CompanyAttribute;
use App\Models\CompensationSystem;
use App\Models\ConsultantReview;
use App\Models\HrProject;
use App\Models\OrganizationDesign;
use App\Models\OrganizationalSentiment;
use App\Models\PerformanceSystem;
use App\Models\User;
use Illuminate\Database\Seeder;

class HrProjectSeeder extends Seeder
{
    public function run(): void
    {
        // Get or create users
        $hrManager = User::where('email', 'hr@example.com')->first();
        $ceo = User::where('email', 'ceo@example.com')->first();
        $consultant = User::where('email', 'consultant@example.com')->first();

        if (!$hrManager || !$ceo || !$consultant) {
            $this->command->warn('Please run DatabaseSeeder first to create users.');
            return;
        }

        // Create sample company
        $company = Company::create([
            'name' => 'Acme Corporation',
            'industry' => 'Technology',
            'size' => 'medium',
            'growth_stage' => 'growth',
            'created_by' => $hrManager->id,
        ]);

        $company->users()->attach([$hrManager->id, $ceo->id], ['role' => null]);

        // Create HR project
        $hrProject = HrProject::create([
            'company_id' => $company->id,
            'status' => 'completed',
            'current_step' => 'dashboard',
        ]);

        // Step 1: Diagnosis
        CompanyAttribute::create([
            'hr_project_id' => $hrProject->id,
            'job_standardization_level' => 4,
            'performance_measurability' => 4,
        ]);

        OrganizationalSentiment::create([
            'hr_project_id' => $hrProject->id,
            'openness_to_change' => 4,
            'trust_level' => 4,
            'evaluation_acceptance' => 4,
            'reward_sensitivity' => 4,
            'conflict_perception' => 2,
        ]);

        // Step 2: CEO Philosophy
        CeoPhilosophy::create([
            'hr_project_id' => $hrProject->id,
            'user_id' => $ceo->id,
            'responses' => ['question_1' => 'answer_1', 'question_2' => 'answer_2'],
            'main_trait' => 'democratic',
            'sub_trait' => 'collaborative',
            'completed_at' => now(),
        ]);

        // Step 3: Organization Design
        OrganizationDesign::create([
            'hr_project_id' => $hrProject->id,
            'structure_type' => 'team',
            'job_grade_structure' => 'multi',
            'grade_title_relationship' => 'integrated',
            'managerial_role_definition' => 'Team-based leadership',
            'submitted_at' => now(),
        ]);

        // Step 4: Performance System
        PerformanceSystem::create([
            'hr_project_id' => $hrProject->id,
            'performance_unit' => 'hybrid',
            'performance_method' => 'okr',
            'evaluation_structure_quantitative' => 'hybrid',
            'evaluation_structure_relative' => 'relative',
            'submitted_at' => now(),
        ]);

        // Step 5: Compensation System
        CompensationSystem::create([
            'hr_project_id' => $hrProject->id,
            'compensation_structure' => 'mixed',
            'differentiation_method' => 'incentive',
            'incentive_components' => ['individual', 'organizational'],
            'submitted_at' => now(),
        ]);

        // Step 6: Consultant Review
        ConsultantReview::create([
            'hr_project_id' => $hrProject->id,
            'consultant_id' => $consultant->id,
            'opinions' => 'The HR system design is well-aligned with the company\'s growth stage and CEO philosophy.',
            'risk_notes' => 'Monitor team structure effectiveness as company scales.',
            'alignment_observations' => 'High alignment between democratic leadership and team structure.',
            'reviewed_at' => now(),
        ]);

        // Step 7: CEO Approval
        CeoApproval::create([
            'hr_project_id' => $hrProject->id,
            'ceo_id' => $ceo->id,
            'status' => 'approved',
            'comments' => 'Approved. Ready to implement.',
            'approved_at' => now(),
        ]);

        $this->command->info('Sample HR project created successfully!');
    }
}
