<?php

namespace App\Services;

class DiagnosisCalculationService
{
    /**
     * Calculate gender ratio (male percentage).
     */
    public static function calculateGenderRatio(?int $male, ?int $female, ?int $other, ?int $total): ?float
    {
        if (!$total || $total <= 0) {
            return null;
        }

        $maleCount = $male ?? 0;
        return round(($maleCount / $total) * 100, 2);
    }

    /**
     * Calculate leadership percentage.
     */
    public static function calculateLeadershipPercentage(?int $leaders, ?int $workforce): ?float
    {
        if (!$workforce || $workforce <= 0 || !$leaders) {
            return null;
        }

        return round(($leaders / $workforce) * 100, 2);
    }

    /**
     * Validate gender composition.
     */
    public static function validateGenderComposition(?int $male, ?int $female, ?int $other, ?int $total): bool
    {
        $sum = ($male ?? 0) + ($female ?? 0) + ($other ?? 0);
        return $sum <= $total;
    }
}
