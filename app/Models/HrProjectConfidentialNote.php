<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HrProjectConfidentialNote extends Model
{
    use HasFactory;

    protected $table = 'hr_project_confidential_notes';

    protected $fillable = [
        'hr_project_id',
        'notes',
    ];

    /**
     * Get the HR project that owns the confidential notes.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
