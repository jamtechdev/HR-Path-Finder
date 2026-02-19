<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LandingPageSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_key',
        'section_type',
        'content',
        'locale',
        'order',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
        'metadata' => 'array',
    ];

    /**
     * Get all active sections for a locale, ordered by order field.
     */
    public static function getActiveSections(string $locale = 'ko'): array
    {
        return static::where('locale', $locale)
            ->where('is_active', true)
            ->orderBy('order')
            ->get()
            ->mapWithKeys(function ($section) {
                return [$section->section_key => [
                    'content' => $section->content,
                    'type' => $section->section_type,
                    'metadata' => $section->metadata,
                ]];
            })
            ->toArray();
    }

    /**
     * Get a specific section by key and locale.
     */
    public static function getSection(string $key, string $locale = 'ko', $default = null)
    {
        $section = static::where('section_key', $key)
            ->where('locale', $locale)
            ->where('is_active', true)
            ->first();

        return $section ? $section->content : $default;
    }
}
