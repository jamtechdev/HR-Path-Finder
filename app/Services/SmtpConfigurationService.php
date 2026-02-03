<?php

namespace App\Services;

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
        $mailer = Config::get('mail.default');
        
        // If using log or array mailer, SMTP is not configured
        if (in_array($mailer, ['log', 'array'])) {
            return false;
        }
        
        // For SMTP, check if required credentials are set
        if ($mailer === 'smtp') {
            $host = Config::get('mail.mailers.smtp.host');
            $port = Config::get('mail.mailers.smtp.port');
            $username = Config::get('mail.mailers.smtp.username');
            $password = Config::get('mail.mailers.smtp.password');
            $fromAddress = Config::get('mail.from.address');
            
            // Check if all required SMTP settings are configured
            if (empty($host) || empty($port) || empty($fromAddress)) {
                return false;
            }
            
            // For development, we might allow SMTP without auth
            // But for production, username/password should be set
            if (app()->environment('production') && (empty($username) || empty($password))) {
                return false;
            }
            
            // Additional check: verify host is not default localhost
            if ($host === '127.0.0.1' || $host === 'localhost') {
                // In development, this might be okay, but check if it's actually configured
                if (empty($username) && empty($password)) {
                    return false;
                }
            }
        }
        
        // For other mailers (SES, Postmark, etc.), check if API keys are set
        if ($mailer === 'ses') {
            $key = Config::get('services.ses.key');
            $secret = Config::get('services.ses.secret');
            if (empty($key) || empty($secret)) {
                return false;
            }
        }
        
        if ($mailer === 'postmark') {
            $key = Config::get('services.postmark.key');
            if (empty($key)) {
                return false;
            }
        }
        
        if ($mailer === 'resend') {
            $key = Config::get('services.resend.key');
            if (empty($key)) {
                return false;
            }
        }
        
        return true;
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
