<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayBandZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'pay_band_id',
        'zone_type',
        'min_value',
        'max_value',
        'percentage',
    ];

    protected $casts = [
        'min_value' => 'decimal:2',
        'max_value' => 'decimal:2',
        'percentage' => 'decimal:2',
    ];

    /**
     * Get the pay band.
     */
    public function payBand(): BelongsTo
    {
        return $this->belongsTo(PayBand::class);
    }
}
