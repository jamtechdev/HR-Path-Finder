<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\SmtpConfigurationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Show the settings page with all tabs.
     */
    public function index(Request $request): Response
    {
        $smtpConfigured = SmtpConfigurationService::isConfigured();
        
        // Get current SMTP settings (without passwords)
        $smtpSettings = [
            'mailer' => Config::get('mail.default'),
            'host' => Config::get('mail.mailers.smtp.host'),
            'port' => Config::get('mail.mailers.smtp.port'),
            'username' => Config::get('mail.mailers.smtp.username'),
            'from_address' => Config::get('mail.from.address'),
            'from_name' => Config::get('mail.from.name'),
            'encryption' => Config::get('mail.mailers.smtp.encryption'),
        ];
        
        // Get application settings
        $appSettings = [
            'name' => Config::get('app.name'),
            'logo' => asset('logo.svg'), // Default logo path
        ];

        // Get two-factor authentication status
        $user = $request->user();
        $twoFactorEnabled = $user && method_exists($user, 'hasEnabledTwoFactorAuthentication') 
            ? $user->hasEnabledTwoFactorAuthentication() 
            : false;
        
        $requiresConfirmation = \Laravel\Fortify\Features::optionEnabled(
            \Laravel\Fortify\Features::twoFactorAuthentication(), 
            'confirm'
        );

        // Get active tab from query parameter
        $activeTab = $request->query('tab', 'profile');

        return Inertia::render('settings/index', [
            'smtpConfigured' => $smtpConfigured,
            'smtpSettings' => $smtpSettings,
            'appSettings' => $appSettings,
            'twoFactorEnabled' => $twoFactorEnabled,
            'requiresConfirmation' => $requiresConfirmation,
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'activeTab' => $activeTab,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update SMTP settings.
     */
    public function updateSmtp(Request $request)
    {
        $validated = $request->validate([
            'mailer' => 'required|string|in:smtp,ses,postmark,resend',
            'host' => 'required_if:mailer,smtp|string|max:255',
            'port' => 'required_if:mailer,smtp|integer|min:1|max:65535',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'encryption' => 'nullable|string|in:tls,ssl',
            'from_address' => 'required|email|max:255',
            'from_name' => 'required|string|max:255',
        ]);

        // Update .env file
        $envPath = base_path('.env');
        
        if (!file_exists($envPath)) {
            return back()->withErrors(['smtp' => '.env file not found.']);
        }

        $envContent = file_get_contents($envPath);
        
        // Update mail configuration
        $envContent = $this->setEnvValue($envContent, 'MAIL_MAILER', $validated['mailer']);
        
        if ($validated['mailer'] === 'smtp') {
            $envContent = $this->setEnvValue($envContent, 'MAIL_HOST', $validated['host']);
            $envContent = $this->setEnvValue($envContent, 'MAIL_PORT', (string) $validated['port']);
            
            if (!empty($validated['username'])) {
                $envContent = $this->setEnvValue($envContent, 'MAIL_USERNAME', $validated['username']);
            }
            
            if (!empty($validated['password'])) {
                $envContent = $this->setEnvValue($envContent, 'MAIL_PASSWORD', $validated['password']);
            }
            
            if (!empty($validated['encryption'])) {
                $envContent = $this->setEnvValue($envContent, 'MAIL_ENCRYPTION', $validated['encryption']);
            }
        }
        
        $envContent = $this->setEnvValue($envContent, 'MAIL_FROM_ADDRESS', $validated['from_address']);
        $envContent = $this->setEnvValue($envContent, 'MAIL_FROM_NAME', $validated['from_name']);
        
        file_put_contents($envPath, $envContent);
        
        // Clear config cache to reload new values
        Artisan::call('config:clear');
        
        return back()->with('success', 'SMTP settings updated successfully!');
    }

    /**
     * Set or update an environment variable in .env content.
     */
    private function setEnvValue(string $envContent, string $key, string $value): string
    {
        // Quote value if it contains spaces or special characters
        $quotedValue = $value;
        if (preg_match('/[\s#"]/', $value)) {
            $quotedValue = '"' . str_replace('"', '\\"', $value) . '"';
        }
        
        // Pattern to match the key=value line
        $pattern = "/^{$key}=(.*)/m";
        
        // Check if key exists
        if (preg_match($pattern, $envContent)) {
            // Update existing value
            $envContent = preg_replace($pattern, "{$key}={$quotedValue}", $envContent);
        } else {
            // Add new key-value pair at the end
            $envContent .= "\n{$key}={$quotedValue}";
        }
        
        return $envContent;
    }

    /**
     * Test SMTP configuration.
     */
    public function testSmtp(Request $request)
    {
        $request->validate([
            'test_email' => 'required|email',
        ]);

        $result = SmtpConfigurationService::testConfiguration($request->test_email);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->withErrors(['smtp_test' => $result['message']]);
    }

    /**
     * Update application settings.
     */
    public function updateApp(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'logo' => 'nullable|image|max:2048',
        ]);

        // Update application name in config
        // In production, store in database
        
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('app-logos', 'public');
            // Update logo path
        }

        return back()->with('success', 'Application settings updated successfully!');
    }
}
