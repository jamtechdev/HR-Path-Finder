<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CeoApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'hr_project_id',
        'ceo_id',
        'status',
        'comments',
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    /**
     * Get the HR project that owns the CEO approval.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }

    /**
     * Get the CEO user.
     */
    public function ceo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'ceo_id');
    }
}
