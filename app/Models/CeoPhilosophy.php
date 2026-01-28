<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CeoPhilosophy extends Model
{
    use HasFactory;

    protected $table = 'ceo_philosophy_surveys';

    protected $fillable = [
        'hr_project_id',
        'user_id',
        'responses',
        'main_trait',
        'sub_trait',
        'completed_at',
    ];

    protected $casts = [
        'responses' => 'array',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the HR project that owns the CEO philosophy.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }

    /**
     * Get the CEO user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
