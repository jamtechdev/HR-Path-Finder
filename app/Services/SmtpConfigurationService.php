<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

class SmtpConfigurationService
{
    /**
     * Check if SMTP is properly configured.
     * 
     * @return bool
     */
    public static function isConfigured(): bool
    {
        // Read directly from .env first to check actual values
        $mailerType = env('MAIL_MAILER');
        
        // If MAIL_MAILER is not set or is log/array, check config
        if (empty($mailerType) || in_array($mailerType, ['log', 'array'])) {
            $mailer = Config::get('mail.default');
            if (in_array($mailer, ['log', 'array'])) {
                return false;
            }
            $mailerType = $mailer;
        }
        
        // For SMTP, check if required credentials are set
        if ($mailerType === 'smtp') {
            // Step 1: Read directly from .env first
            $host = env('MAIL_HOST');
            $port = env('MAIL_PORT');
            $username = env('MAIL_USERNAME');
            $password = env('MAIL_PASSWORD');
            $fromAddress = env('MAIL_FROM_ADDRESS');
            
            // Step 2: If .env values are not set, check database
            if (empty($host) || empty($port) || empty($fromAddress)) {
                try {
                    $dbSettings = Setting::getSmtpSettings();
                    if (!empty($dbSettings['host']) && !empty($dbSettings['port']) && !empty($dbSettings['from_address'])) {
                        $host = $dbSettings['host'];
                        $port = $dbSettings['port'];
                        $username = $dbSettings['username'];
                        $password = $dbSettings['password'];
                        $fromAddress = $dbSettings['from_address'];
                    }
                } catch (\Exception $e) {
                    // Database table might not exist yet, continue with config check
                }
            }
            
            // Step 3: If still not set, check config values (for backward compatibility)
            if (empty($host) || empty($port) || empty($fromAddress)) {
                $host = Config::get('mail.mailers.smtp.host');
                $port = Config::get('mail.mailers.smtp.port');
                $username = Config::get('mail.mailers.smtp.username');
                $password = Config::get('mail.mailers.smtp.password');
                $fromAddress = Config::get('mail.from.address');
            }
            
            // Check if all required SMTP settings are configured
            if (empty($host) || empty($port) || empty($fromAddress)) {
                return false;
            }
            
            // Check if using default values (not configured)
            if ($host === '127.0.0.1' && $port == 2525 && $fromAddress === 'hello@example.com') {
                return false; // All defaults, not configured
            }
            
            // For local development (localhost/127.0.0.1), allow without auth
            $localHosts = ['127.0.0.1', 'localhost', 'mailhog'];
            $isLocalHost = in_array(strtolower($host), $localHosts) || strpos($host, '127.0.0.1') === 0;
            
            if ($isLocalHost) {
                // Local mail servers (like Laragon Mail, MailHog) don't need auth
                return true;
            }
            
            // For production, username/password should be set for remote SMTP
            if (app()->environment('production') && (empty($username) || empty($password))) {
                return false;
            }
            
            // If host, port, and from address are set (and not all defaults), consider configured
            return true;
        }
        
        // For other mailers (SES, Postmark, etc.), check if API keys are set
        if ($mailerType === 'ses') {
            $key = env('AWS_ACCESS_KEY_ID') ?: Config::get('services.ses.key');
            $secret = env('AWS_SECRET_ACCESS_KEY') ?: Config::get('services.ses.secret');
            if (empty($key) || empty($secret)) {
                // Check database
                try {
                    $key = Setting::get('aws_access_key_id');
                    $secret = Setting::get('aws_secret_access_key');
                    if (empty($key) || empty($secret)) {
                        return false;
                    }
                } catch (\Exception $e) {
                    return false;
                }
            }
        }
        
        if ($mailerType === 'postmark') {
            $key = env('POSTMARK_TOKEN') ?: Config::get('services.postmark.key');
            if (empty($key)) {
                // Check database
                try {
                    $key = Setting::get('postmark_token');
                    if (empty($key)) {
                        return false;
                    }
                } catch (\Exception $e) {
                    return false;
                }
            }
        }
        
        if ($mailerType === 'resend') {
            $key = env('RESEND_KEY') ?: Config::get('services.resend.key');
            if (empty($key)) {
                // Check database
                try {
                    $key = Setting::get('resend_key');
                    if (empty($key)) {
                        return false;
                    }
                } catch (\Exception $e) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Get SMTP configuration values - check .env first, then database, then config.
     */
    public static function getSmtpConfig(): array
    {
        // Check .env first
        $host = env('MAIL_HOST');
        $port = env('MAIL_PORT');
        $username = env('MAIL_USERNAME');
        $password = env('MAIL_PASSWORD');
        $fromAddress = env('MAIL_FROM_ADDRESS');
        $fromName = env('MAIL_FROM_NAME');
        $encryption = env('MAIL_ENCRYPTION');
        
        // If .env values are empty, check database
        if (empty($host) || empty($port) || empty($fromAddress)) {
            try {
                $dbSettings = Setting::getSmtpSettings();
                if (!empty($dbSettings['host']) && !empty($dbSettings['port']) && !empty($dbSettings['from_address'])) {
                    return $dbSettings;
                }
            } catch (\Exception $e) {
                // Database table might not exist yet
            }
        }
        
        // Fallback to config
        return [
            'host' => $host ?: Config::get('mail.mailers.smtp.host'),
            'port' => $port ?: Config::get('mail.mailers.smtp.port'),
            'username' => $username ?: Config::get('mail.mailers.smtp.username'),
            'password' => $password ?: Config::get('mail.mailers.smtp.password'),
            'from_address' => $fromAddress ?: Config::get('mail.from.address'),
            'from_name' => $fromName ?: Config::get('mail.from.name'),
            'encryption' => $encryption ?: Config::get('mail.mailers.smtp.encryption'),
        ];
    }
    
    /**
     * Test SMTP configuration by attempting to send a test email.
     * 
     * @param string $toEmail
     * @return array ['success' => bool, 'message' => string]
     */
    public static function testConfiguration(string $toEmail): array
    {
        if (!self::isConfigured()) {
            return [
                'success' => false,
                'message' => 'SMTP is not properly configured. Please check your mail settings.',
            ];
        }
        
        try {
            Mail::raw('This is a test email to verify SMTP configuration.', function ($message) use ($toEmail) {
                $message->to($toEmail)
                    ->subject('SMTP Configuration Test');
            });
            
            return [
                'success' => true,
                'message' => 'Test email sent successfully. Please check your inbox.',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to send test email: ' . $e->getMessage(),
            ];
        }
    }
}
