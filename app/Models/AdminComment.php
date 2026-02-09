<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminComment extends Model
{
    use HasFactory;

    protected $table = 'admin_comments';

    protected $fillable = [
        'hr_project_id',
        'user_id',
        'step',
        'comment',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the HR project.
     */
    public function hrProject(): BelongsTo
    {
        return $this->belongsTo(HrProject::class);
    }

    /**
     * Get the admin user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
