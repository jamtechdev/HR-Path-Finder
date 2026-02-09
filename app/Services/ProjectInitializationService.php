<?php

namespace App\Services;

use App\Enums\StepStatus;
use App\Models\Company;
use App\Models\HrProject;

class ProjectInitializationService
{
    /**
     * Initialize a new HR project for a company.
     */
    public function initialize(Company $company): HrProject
    {
        return HrProject::create([
            'company_id' => $company->id,
            'status' => \App\Enums\ProjectStatus::ACTIVE,
            'step_statuses' => [
                'diagnosis' => StepStatus::IN_PROGRESS->value,
                'organization' => StepStatus::NOT_STARTED->value,
                'performance' => StepStatus::NOT_STARTED->value,
                'compensation' => StepStatus::NOT_STARTED->value,
            ],
        ]);
    }
}
