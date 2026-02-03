<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConfidentialNote extends Model
{
    use HasFactory;

    protected $table = 'confidential_notes';

    protected $fillable = [
        'company_id',
        'notes',
    ];

    /**
     * Get the company that owns the confidential notes.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
