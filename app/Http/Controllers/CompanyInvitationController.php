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
     * Send CEO invitation.
     */
    public function inviteCeo(Request $request, Company $company)
    {
        $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'hr_project_id' => ['nullable', 'exists:hr_projects,id'],
        ]);

        // Check if user is already a member of the company with CEO role
        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser) {
            $isCompanyMember = $company->users->contains($existingUser);
            if ($isCompanyMember) {
                $existingCompanyRoles = $company->users()
                    ->where('users.id', $existingUser->id)
                    ->pluck('company_users.role')
                    ->toArray();
                
                if (in_array('ceo', $existingCompanyRoles)) {
                    return back()->withErrors(['email' => 'This user already has CEO role for this company.']);
                }
            }
        }

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

        // Mark invitation as accepted (include temporary_password if it was set)
        $updateData = ['accepted_at' => now()];
        if (!empty($invitation->temporary_password)) {
            $updateData['temporary_password'] = $invitation->temporary_password;
        }
        $invitation->update($updateData);

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
