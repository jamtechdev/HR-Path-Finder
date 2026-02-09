<?php

namespace App\Services;

use App\Models\Diagnosis;
use App\Models\HrProject;

class DiagnosisSnapshotService
{
    /**
     * Create a frozen snapshot of diagnosis data.
     * This ensures the diagnosis data cannot be changed after approval.
     */
    public function createSnapshot(HrProject $project): array
    {
        $diagnosis = $project->diagnosis;
        
        if (!$diagnosis) {
            throw new \Exception('Diagnosis not found for project');
        }

        // Return all diagnosis data as array (frozen snapshot)
        return [
            'id' => $diagnosis->id,
            'hr_project_id' => $diagnosis->hr_project_id,
            'industry_category' => $diagnosis->industry_category,
            'industry_subcategory' => $diagnosis->industry_subcategory,
            'industry_other' => $diagnosis->industry_other,
            'present_headcount' => $diagnosis->present_headcount,
            'expected_headcount_1y' => $diagnosis->expected_headcount_1y,
            'expected_headcount_2y' => $diagnosis->expected_headcount_2y,
            'expected_headcount_3y' => $diagnosis->expected_headcount_3y,
            'average_tenure_active' => $diagnosis->average_tenure_active,
            'average_tenure_leavers' => $diagnosis->average_tenure_leavers,
            'average_age' => $diagnosis->average_age,
            'gender_male' => $diagnosis->gender_male,
            'gender_female' => $diagnosis->gender_female,
            'gender_other' => $diagnosis->gender_other,
            'gender_ratio' => $diagnosis->gender_ratio,
            'total_executives' => $diagnosis->total_executives,
            'executive_positions' => $diagnosis->executive_positions,
            'leadership_count' => $diagnosis->leadership_count,
            'leadership_percentage' => $diagnosis->leadership_percentage,
            'job_grade_names' => $diagnosis->job_grade_names,
            'promotion_years' => $diagnosis->promotion_years,
            'organizational_charts' => $diagnosis->organizational_charts,
            'org_structure_types' => $diagnosis->org_structure_types,
            'org_structure_explanations' => $diagnosis->org_structure_explanations,
            'hr_issues' => $diagnosis->hr_issues,
            'custom_hr_issues' => $diagnosis->custom_hr_issues,
            'snapshot_created_at' => now()->toDateTimeString(),
        ];
    }
}
