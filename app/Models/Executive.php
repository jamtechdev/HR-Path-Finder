<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Executive extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'position_title',
        'number_of_executives',
        'is_custom',
    ];

    protected $casts = [
        'is_custom' => 'boolean',
        'number_of_executives' => 'integer',
    ];

    /**
     * Get the company that owns the executive record.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
