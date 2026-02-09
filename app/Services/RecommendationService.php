<?php

namespace App\Services;

use App\Models\CeoPhilosophy;
use App\Models\Company;
use App\Models\CompanyAttribute;
use App\Models\HrProject;
use App\Models\OrganizationalSentiment;
use App\Data\RecommendationRules;

class RecommendationService
{
    public function __construct(
        protected RecommendationRules $rules
    ) {
    }

    /**
     * Get recommended organization structure based on diagnostics.
     */
    public function getRecommendedOrganizationStructure(
        ?CompanyAttribute $attributes = null,
        ?CeoPhilosophy $philosophy = null,
        ?OrganizationalSentiment $sentiment = null,
        ?Company $company = null
    ): array {
        $recommendations = [];
        $allOptions = ['functional', 'team', 'divisional', 'matrix'];

        foreach ($allOptions as $option) {
            $score = 0;
            $reasons = [];

            // Company growth stage influence (from CompanyAttribute)
            if ($attributes && $attributes->growth_stage) {
                $growthRules = $this->rules->getGrowthStageRules($attributes->growth_stage);
                if (isset($growthRules['organization'][$option])) {
                    $score += $growthRules['organization'][$option]['weight'];
                    $reasons[] = $growthRules['organization'][$option]['reason'];
                }
            }

            // CEO philosophy influence
            if ($philosophy && $philosophy->main_trait) {
                $philosophyRules = $this->rules->getPhilosophyRules($philosophy->main_trait);
                if (isset($philosophyRules['organization'][$option])) {
                    $score += $philosophyRules['organization'][$option]['weight'];
                    $reasons[] = $philosophyRules['organization'][$option]['reason'];
                }
            }

            // Job standardization influence
            if ($attributes && $attributes->job_standardization_level) {
                if ($attributes->job_standardization_level >= 4 && in_array($option, ['functional', 'divisional'])) {
                    $score += 2;
                    $reasons[] = 'High job standardization favors structured organizations';
                }
            }

            $recommendations[$option] = [
                'score' => $score,
                'reasons' => $reasons,
                'recommended' => false,
            ];
        }

        // Mark highest scoring option as recommended
        $maxScore = max(array_column($recommendations, 'score'));
        foreach ($recommendations as $option => &$data) {
            if ($data['score'] === $maxScore && $maxScore > 0) {
                $data['recommended'] = true;
            }
        }

        return $recommendations;
    }

    /**
     * Get recommended performance method.
     */
    public function getRecommendedPerformanceMethod(
        HrProject $project
    ): array {
        $recommendations = [];
        $allOptions = ['kpi', 'mbo', 'okr', 'bsc'];

        $organizationDesign = $project->organizationDesign;
        $philosophy = $project->ceoPhilosophy;
        $attributes = $project->companyAttributes;
        $company = $project->company;

        foreach ($allOptions as $option) {
            $score = 0;
            $reasons = [];

            // Organization structure influence
            if ($organizationDesign && $organizationDesign->structure_type) {
                $orgRules = $this->rules->getOrganizationPerformanceRules($organizationDesign->structure_type);
                if (isset($orgRules[$option])) {
                    $score += $orgRules[$option]['weight'];
                    $reasons[] = $orgRules[$option]['reason'];
                }
            }

            // CEO philosophy influence
            if ($philosophy && $philosophy->main_trait) {
                $philosophyRules = $this->rules->getPhilosophyRules($philosophy->main_trait);
                if (isset($philosophyRules['performance'][$option])) {
                    $score += $philosophyRules['performance'][$option]['weight'];
                    $reasons[] = $philosophyRules['performance'][$option]['reason'];
                }
            }

            // Performance measurability influence
            if ($attributes && $attributes->performance_measurability) {
                if ($attributes->performance_measurability >= 4 && in_array($option, ['kpi', 'bsc'])) {
                    $score += 2;
                    $reasons[] = 'High measurability favors quantitative methods';
                }
            }

            $recommendations[$option] = [
                'score' => $score,
                'reasons' => $reasons,
                'recommended' => false,
            ];
        }

        // Mark highest scoring option as recommended
        $maxScore = max(array_column($recommendations, 'score'));
        foreach ($recommendations as $option => &$data) {
            if ($data['score'] === $maxScore && $maxScore > 0) {
                $data['recommended'] = true;
            }
        }

        return $recommendations;
    }

    /**
     * Get recommended compensation structure.
     */
    public function getRecommendedCompensationStructure(
        HrProject $project
    ): array {
        $recommendations = [];
        $allOptions = ['fixed', 'mixed', 'performance_based'];

        $performanceSystem = $project->performanceSystem;
        $philosophy = $project->ceoPhilosophy;
        $sentiment = $project->organizationalSentiment;

        foreach ($allOptions as $option) {
            $score = 0;
            $reasons = [];

            // Performance system influence
            if ($performanceSystem && $performanceSystem->performance_method) {
                $perfRules = $this->rules->getPerformanceCompensationRules($performanceSystem->performance_method);
                if (isset($perfRules[$option])) {
                    $score += $perfRules[$option]['weight'];
                    $reasons[] = $perfRules[$option]['reason'];
                }
            }

            // Reward sensitivity influence
            if ($sentiment && $sentiment->reward_sensitivity) {
                if ($sentiment->reward_sensitivity >= 4 && $option === 'performance_based') {
                    $score += 2;
                    $reasons[] = 'High reward sensitivity favors performance-based compensation';
                } elseif ($sentiment->reward_sensitivity <= 2 && $option === 'fixed') {
                    $score += 2;
                    $reasons[] = 'Low reward sensitivity favors fixed compensation';
                }
            }

            $recommendations[$option] = [
                'score' => $score,
                'reasons' => $reasons,
                'recommended' => false,
            ];
        }

        // Mark highest scoring option as recommended
        $maxScore = max(array_column($recommendations, 'score'));
        foreach ($recommendations as $option => &$data) {
            if ($data['score'] === $maxScore && $maxScore > 0) {
                $data['recommended'] = true;
            }
        }

        return $recommendations;
    }

    /**
     * Validate compatibility between steps.
     */
    public function validateCompatibility(string $step, array $selections, HrProject $project): array
    {
        $warnings = [];
        $errors = [];

        switch ($step) {
            case 'organization':
                // Validate organization design compatibility
                if (isset($selections['structure_type']) && isset($selections['job_grade_structure'])) {
                    $compatibility = $this->rules->validateOrganizationCompatibility(
                        $selections['structure_type'],
                        $selections['job_grade_structure']
                    );
                    if (!$compatibility['valid']) {
                        $errors[] = $compatibility['message'];
                    }
                }
                break;

            case 'performance':
                // Validate performance system compatibility with organization
                if ($project->organizationDesign) {
                    $compatibility = $this->rules->validatePerformanceCompatibility(
                        $selections,
                        $project->organizationDesign
                    );
                    if (!$compatibility['valid']) {
                        $warnings[] = $compatibility['message'];
                    }
                }
                break;

            case 'compensation':
                // Validate compensation compatibility with performance system
                if ($project->performanceSystem) {
                    $compatibility = $this->rules->validateCompensationCompatibility(
                        $selections,
                        $project->performanceSystem
                    );
                    if (!$compatibility['valid']) {
                        $warnings[] = $compatibility['message'];
                    }
                }
                break;
        }

        return [
            'valid' => empty($errors),
            'warnings' => $warnings,
            'errors' => $errors,
        ];
    }
}
