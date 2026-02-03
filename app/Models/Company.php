<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'brand_name',
        'foundation_date',
        'hq_location',
        'industry',
        'secondary_industries',
        'size',
        'growth_stage',
        'logo_path',
        'image_path',
        'latitude',
        'longitude',
        'created_by',
    ];

    protected $casts = [
        'foundation_date' => 'date',
        'secondary_industries' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * Get the user who created the company.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the users that belong to the company.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'company_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get the HR projects for the company.
     */
    public function hrProjects(): HasMany
    {
        return $this->hasMany(HrProject::class);
    }

    /**
     * Get the invitations for the company.
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(CompanyInvitation::class);
    }
}
