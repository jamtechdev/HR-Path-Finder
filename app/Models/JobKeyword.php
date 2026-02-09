<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobKeyword extends Model
{
    protected $fillable = [
        'name',
        'industry_category',
        'company_size_range',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];
}
