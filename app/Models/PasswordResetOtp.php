<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PasswordResetOtp extends Model
{
    protected $fillable = [
        'email',
        'otp',
        'expires_at',
        'used',
        'ip_address',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used' => 'boolean',
    ];

    /**
     * Generate a 6-digit OTP.
     */
    public static function generateOtp(): string
    {
        return str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Check if OTP is valid (not expired and not used).
     */
    public function isValid(): bool
    {
        return !$this->used && $this->expires_at->isFuture();
    }

    /**
     * Mark OTP as used.
     */
    public function markAsUsed(): void
    {
        $this->update(['used' => true]);
    }

    /**
     * Clean up expired OTPs (can be called via scheduled task).
     */
    public static function cleanupExpired(): void
    {
        static::where('expires_at', '<', now())
            ->orWhere('used', true)
            ->where('created_at', '<', now()->subDays(1))
            ->delete();
    }
}
