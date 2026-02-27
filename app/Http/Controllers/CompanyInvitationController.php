<?php

namespace App\Http\Controllers;

use App\Mail\CompanyInvitationMail;
use App\Models\Company;
use App\Models\CompanyInvitation;
use App\Models\User;
use App\Notifications\InvitationRejectedNotification;
use App\Services\CompanyWorkspaceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
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

        // Prepare invitation data (don't save yet - only save if email sends successfully)
        $invitationData = [
            'company_id' => $company->id,
            'hr_project_id' => $request->hr_project_id,
            'email' => $request->email,
            'role' => 'ceo',
            'inviter_id' => $request->user()->id,
        ];

        // Send invitation email first - only save to DB if email sends successfully
        try {
            // Create invitation in database first (with pending status)
            $invitation = \App\Models\CompanyInvitation::create($invitationData);
            
            // Reload relationships for email
            $invitation->load(['company', 'inviter', 'hrProject']);
            
            // Send email - if this fails, we'll delete the invitation
            $this->sendInvitationEmail($invitation, $request->email);
            
            \Log::info('CEO Invitation created and email sent successfully', [
                'invitation_id' => $invitation->id,
                'email' => $request->email,
                'company_id' => $company->id,
            ]);
            
        } catch (\Exception $e) {
            // Delete invitation if email failed
            if (isset($invitation) && $invitation->exists) {
                $invitation->delete();
            }
            
            \Log::error('Failed to send CEO Invitation Email - invitation deleted', [
                'email' => $request->email,
                'company_id' => $company->id,
                'error' => $e->getMessage(),
            ]);
            
            return back()->withErrors(['email' => 'Failed to send invitation email. Please check logs and try again.']);
        }

        return back()->with('success', 'CEO invitation sent successfully. The user will receive an invitation email and can accept or reject it.');
    }

    /**
     * Accept invitation.
     */
    public function accept(Request $request, string $token)
    {
        \Log::info('CEO Invitation Acceptance Started', [
            'token' => substr($token, 0, 10) . '...',
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
        
        $invitation = CompanyInvitation::where('token', $token)->firstOrFail();

        \Log::info('Invitation found for acceptance', [
            'invitation_id' => $invitation->id,
            'email' => $invitation->email,
            'company_id' => $invitation->company_id,
            'current_accepted_at' => $invitation->accepted_at,
            'current_temporary_password' => !empty($invitation->temporary_password) ? '***' : null,
        ]);

        if ($invitation->isAccepted()) {
            \Log::warning('Invitation already accepted', [
                'invitation_id' => $invitation->id,
                'accepted_at' => $invitation->accepted_at,
            ]);
            return redirect()->route('login')->with('error', 'This invitation has already been accepted.');
        }

        if ($invitation->isExpired()) {
            \Log::warning('Invitation expired', [
                'invitation_id' => $invitation->id,
                'expires_at' => $invitation->expires_at,
            ]);
            return redirect()->route('login')->with('error', 'This invitation has expired.');
        }

        // Check if user exists
        $user = User::where('email', $invitation->email)->first();
        $isNewUser = !$user;
        
        \Log::info('User check for acceptance', [
            'invitation_id' => $invitation->id,
            'email' => $invitation->email,
            'is_new_user' => $isNewUser,
            'user_id' => $user ? $user->id : null,
        ]);

        if (!$user) {
            // Create new user
            $temporaryPassword = 'changeMe@123';
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
        
        \Log::info('Updating invitation with acceptance data', [
            'invitation_id' => $invitation->id,
            'update_data' => [
                'accepted_at' => $updateData['accepted_at']->toIso8601String(),
                'has_temp_password' => isset($updateData['temporary_password']),
            ],
        ]);
        
        $invitation->update($updateData);
        
        // Refresh the model to ensure all attributes are loaded from database
        $invitation->refresh();
        
        \Log::info('Invitation refreshed after update', [
            'invitation_id' => $invitation->id,
            'accepted_at' => $invitation->accepted_at ? $invitation->accepted_at->toIso8601String() : null,
            'accepted_at_type' => gettype($invitation->accepted_at),
            'has_temp_password' => !empty($invitation->temporary_password),
            'temporary_password_set' => isset($invitation->temporary_password),
        ]);

        // Send welcome email AFTER acceptance - MUST complete before redirect
        // Re-fetch invitation from database to ensure we have latest data
        $invitation = CompanyInvitation::findOrFail($invitation->id);
        
        \Log::info('=== SENDING WELCOME EMAIL AFTER CEO ACCEPTANCE ===', [
            'invitation_id' => $invitation->id,
            'email' => $invitation->email,
            'accepted_at' => $invitation->accepted_at ? $invitation->accepted_at->toIso8601String() : null,
            'accepted_at_raw' => $invitation->getRawOriginal('accepted_at'),
            'has_temp_password' => !empty($invitation->temporary_password),
            'temporary_password' => !empty($invitation->temporary_password) ? '***' : null,
            'is_new_user' => $isNewUser,
        ]);
        
        try {
            // Send email synchronously (no queue) - wait for completion
            $this->sendInvitationEmail($invitation, $invitation->email);
            
            \Log::info('=== WELCOME EMAIL SENT SUCCESSFULLY AFTER CEO ACCEPTANCE ===', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email,
                'sent_at' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            \Log::error('=== FAILED TO SEND WELCOME EMAIL AFTER CEO ACCEPTANCE ===', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email,
                'error' => $e->getMessage(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            // Don't fail the acceptance if email fails, but log it
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

    /**
     * Resend invitation email.
     */
    public function resend(Request $request, CompanyInvitation $invitation)
    {
        // Check authorization - only HR manager who created the invitation or company members can resend
        $user = $request->user();
        $company = $invitation->company;
        
        if (!$company->users->contains($user) && !$user->hasRole(['admin', 'consultant'])) {
            abort(403, 'You are not authorized to resend this invitation.');
        }

        // Check if invitation is already accepted
        if ($invitation->accepted_at) {
            return back()->withErrors(['error' => 'This invitation has already been accepted.']);
        }

        // Check if invitation is expired
        if ($invitation->isExpired()) {
            return back()->withErrors(['error' => 'This invitation has expired. Please create a new invitation.']);
        }

        // Resend invitation email directly
        try {
            \Log::info('Resending CEO Invitation Email', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email,
                'company_id' => $company->id,
                'company_name' => $company->name,
                'resend_by' => $user->id,
                'resend_by_name' => $user->name,
                'mailer' => config('mail.default'),
                'mail_host' => config('mail.mailers.smtp.host'),
                'mail_port' => config('mail.mailers.smtp.port'),
                'mail_username' => config('mail.mailers.smtp.username') ? 'SET' : 'NOT SET',
                'mail_from_address' => config('mail.from.address'),
                'mail_from_name' => config('mail.from.name'),
                'timestamp' => now()->toIso8601String(),
            ]);

            // Send directly using Mail facade with blade file
            $this->sendInvitationEmail($invitation, $invitation->email);

            \Log::info('CEO Invitation Email resent successfully', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email,
                'resend_by' => $user->id,
                'sent_at' => now()->toIso8601String(),
            ]);

            return back()->with('success', 'Invitation email has been resent successfully to ' . $invitation->email . '.');
        } catch (\Exception $e) {
            \Log::error('Failed to resend CEO Invitation Email', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email,
                'resend_by' => $user->id,
                'error' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return back()->withErrors(['error' => 'Failed to resend invitation email. Please check logs and try again.']);
        }
    }

    /**
     * Delete invitation.
     */
    public function destroy(Request $request, CompanyInvitation $invitation)
    {
        // Check authorization - only HR manager who created the invitation or company members can delete
        $user = $request->user();
        $company = $invitation->company;
        
        if (!$company->users->contains($user) && !$user->hasRole(['admin', 'consultant'])) {
            abort(403, 'You are not authorized to delete this invitation.');
        }

        // Check if invitation is already accepted
        if ($invitation->accepted_at) {
            return back()->withErrors(['error' => 'Cannot delete an accepted invitation.']);
        }

        $email = $invitation->email;
        $invitationId = $invitation->id;

        try {
            \Log::info('Deleting CEO Invitation', [
                'invitation_id' => $invitationId,
                'email' => $email,
                'company_id' => $company->id,
                'deleted_by' => $user->id,
                'deleted_by_name' => $user->name,
            ]);

            $invitation->delete();

            \Log::info('CEO Invitation deleted successfully', [
                'invitation_id' => $invitationId,
                'email' => $email,
                'deleted_by' => $user->id,
            ]);

            return back()->with('success', 'Invitation has been deleted successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to delete CEO Invitation', [
                'invitation_id' => $invitationId,
                'email' => $email,
                'deleted_by' => $user->id,
                'error' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return back()->withErrors(['error' => 'Failed to delete invitation. Please try again.']);
        }
    }

    /**
     * Send invitation email using Mail facade with proper blade file.
     */
    private function sendInvitationEmail(CompanyInvitation $invitation, string $email): void
    {
        try {
            // Ensure relationships are loaded
            if (!$invitation->relationLoaded('company')) {
                $invitation->load('company');
            }
            if (!$invitation->relationLoaded('inviter')) {
                $invitation->load('inviter');
            }
            if (!$invitation->relationLoaded('hrProject')) {
                $invitation->load('hrProject');
            }

            $company = $invitation->company;
            $inviter = $invitation->inviter;
            $project = $invitation->hrProject;

            \Log::info('Sending CEO Invitation Email (Mail Facade)', [
                'invitation_id' => $invitation->id,
                'email' => $email,
                'company_id' => $invitation->company_id,
                'company_name' => $company->name ?? 'N/A',
                'accepted_at' => $invitation->accepted_at,
                'has_temp_password' => !empty($invitation->temporary_password),
                'mailer' => config('mail.default'),
                'mail_host' => config('mail.mailers.smtp.host'),
                'mail_from_address' => config('mail.from.address'),
                'timestamp' => now()->toIso8601String(),
            ]);

            // Get company logo URL
            $companyLogo = null;
            if ($company->logo_path) {
                if (str_starts_with($company->logo_path, 'http://') || str_starts_with($company->logo_path, 'https://')) {
                    $companyLogo = $company->logo_path;
                } elseif (str_starts_with($company->logo_path, '/storage/')) {
                    $companyLogo = url($company->logo_path);
                } else {
                    $companyLogo = asset('storage/' . $company->logo_path);
                }
            }

            // Prepare email based on invitation status
            \Log::info('Checking invitation status for email type', [
                'invitation_id' => $invitation->id,
                'accepted_at' => $invitation->accepted_at ? $invitation->accepted_at->toIso8601String() : null,
                'accepted_at_type' => gettype($invitation->accepted_at),
                'accepted_at_bool' => (bool) $invitation->accepted_at,
                'accepted_at_not_null' => !is_null($invitation->accepted_at),
                'temporary_password' => !empty($invitation->temporary_password) ? '***' : null,
                'has_temp_password' => !empty($invitation->temporary_password),
            ]);
            
            // Check if invitation is accepted - reload from database to be absolutely sure
            $invitation->refresh();
            $isAccepted = !is_null($invitation->accepted_at);
            
            // Fallback: check database directly if model check fails
            if (!$isAccepted) {
                $dbCheck = \DB::table('company_invitations')
                    ->where('id', $invitation->id)
                    ->whereNotNull('accepted_at')
                    ->exists();
                $isAccepted = $dbCheck;
            }
            
            \Log::info('Invitation acceptance check result', [
                'invitation_id' => $invitation->id,
                'is_accepted' => $isAccepted,
                'accepted_at_value' => $invitation->accepted_at ? $invitation->accepted_at->toIso8601String() : null,
                'isAccepted_method' => $invitation->isAccepted(),
                'not_null_check' => !is_null($invitation->accepted_at),
            ]);
            
            if ($isAccepted) {
                // Welcome email after acceptance
                $loginUrl = route('login');
                
                \Log::info('Preparing welcome email (accepted invitation)', [
                    'invitation_id' => $invitation->id,
                    'has_temp_password' => !empty($invitation->temporary_password),
                    'email_type' => !empty($invitation->temporary_password) ? 'welcome-new' : 'welcome-existing',
                ]);
                
                if ($invitation->temporary_password) {
                    // New user - send credentials email
                    $subject = '🎉 Welcome to ' . $company->name . ' - Your CEO Account is Ready!';
                    $view = 'emails.ceo-invitation-welcome-new';
                    $data = [
                        'subject' => $subject,
                        'companyLogo' => $companyLogo,
                        'companyName' => $company->name,
                        'email' => $invitation->email,
                        'temporaryPassword' => $invitation->temporary_password,
                        'hasProject' => (bool) $project,
                        'loginUrl' => $loginUrl,
                    ];
                    
                    \Log::info('Sending welcome email with credentials for new user', [
                        'invitation_id' => $invitation->id,
                        'email' => $invitation->email,
                        'view' => $view,
                    ]);
                } else {
                    // Existing user - send welcome email
                    $subject = '🎉 Welcome! You\'re Now CEO of ' . $company->name;
                    $view = 'emails.ceo-invitation-welcome-existing';
                    $data = [
                        'subject' => $subject,
                        'companyLogo' => $companyLogo,
                        'companyName' => $company->name,
                        'inviterName' => $inviter->name,
                        'hasProject' => (bool) $project,
                        'loginUrl' => $loginUrl,
                    ];
                    
                    \Log::info('Sending welcome email for existing user', [
                        'invitation_id' => $invitation->id,
                        'email' => $invitation->email,
                        'view' => $view,
                    ]);
                }
            } else {
                // Initial invitation email (before acceptance)
                $acceptUrl = route('invitations.accept', ['token' => $invitation->token]);
                $rejectUrl = route('invitations.reject', ['token' => $invitation->token]);
                
                $expiresAt = $invitation->expires_at 
                    ? $invitation->expires_at->format('F j, Y \a\t g:i A') 
                    : '7 days from now';
                
                $subject = '🎯 CEO Invitation: Join ' . $company->name . ' on HR Path-Finder';
                $view = 'emails.ceo-invitation-initial';
                $existingUser = User::where('email', $invitation->email)->first();
                
                $data = [
                    'subject' => $subject,
                    'companyLogo' => $companyLogo,
                    'companyName' => $company->name,
                    'inviterName' => $inviter->name,
                    'hasProject' => (bool) $project,
                    'expiresAt' => $expiresAt,
                    'existingUser' => (bool) $existingUser,
                    'acceptUrl' => $acceptUrl,
                    'rejectUrl' => $rejectUrl,
                ];
            }

            // Send email directly using Mail facade (no queue)
            $mail = new CompanyInvitationMail(
                invitation: $invitation,
                emailSubject: $subject,
                emailView: $view,
                emailData: $data,
            );

            Mail::to($email)->send($mail);

            \Log::info('CEO Invitation Email sent successfully (Mail Facade)', [
                'invitation_id' => $invitation->id,
                'email' => $email,
                'view' => $view,
                'sent_at' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send CEO Invitation Email (Mail Facade)', [
                'invitation_id' => $invitation->id,
                'email' => $email,
                'error' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e;
        }
    }
}
