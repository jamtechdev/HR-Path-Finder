<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IndustrySubCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'industry_category_id',
        'name',
        'order',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the category that owns this subcategory.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(IndustryCategory::class, 'industry_category_id');
    }

    /**
     * Get the industry category (alias for category).
     */
    public function industryCategory(): BelongsTo
    {
        return $this->belongsTo(IndustryCategory::class, 'industry_category_id');
    }
}
