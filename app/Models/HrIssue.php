<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HrIssue extends Model
{
    protected $fillable = [
        'category',
        'name',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];
}
