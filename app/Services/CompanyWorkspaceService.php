<?php

namespace App\Services;

use App\Enums\CompanyRole;
use App\Enums\ProjectStatus;
use App\Enums\StepStatus;
use App\Models\Company;
use App\Models\HrProject;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CompanyWorkspaceService
{
    /**
     * Create a company workspace and initialize HR project.
     */
    public function create(array $data, User $hrManager): Company
    {
        return DB::transaction(function () use ($data, $hrManager) {
            // Create company
            $company = Company::create([
                'name' => $data['name'],
                'registration_number' => $data['registration_number'] ?? null,
                'hq_location' => $data['hq_location'] ?? null,
                'public_listing_status' => $data['public_listing_status'] ?? 'private',
                'logo_path' => $data['logo_path'] ?? null,
                'created_by' => $hrManager->id,
            ]);

            // Associate HR Manager as workspace member
            $company->users()->attach($hrManager->id, [
                'role' => CompanyRole::HR_MANAGER->value,
            ]);

            // Initialize HR Project with Diagnosis step IN_PROGRESS
            $project = HrProject::create([
                'company_id' => $company->id,
                'status' => ProjectStatus::ACTIVE,
                'step_statuses' => [
                    'diagnosis' => StepStatus::IN_PROGRESS->value,
                    'organization' => StepStatus::NOT_STARTED->value,
                    'performance' => StepStatus::NOT_STARTED->value,
                    'compensation' => StepStatus::NOT_STARTED->value,
                ],
            ]);

            return $company;
        });
    }
}
