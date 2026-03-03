<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobAnalysisIntro extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'title',
        'content',
        'version',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the active intro text by key.
     */
    public static function getActiveByKey(string $key): ?self
    {
        return self::where('key', $key)
            ->where('is_active', true)
            ->orderBy('version', 'desc')
            ->first();
    }
}
