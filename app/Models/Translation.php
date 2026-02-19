<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Translation extends Model
{
    use HasFactory;

    protected $fillable = [
        'locale',
        'namespace',
        'key',
        'value',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all translations for a specific locale and namespace.
     */
    public static function getTranslations(string $locale, string $namespace = 'translation'): array
    {
        return static::where('locale', $locale)
            ->where('namespace', $namespace)
            ->where('is_active', true)
            ->pluck('value', 'key')
            ->toArray();
    }

    /**
     * Get nested translations structure.
     */
    public static function getNestedTranslations(string $locale, string $namespace = 'translation'): array
    {
        $translations = static::where('locale', $locale)
            ->where('namespace', $namespace)
            ->where('is_active', true)
            ->get();

        $result = [];
        foreach ($translations as $translation) {
            $keys = explode('.', $translation->key);
            $current = &$result;
            foreach ($keys as $key) {
                if (!isset($current[$key])) {
                    $current[$key] = [];
                }
                $current = &$current[$key];
            }
            $current = $translation->value;
        }

        return $result;
    }
}
