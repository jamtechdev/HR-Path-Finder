<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];
    
    public $timestamps = true;
    
    /**
     * Get a setting value by key.
     */
    public static function get(string $key, $default = null)
    {
        $cacheKey = "settings:{$key}";

        return Cache::remember($cacheKey, 300, function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            return $setting ? $setting->value : $default;
        });
    }
    
    /**
     * Set a setting value by key.
     */
    public static function set(string $key, $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );

        Cache::forget("settings:{$key}");
    }

    /**
     * Get boolean setting value by key.
     */
    public static function getBool(string $key, bool $default = false): bool
    {
        $value = static::get($key, $default ? '1' : '0');

        if (is_bool($value)) {
            return $value;
        }

        return filter_var((string) $value, FILTER_VALIDATE_BOOLEAN);
    }
    
    /**
     * Get all SMTP settings from database.
     */
    public static function getSmtpSettings(): array
    {
        return [
            'mailer' => static::get('mail_mailer'),
            'host' => static::get('mail_host'),
            'port' => static::get('mail_port'),
            'username' => static::get('mail_username'),
            'password' => static::get('mail_password'),
            'encryption' => static::get('mail_encryption'),
            'from_address' => static::get('mail_from_address'),
            'from_name' => static::get('mail_from_name'),
        ];
    }
    
    /**
     * Save SMTP settings to database.
     */
    public static function saveSmtpSettings(array $settings): void
    {
        static::set('mail_mailer', $settings['mailer'] ?? null);
        static::set('mail_host', $settings['host'] ?? null);
        static::set('mail_port', $settings['port'] ?? null);
        static::set('mail_username', $settings['username'] ?? null);
        if (!empty($settings['password'])) {
            static::set('mail_password', $settings['password']);
        }
        static::set('mail_encryption', $settings['encryption'] ?? null);
        static::set('mail_from_address', $settings['from_address'] ?? null);
        static::set('mail_from_name', $settings['from_name'] ?? null);
    }
}
