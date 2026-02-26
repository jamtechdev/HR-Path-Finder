<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CompanyInvitation;
use App\Models\User;
use App\Notifications\CompanyInvitationNotification;
use App\Notifications\InvitationRejectedNotification;
use App\Services\CompanyWorkspaceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class CompanyInvitationController extends Controller
{
    /**
     * Send CEO invitation or create CEO directly.
     */
    public function inviteCeo(Request $request, Company $company)
    {
        $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'hr_project_id' => ['nullable', 'exists:hr_projects,id'],
        ]);

        // Check if user already exists
        $existingUser = User::where('email', $request->email)->first();
        
        // Check if user is already a member of the company and what roles they have
        $isCompanyMember = $existingUser && $company->users->contains($existingUser);
        $existingCompanyRoles = [];
        if ($isCompanyMember) {
            $existingCompanyRoles = $company->users()
                ->where('users.id', $existingUser->id)
                ->pluck('company_users.role')
                ->toArray();
        }

        // If user already exists and is a member, handle role updates
        if ($isCompanyMember) {
            $needsUpdate = false;
            $updates = [];

            // Check if they need CEO role
            if (!in_array('ceo', $existingCompanyRoles)) {
                $needsUpdate = true;
                $updates[] = 'CEO';
                $company->users()->syncWithoutDetaching([
                    $existingUser->id => ['role' => 'ceo'],
                ]);
            }


            if ($needsUpdate) {
                // Create invitation record for tracking (marked as accepted since user is already member)
                $invitation = \App\Models\CompanyInvitation::create([
                    'company_id' => $company->id,
                    'hr_project_id' => $request->hr_project_id,
                    'email' => $request->email,
                    'role' => 'ceo',
                    'inviter_id' => $request->user()->id,
                    'accepted_at' => now(),
                ]);

                // Send welcome email (since they're already a member, just notify of role addition)
                try {
                    \Log::info('Sending Company Invitation Notification (Role Update)', [
                        'invitation_id' => $invitation->id,
                        'email' => $request->email,
                        'company_id' => $company->id,
                        'company_name' => $company->name,
                        'mailer' => config('mail.default'),
                        'mail_host' => config('mail.mailers.smtp.host'),
                        'timestamp' => now()->toIso8601String(),
                    ]);

                    Notification::route('mail', $request->email)
                        ->notify(new CompanyInvitationNotification($invitation));

                    \Log::info('Company Invitation Notification sent successfully (Role Update)', [
                        'invitation_id' => $invitation->id,
                        'email' => $request->email,
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to send Company Invitation Notification (Role Update)', [
                        'invitation_id' => $invitation->id,
                        'email' => $request->email,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }

                $rolesAdded = implode(' and ', $updates);
                return back()->with('success', "User has been successfully assigned {$rolesAdded} role(s) for this company. Notification email sent.");
            } else {
                // User already has CEO role
                if (in_array('ceo', $existingCompanyRoles)) {
                    return back()->withErrors(['email' => 'This user already has CEO role for this company.']);
                }
            }
        }

        // If user already exists and has CEO role (but not yet a company member), send invitation
        // Don't auto-associate - let them accept the invitation first
        if ($existingUser && $existingUser->hasRole('ceo') && !$isCompanyMember) {
            // Check if there's already a pending invitation
            $existingInvitation = \App\Models\CompanyInvitation::where('company_id', $company->id)
                ->where('email', $request->email)
                ->whereNull('accepted_at')
                ->where(function($query) {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })
                ->first();

            if ($existingInvitation) {
                return back()->withErrors(['email' => 'An invitation has already been sent to this email.']);
            }

            // Create invitation (not accepted yet - they need to accept)
            $invitation = \App\Models\CompanyInvitation::create([
                'company_id' => $company->id,
                'hr_project_id' => $request->hr_project_id,
                'email' => $request->email,
                'role' => 'ceo',
                'inviter_id' => $request->user()->id,
            ]);

            // Send invitation email (not welcome message)
            try {
                \Log::info('Sending CEO Invitation Email', [
                    'invitation_id' => $invitation->id,
                    'email' => $request->email,
                    'company_id' => $company->id,
                    'company_name' => $company->name,
                    'mailer' => config('mail.default'),
                    'mail_host' => config('mail.mailers.smtp.host'),
                    'timestamp' => now()->toIso8601String(),
                ]);

                Notification::route('mail', $request->email)
                    ->notify(new CompanyInvitationNotification($invitation));

                \Log::info('CEO Invitation Email sent successfully', [
                    'invitation_id' => $invitation->id,
                    'email' => $request->email,
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to send CEO Invitation Email', [
                    'invitation_id' => $invitation->id,
                    'email' => $request->email,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }

            return back()->with('success', 'CEO invitation sent successfully. The user will receive an invitation email and can accept or reject it.');
        }

        // Send invitation (HR can only invite, not create accounts directly)
        // Check if there's already a pending invitation for this email and company
        $existingInvitation = \App\Models\CompanyInvitation::where('company_id', $company->id)
            ->where('email', $request->email)
            ->whereNull('accepted_at')
            ->where(function($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();

        if ($existingInvitation) {
            return back()->withErrors(['email' => 'An invitation has already been sent to this email.']);
        }

        // Create invitation
        $invitation = \App\Models\CompanyInvitation::create([
            'company_id' => $company->id,
            'hr_project_id' => $request->hr_project_id,
            'email' => $request->email,
            'role' => 'ceo',
            'inviter_id' => $request->user()->id,
        ]);

        // Store dual role preference in invitation (we'll handle this in accept method)
        // For now, we'll add a note field or handle it during acceptance

        // Send invitation email
        try {
            \Log::info('Sending CEO Invitation Email (Standard Flow)', [
                'invitation_id' => $invitation->id,
                'email' => $request->email,
                'company_id' => $company->id,
                'company_name' => $company->name,
                'mailer' => config('mail.default'),
                'mail_host' => config('mail.mailers.smtp.host'),
                'timestamp' => now()->toIso8601String(),
            ]);

            Notification::route('mail', $request->email)
                ->notify(new CompanyInvitationNotification($invitation));

            \Log::info('CEO Invitation Email sent successfully (Standard Flow)', [
                'invitation_id' => $invitation->id,
                'email' => $request->email,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send CEO Invitation Email (Standard Flow)', [
                'invitation_id' => $invitation->id,
                'email' => $request->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        return back()->with('success', 'CEO invitation sent successfully.');
    }

    /**
     * Accept invitation.
     */
    public function accept(Request $request, string $token)
    {
        $invitation = CompanyInvitation::where('token', $token)->firstOrFail();

        if ($invitation->isAccepted()) {
            return redirect()->route('login')->with('error', 'This invitation has already been accepted.');
        }

        if ($invitation->isExpired()) {
            return redirect()->route('login')->with('error', 'This invitation has expired.');
        }

        // Check if user exists
        $user = User::where('email', $invitation->email)->first();
        $isNewUser = !$user;

        if (!$user) {
            // Create new user
            $temporaryPassword = Str::random(12);
            $user = User::create([
                'name' => explode('@', $invitation->email)[0],
                'email' => $invitation->email,
                'password' => Hash::make($temporaryPassword),
                'email_verified_at' => now(), // Auto-verify for invited users
            ]);

            // Assign CEO role
            $user->assignRole('ceo');

            // Store temporary password in invitation
            $invitation->temporary_password = $temporaryPassword;
        } else {
            // User exists, assign CEO role if not already assigned
            if (!$user->hasRole('ceo')) {
                $user->assignRole('ceo');
            }
        }

        // Associate user with company
        $invitation->company->users()->syncWithoutDetaching([
            $user->id => ['role' => $invitation->role],
        ]);

        // Mark invitation as accepted
        $invitation->update(['accepted_at' => now()]);

        // Send welcome email after acceptance (credentials for new users, welcome message for existing users)
        try {
            \Log::info('Sending Welcome Email (After Invitation Acceptance)', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email,
                'is_new_user' => $isNewUser,
                'has_temp_password' => !empty($invitation->temporary_password),
                'company_id' => $invitation->company_id,
                'mailer' => config('mail.default'),
                'mail_host' => config('mail.mailers.smtp.host'),
                'timestamp' => now()->toIso8601String(),
            ]);

            Notification::route('mail', $invitation->email)
                ->notify(new CompanyInvitationNotification($invitation));

            \Log::info('Welcome Email sent successfully (After Invitation Acceptance)', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send Welcome Email (After Invitation Acceptance)', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        if ($isNewUser) {
            return redirect()->route('login')
                ->with('success', 'Invitation accepted successfully! Please check your email for login credentials and welcome message.');
        } else {
            return redirect()->route('login')
                ->with('success', 'Invitation accepted successfully! Please check your email for welcome message.');
        }
    }

    /**
     * Reject invitation.
     */
    public function reject(string $token)
    {
        $invitation = CompanyInvitation::where('token', $token)->firstOrFail();

        if ($invitation->isAccepted()) {
            return redirect()->route('login')->with('error', 'This invitation has already been accepted.');
        }

        // Send rejection notification to HR manager (inviter)
        if ($invitation->inviter) {
            try {
                \Log::info('Sending Invitation Rejection Notification to HR Manager', [
                    'invitation_id' => $invitation->id,
                    'hr_manager_email' => $invitation->inviter->email,
                    'ceo_email' => $invitation->email,
                    'company_id' => $invitation->company_id,
                    'mailer' => config('mail.default'),
                    'mail_host' => config('mail.mailers.smtp.host'),
                    'timestamp' => now()->toIso8601String(),
                ]);

                Notification::route('mail', $invitation->inviter->email)
                    ->notify(new InvitationRejectedNotification($invitation));

                \Log::info('Invitation Rejection Notification sent successfully', [
                    'invitation_id' => $invitation->id,
                    'hr_manager_email' => $invitation->inviter->email,
                ]);
            } catch (\Exception $e) {
                \Log::error('Failed to send Invitation Rejection Notification', [
                    'invitation_id' => $invitation->id,
                    'hr_manager_email' => $invitation->inviter->email,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        $invitation->delete();

        return redirect()->route('login')->with('success', 'Invitation rejected. The HR manager has been notified.');
    }
}
