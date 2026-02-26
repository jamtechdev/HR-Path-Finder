<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayBandOperationCriteria extends Model
{
    use HasFactory;

    protected $table = 'pay_band_operation_criteria';

    protected $fillable = [
        'hr_project_id',
        'outlier_handling',
        'promotion_movement_rule',
        'band_review_cycle',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }
}
