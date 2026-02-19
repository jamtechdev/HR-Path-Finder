<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalaryTablePerformanceIncrease extends Model
{
    use HasFactory;

    protected $fillable = [
        'salary_table_id',
        'rating',
        'increase_amount',
    ];

    protected $casts = [
        'increase_amount' => 'decimal:2',
    ];

    /**
     * Get the salary table.
     */
    public function salaryTable(): BelongsTo
    {
        return $this->belongsTo(SalaryTable::class);
    }
}
