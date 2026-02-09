<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IndustryCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'order',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the subcategories for this category.
     */
    public function subCategories(): HasMany
    {
        return $this->hasMany(IndustrySubCategory::class);
    }
}
