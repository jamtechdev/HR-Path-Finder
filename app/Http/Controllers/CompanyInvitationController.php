<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CompanyInvitation;
use App\Models\User;
use App\Notifications\CompanyInvitationNotification;
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
        ]);

        // Check if user already exists
        $existingUser = User::where('email', $request->email)->first();
        
        if ($existingUser && $company->users->contains($existingUser)) {
            return back()->withErrors(['email' => 'This user is already a member of the company.']);
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

            // Associate user with company
            $company->users()->syncWithoutDetaching([
                $ceo->id => ['role' => 'ceo'],
            ]);

            // Create invitation record for tracking (marked as accepted)
            $invitation = \App\Models\CompanyInvitation::create([
                'company_id' => $company->id,
                'hr_project_id' => $request->hr_project_id,
                'email' => $request->email,
                'role' => 'ceo',
                'inviter_id' => $request->user()->id,
                'accepted_at' => now(),
                'temporary_password' => $temporaryPassword,
            ]);

            // Send welcome email with credentials
            Notification::route('mail', $request->email)
                ->notify(new CompanyInvitationNotification($invitation));

            return back()->with([
                'success' => 'CEO account created and assigned to company successfully. Welcome email sent with login credentials.',
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

        // Send welcome email (credentials for new users, welcome message for existing users)
        Notification::route('mail', $invitation->email)
            ->notify(new CompanyInvitationNotification($invitation));

        if ($isNewUser) {
            return redirect()->route('login')
                ->with('success', 'Invitation accepted. Please check your email for login credentials.');
        } else {
            return redirect()->route('login')
                ->with('success', 'Invitation accepted. Please check your email for welcome message.');
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

        $invitation->delete();

        return redirect()->route('login')->with('success', 'Invitation rejected.');
    }
}
