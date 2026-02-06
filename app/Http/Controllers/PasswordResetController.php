<?php

namespace App\Http\Controllers;

use App\Models\PasswordResetOtp;
use App\Models\User;
use App\Notifications\PasswordResetOtpNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetController extends Controller
{
    /**
     * Show forgot password form.
     */
    public function showForgotPassword(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Send OTP to user's email.
     */
    public function sendOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $email = $validated['email'];
        $user = User::where('email', $email)->first();

        if (!$user) {
            return back()->withErrors(['email' => 'We could not find a user with that email address.']);
        }

        // Check SMTP configuration
        if (!\App\Services\SmtpConfigurationService::isConfigured()) {
            return back()->withErrors(['email' => 'Email services are not configured. Please contact the administrator.']);
        }

        // Generate 6-digit OTP
        $otp = PasswordResetOtp::generateOtp();

        // Delete any existing unused OTPs for this email
        PasswordResetOtp::where('email', $email)
            ->where('used', false)
            ->delete();

        // Create new OTP (valid for 10 minutes)
        $otpRecord = PasswordResetOtp::create([
            'email' => $email,
            'otp' => $otp,
            'expires_at' => now()->addMinutes(10),
            'ip_address' => $request->ip(),
        ]);

        // Send OTP via email
        try {
            // Send email directly using Mail::send
            Mail::send([], [], function ($message) use ($email, $otp) {
                $message->to($email)
                    ->subject('🔐 Password Reset OTP - HR Path-Finder');
                
                $html = view('emails.password-reset-otp', [
                    'otp' => $otp,
                    'expiresIn' => 10,
                ])->render();
                
                $message->html($html);
            });

            \Log::info('Password reset OTP sent', [
                'email' => $email,
                'otp_id' => $otpRecord->id,
                'ip' => $request->ip(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send password reset OTP', [
                'email' => $email,
                'error' => $e->getMessage(),
            ]);
            return back()->withErrors(['email' => 'Failed to send OTP. Please try again later.']);
        }

        return redirect()->route('password.verify-otp')
            ->with('email', $email)
            ->with('status', 'We have sent a 6-digit OTP to your email address. Please check your inbox.');
    }

    /**
     * Show verify OTP page.
     */
    public function showVerifyOtp(Request $request): Response
    {
        $email = $request->session()->get('email');
        
        if (!$email) {
            return redirect()->route('password.request')
                ->withErrors(['email' => 'Please request a password reset first.']);
        }

        return Inertia::render('auth/verify-otp', [
            'email' => $email,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Verify OTP.
     */
    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
        ]);

        $email = $validated['email'];
        $otp = $validated['otp'];

        // Find valid OTP
        $otpRecord = PasswordResetOtp::where('email', $email)
            ->where('otp', $otp)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otpRecord) {
            \Log::warning('Invalid OTP attempt', [
                'email' => $email,
                'otp' => $otp,
                'ip' => $request->ip(),
            ]);

            return back()->withErrors(['otp' => 'Invalid or expired OTP. Please request a new one.']);
        }

        // Mark OTP as used
        $otpRecord->markAsUsed();

        \Log::info('OTP verified successfully', [
            'email' => $email,
            'otp_id' => $otpRecord->id,
        ]);

        // Store email in session for password reset
        $request->session()->put('password_reset_email', $email);
        $request->session()->put('password_reset_verified', true);

        return redirect()->route('password.reset')
            ->with('status', 'OTP verified successfully. Please set your new password.');
    }

    /**
     * Show reset password form.
     */
    public function showResetPassword(Request $request): Response
    {
        $email = $request->session()->get('password_reset_email');
        $verified = $request->session()->get('password_reset_verified');

        if (!$email || !$verified) {
            return redirect()->route('password.request')
                ->withErrors(['email' => 'Please verify your OTP first.']);
        }

        return Inertia::render('auth/reset-password', [
            'email' => $email,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Reset password.
     */
    public function resetPassword(Request $request)
    {
        $email = $request->session()->get('password_reset_email');
        $verified = $request->session()->get('password_reset_verified');

        if (!$email || !$verified) {
            return redirect()->route('password.request')
                ->withErrors(['email' => 'Please verify your OTP first.']);
        }

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Verify email matches session
        if ($validated['email'] !== $email) {
            return back()->withErrors(['email' => 'Email mismatch. Please start the process again.']);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return back()->withErrors(['email' => 'User not found.']);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Clear session
        $request->session()->forget(['password_reset_email', 'password_reset_verified']);

        // Delete all OTPs for this email
        PasswordResetOtp::where('email', $email)->delete();

        \Log::info('Password reset successfully', [
            'email' => $email,
            'user_id' => $user->id,
        ]);

        return redirect()->route('login')
            ->with('status', 'Your password has been reset successfully. Please login with your new password.');
    }

    /**
     * Resend OTP.
     */
    public function resendOtp(Request $request)
    {
        $email = $request->session()->get('email');
        
        if (!$email) {
            return back()->withErrors(['email' => 'Please request a password reset first.']);
        }

        // Regenerate and send OTP
        return $this->sendOtp($request->merge(['email' => $email]));
    }
}
