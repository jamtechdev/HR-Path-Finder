<?php

namespace App\Data;

class RecommendationRules
{
    /**
     * Get rules based on company growth stage.
     */
    public function getGrowthStageRules(string $growthStage): array
    {
        return match ($growthStage) {
            'early' => [
                'organization' => [
                    'functional' => ['weight' => 3, 'reason' => 'Early stage companies benefit from functional structure'],
                    'team' => ['weight' => 4, 'reason' => 'Team structure supports agility in early stage'],
                    'divisional' => ['weight' => 1, 'reason' => 'Divisional structure is too complex for early stage'],
                    'matrix' => ['weight' => 1, 'reason' => 'Matrix structure is too complex for early stage'],
                ],
            ],
            'growth' => [
                'organization' => [
                    'functional' => ['weight' => 3, 'reason' => 'Functional structure supports growth'],
                    'team' => ['weight' => 3, 'reason' => 'Team structure maintains agility'],
                    'divisional' => ['weight' => 4, 'reason' => 'Divisional structure scales well in growth stage'],
                    'matrix' => ['weight' => 2, 'reason' => 'Matrix structure can work but adds complexity'],
                ],
            ],
            'maturity' => [
                'organization' => [
                    'functional' => ['weight' => 4, 'reason' => 'Functional structure suits mature organizations'],
                    'team' => ['weight' => 2, 'reason' => 'Team structure less common in maturity'],
                    'divisional' => ['weight' => 4, 'reason' => 'Divisional structure common in mature companies'],
                    'matrix' => ['weight' => 3, 'reason' => 'Matrix structure works in mature organizations'],
                ],
            ],
            'decline' => [
                'organization' => [
                    'functional' => ['weight' => 4, 'reason' => 'Functional structure helps streamline in decline'],
                    'team' => ['weight' => 2, 'reason' => 'Team structure less effective in decline'],
                    'divisional' => ['weight' => 3, 'reason' => 'Divisional structure may need consolidation'],
                    'matrix' => ['weight' => 1, 'reason' => 'Matrix structure adds complexity in decline'],
                ],
            ],
            default => [],
        };
    }

    /**
     * Get rules based on CEO philosophy.
     */
    public function getPhilosophyRules(string $trait): array
    {
        return match ($trait) {
            'autocratic' => [
                'organization' => [
                    'functional' => ['weight' => 4, 'reason' => 'Autocratic style works well with functional structure'],
                    'team' => ['weight' => 1, 'reason' => 'Team structure conflicts with autocratic style'],
                    'divisional' => ['weight' => 3, 'reason' => 'Divisional structure can work with autocratic style'],
                    'matrix' => ['weight' => 1, 'reason' => 'Matrix structure conflicts with autocratic style'],
                ],
                'performance' => [
                    'kpi' => ['weight' => 4, 'reason' => 'KPI aligns with autocratic measurement focus'],
                    'mbo' => ['weight' => 3, 'reason' => 'MBO can work with autocratic style'],
                    'okr' => ['weight' => 1, 'reason' => 'OKR conflicts with autocratic style'],
                    'bsc' => ['weight' => 3, 'reason' => 'BSC provides structured measurement'],
                ],
            ],
            'democratic' => [
                'organization' => [
                    'functional' => ['weight' => 2, 'reason' => 'Functional structure less collaborative'],
                    'team' => ['weight' => 4, 'reason' => 'Team structure aligns with democratic style'],
                    'divisional' => ['weight' => 2, 'reason' => 'Divisional structure less collaborative'],
                    'matrix' => ['weight' => 3, 'reason' => 'Matrix structure supports collaboration'],
                ],
                'performance' => [
                    'kpi' => ['weight' => 2, 'reason' => 'KPI less collaborative'],
                    'mbo' => ['weight' => 3, 'reason' => 'MBO supports participation'],
                    'okr' => ['weight' => 4, 'reason' => 'OKR highly collaborative'],
                    'bsc' => ['weight' => 3, 'reason' => 'BSC can be collaborative'],
                ],
            ],
            'laissez_faire' => [
                'organization' => [
                    'functional' => ['weight' => 2, 'reason' => 'Functional structure too structured'],
                    'team' => ['weight' => 4, 'reason' => 'Team structure supports autonomy'],
                    'divisional' => ['weight' => 3, 'reason' => 'Divisional structure provides autonomy'],
                    'matrix' => ['weight' => 2, 'reason' => 'Matrix structure adds complexity'],
                ],
                'performance' => [
                    'kpi' => ['weight' => 2, 'reason' => 'KPI too prescriptive'],
                    'mbo' => ['weight' => 3, 'reason' => 'MBO provides flexibility'],
                    'okr' => ['weight' => 4, 'reason' => 'OKR supports autonomy'],
                    'bsc' => ['weight' => 2, 'reason' => 'BSC too structured'],
                ],
            ],
            default => [],
        };
    }

    /**
     * Get organization to performance method rules.
     */
    public function getOrganizationPerformanceRules(string $orgType): array
    {
        return match ($orgType) {
            'functional' => [
                'kpi' => ['weight' => 4, 'reason' => 'KPI works well with functional structure'],
                'mbo' => ['weight' => 3, 'reason' => 'MBO suitable for functional structure'],
                'okr' => ['weight' => 2, 'reason' => 'OKR less common in functional structures'],
                'bsc' => ['weight' => 4, 'reason' => 'BSC aligns with functional structure'],
            ],
            'team' => [
                'kpi' => ['weight' => 2, 'reason' => 'KPI less collaborative'],
                'mbo' => ['weight' => 3, 'reason' => 'MBO supports team collaboration'],
                'okr' => ['weight' => 4, 'reason' => 'OKR highly suitable for teams'],
                'bsc' => ['weight' => 2, 'reason' => 'BSC less common in teams'],
            ],
            'divisional' => [
                'kpi' => ['weight' => 3, 'reason' => 'KPI works with divisional structure'],
                'mbo' => ['weight' => 3, 'reason' => 'MBO suitable for divisions'],
                'okr' => ['weight' => 3, 'reason' => 'OKR can work in divisions'],
                'bsc' => ['weight' => 4, 'reason' => 'BSC excellent for divisional structure'],
            ],
            'matrix' => [
                'kpi' => ['weight' => 3, 'reason' => 'KPI supports matrix measurement'],
                'mbo' => ['weight' => 3, 'reason' => 'MBO works in matrix'],
                'okr' => ['weight' => 3, 'reason' => 'OKR supports matrix collaboration'],
                'bsc' => ['weight' => 4, 'reason' => 'BSC excellent for matrix structure'],
            ],
            default => [],
        };
    }

    /**
     * Get performance to compensation rules.
     */
    public function getPerformanceCompensationRules(string $perfMethod): array
    {
        return match ($perfMethod) {
            'kpi' => [
                'fixed' => ['weight' => 2, 'reason' => 'KPI supports variable compensation'],
                'mixed' => ['weight' => 4, 'reason' => 'Mixed compensation aligns with KPI'],
                'performance_based' => ['weight' => 4, 'reason' => 'Performance-based works with KPI'],
            ],
            'mbo' => [
                'fixed' => ['weight' => 2, 'reason' => 'MBO supports variable compensation'],
                'mixed' => ['weight' => 4, 'reason' => 'Mixed compensation aligns with MBO'],
                'performance_based' => ['weight' => 3, 'reason' => 'Performance-based works with MBO'],
            ],
            'okr' => [
                'fixed' => ['weight' => 2, 'reason' => 'OKR supports variable compensation'],
                'mixed' => ['weight' => 3, 'reason' => 'Mixed compensation can work with OKR'],
                'performance_based' => ['weight' => 4, 'reason' => 'Performance-based aligns with OKR'],
            ],
            'bsc' => [
                'fixed' => ['weight' => 2, 'reason' => 'BSC supports variable compensation'],
                'mixed' => ['weight' => 4, 'reason' => 'Mixed compensation aligns with BSC'],
                'performance_based' => ['weight' => 4, 'reason' => 'Performance-based works with BSC'],
            ],
            default => [],
        };
    }

    /**
     * Validate organization design compatibility.
     */
    public function validateOrganizationCompatibility(string $structureType, string $jobGradeStructure): array
    {
        // All combinations are generally valid, but some are less common
        if ($structureType === 'team' && $jobGradeStructure === 'multi') {
            return [
                'valid' => true,
                'message' => 'Team structure with multi-grade is less common but valid.',
            ];
        }

        return ['valid' => true, 'message' => ''];
    }

    /**
     * Validate performance system compatibility.
     */
    public function validatePerformanceCompatibility(array $selections, $organizationDesign): array
    {
        // Check if performance unit aligns with organization type
        if ($organizationDesign->structure_type === 'functional' && $selections['performance_unit'] === 'organization') {
            return [
                'valid' => false,
                'message' => 'Functional structure typically requires individual or hybrid performance units.',
            ];
        }

        return ['valid' => true, 'message' => ''];
    }

    /**
     * Validate compensation compatibility.
     */
    public function validateCompensationCompatibility(array $selections, $performanceSystem): array
    {
        // Performance-based compensation requires a performance method
        if ($selections['compensation_structure'] === 'performance_based' && !$performanceSystem->performance_method) {
            return [
                'valid' => false,
                'message' => 'Performance-based compensation requires a defined performance system.',
            ];
        }

        return ['valid' => true, 'message' => ''];
    }
}
