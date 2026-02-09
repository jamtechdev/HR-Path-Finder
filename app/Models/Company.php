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
        'registration_number',
        'hq_location',
        'public_listing_status',
        'is_public',
        'logo_path',
        'created_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who created the company.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all users associated with this company.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'company_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get all HR projects for this company.
     */
    public function hrProjects(): HasMany
    {
        return $this->hasMany(HrProject::class);
    }

    /**
     * Get the active HR project for this company.
     */
    public function activeHrProject(): ?HrProject
    {
        return $this->hrProjects()->where('status', 'active')->first();
    }

    /**
     * Get the active HR project relationship (for eager loading).
     */
    public function activeHrProjectRelation()
    {
        return $this->hasOne(HrProject::class, 'company_id')->where('status', 'active');
    }

    /**
     * Get all company invitations.
     */
    public function invitations(): HasMany
    {
        return $this->hasMany(CompanyInvitation::class);
    }

    /**
     * Get HR managers for this company.
     */
    public function hrManagers(): BelongsToMany
    {
        return $this->users()->wherePivot('role', 'hr_manager');
    }

    /**
     * Get CEOs for this company.
     */
    public function ceos(): BelongsToMany
    {
        return $this->users()->wherePivot('role', 'ceo');
    }

    /**
     * Get consultants for this company.
     */
    public function consultants(): BelongsToMany
    {
        return $this->users()->wherePivot('role', 'consultant');
    }
}
