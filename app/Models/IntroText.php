<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IntroText extends Model
{
    protected $fillable = [
        'key',
        'title',
        'content',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
