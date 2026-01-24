<?php

namespace App\Services;

use App\Models\HrProject;

class ValidationService
{
    /**
     * Validate logical consistency between steps.
     */
    public function validateLogicalConsistency(HrProject $project, string $step, array $data): array
    {
        $errors = [];
        $warnings = [];

        switch ($step) {
            case 'organization':
                $errors = array_merge($errors, $this->validateOrganizationDesign($data, $project));
                break;

            case 'performance':
                $errors = array_merge($errors, $this->validatePerformanceSystem($data, $project));
                $warnings = array_merge($warnings, $this->checkPerformanceWarnings($data, $project));
                break;

            case 'compensation':
                $errors = array_merge($errors, $this->validateCompensationSystem($data, $project));
                $warnings = array_merge($warnings, $this->checkCompensationWarnings($data, $project));
                break;
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings,
        ];
    }

    /**
     * Validate organization design.
     */
    protected function validateOrganizationDesign(array $data, HrProject $project): array
    {
        $errors = [];

        // CEO philosophy alignment check
        if ($project->ceoPhilosophy) {
            $philosophy = $project->ceoPhilosophy->main_trait;
            if ($philosophy === 'autocratic' && $data['structure_type'] === 'team') {
                $errors[] = 'Autocratic leadership style is incompatible with team-based structure.';
            }
        }

        return $errors;
    }

    /**
     * Validate performance system.
     */
    protected function validatePerformanceSystem(array $data, HrProject $project): array
    {
        $errors = [];

        // Check if organization design supports the performance unit
        if ($project->organizationDesign) {
            $orgType = $project->organizationDesign->structure_type;
            if ($orgType === 'functional' && $data['performance_unit'] === 'organization') {
                $errors[] = 'Functional structure typically requires individual or hybrid performance units.';
            }
        }

        return $errors;
    }

    /**
     * Check performance system warnings.
     */
    protected function checkPerformanceWarnings(array $data, HrProject $project): array
    {
        $warnings = [];

        // Check measurability alignment
        if ($project->companyAttributes) {
            $measurability = $project->companyAttributes->performance_measurability;
            if ($measurability < 3 && in_array($data['performance_method'], ['kpi', 'bsc'])) {
                $warnings[] = 'Low performance measurability may make quantitative methods challenging.';
            }
        }

        return $warnings;
    }

    /**
     * Validate compensation system.
     */
    protected function validateCompensationSystem(array $data, HrProject $project): array
    {
        $errors = [];

        // Check if performance system supports performance-based compensation
        if ($project->performanceSystem) {
            $perfMethod = $project->performanceSystem->performance_method;
            if ($data['compensation_structure'] === 'performance_based' && $perfMethod === null) {
                $errors[] = 'Performance-based compensation requires a defined performance system.';
            }
        }

        return $errors;
    }

    /**
     * Check compensation system warnings.
     */
    protected function checkCompensationWarnings(array $data, HrProject $project): array
    {
        $warnings = [];

        // Check reward sensitivity alignment
        if ($project->organizationalSentiment) {
            $sensitivity = $project->organizationalSentiment->reward_sensitivity;
            if ($sensitivity < 3 && $data['compensation_structure'] === 'performance_based') {
                $warnings[] = 'Low reward sensitivity may reduce effectiveness of performance-based compensation.';
            }
        }

        return $warnings;
    }

    /**
     * Block incompatible combinations.
     */
    public function blockIncompatibleCombinations(string $step, array $selections, HrProject $project): bool
    {
        $validation = $this->validateLogicalConsistency($project, $step, $selections);
        return $validation['valid'];
    }
}
