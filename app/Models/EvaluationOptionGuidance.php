<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationOptionGuidance extends Model
{
    use HasFactory;

    protected $fillable = [
        'option_key',
        'option_value',
        'concept',
        'key_characteristics',
        'example',
        'pros',
        'cons',
        'best_fit_organizations',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get active guidance by option key and value.
     */
    public static function getActiveByOption(string $optionKey, string $optionValue): ?self
    {
        return self::where('option_key', $optionKey)
            ->where('option_value', $optionValue)
            ->where('is_active', true)
            ->first();
    }
}
