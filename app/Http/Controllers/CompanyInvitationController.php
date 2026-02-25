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
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['nullable', 'string', 'min:8'],
            'hr_project_id' => ['nullable', 'exists:hr_projects,id'],
            'create_immediately' => ['nullable', 'boolean'],
            'assign_hr_manager_role' => ['nullable', 'boolean'], // New parameter for dual role
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

            // Check if they need HR Manager role (if requested)
            if ($request->boolean('assign_hr_manager_role')) {
                if (!$existingUser->hasRole('hr_manager')) {
                    $existingUser->assignRole('hr_manager');
                }
                if (!in_array('hr_manager', $existingCompanyRoles)) {
                    $needsUpdate = true;
                    $updates[] = 'HR Manager';
                    $company->users()->syncWithoutDetaching([
                        $existingUser->id => ['role' => 'hr_manager'],
                    ]);
                }
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
                Notification::route('mail', $request->email)
                    ->notify(new CompanyInvitationNotification($invitation));

                $rolesAdded = implode(' and ', $updates);
                return back()->with('success', "User has been successfully assigned {$rolesAdded} role(s) for this company. Notification email sent.");
            } else {
                // User already has all requested roles
                $hasCeo = in_array('ceo', $existingCompanyRoles);
                $hasHrManager = in_array('hr_manager', $existingCompanyRoles);
                $requestedHrManager = $request->boolean('assign_hr_manager_role');
                
                if ($hasCeo && (!$requestedHrManager || $hasHrManager)) {
                    return back()->withErrors(['email' => 'This user already has the requested role(s) for this company.']);
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
            Notification::route('mail', $request->email)
                ->notify(new CompanyInvitationNotification($invitation));

            return back()->with('success', 'CEO invitation sent successfully. The user will receive an invitation email and can accept or reject it.');
        }

        // If create_immediately is true, create the CEO user directly
        if ($request->boolean('create_immediately')) {
            if ($existingUser) {
                return back()->withErrors(['email' => 'A user with this email already exists. Please use the invite option instead.']);
            }

            // Validate name is required when creating immediately
            if (!$request->name) {
                return back()->withErrors(['name' => 'Name is required when creating CEO account.']);
            }

            // Use custom password if provided, otherwise generate one
            $temporaryPassword = $request->password ?: Str::random(12);

            // Create CEO user
            $ceo = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($temporaryPassword),
                'email_verified_at' => now(),
            ]);

            // Assign CEO role
            $ceo->assignRole('ceo');

            // If dual role is requested, also assign HR Manager role
            if ($request->boolean('assign_hr_manager_role')) {
                $ceo->assignRole('hr_manager');
            }

            // Associate user with company as CEO
            $company->users()->syncWithoutDetaching([
                $ceo->id => ['role' => 'ceo'],
            ]);

            // If dual role, also associate as HR Manager
            if ($request->boolean('assign_hr_manager_role')) {
                $company->users()->syncWithoutDetaching([
                    $ceo->id => ['role' => 'hr_manager'],
                ]);
            }

            // Create invitation record (not accepted yet - they need to accept first)
            $invitation = \App\Models\CompanyInvitation::create([
                'company_id' => $company->id,
                'hr_project_id' => $request->hr_project_id,
                'email' => $request->email,
                'role' => 'ceo',
                'inviter_id' => $request->user()->id,
                'temporary_password' => $temporaryPassword,
            ]);

            // Send invitation email (not welcome message - they need to accept first)
            Notification::route('mail', $request->email)
                ->notify(new CompanyInvitationNotification($invitation));

            $roleMessage = $request->boolean('assign_hr_manager_role') 
                ? 'CEO with HR Manager role' 
                : 'CEO';

            return back()->with([
                'success' => "{$roleMessage} account created and assigned to company successfully. Welcome email sent with login credentials.",
                'ceo_password' => $temporaryPassword,
                'ceo_email' => $request->email,
                'ceo_name' => $request->name,
            ]);
        }

        // Otherwise, send invitation (existing flow)
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
        Notification::route('mail', $request->email)
            ->notify(new CompanyInvitationNotification($invitation));

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
        Notification::route('mail', $invitation->email)
            ->notify(new CompanyInvitationNotification($invitation));

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
            Notification::route('mail', $invitation->inviter->email)
                ->notify(new InvitationRejectedNotification($invitation));
        }

        $invitation->delete();

        return redirect()->route('login')->with('success', 'Invitation rejected. The HR manager has been notified.');
    }
}
