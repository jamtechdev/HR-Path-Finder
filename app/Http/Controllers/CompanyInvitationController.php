<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CompanyInvitation;
use App\Models\User;
use App\Notifications\CompanyInvitationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CompanyInvitationController extends Controller
{
    /**
     * Send an invitation to join a company workspace.
     */
    public function store(Request $request, Company $company)
    {
        $this->authorize('update', $company);

        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'role' => 'nullable|string|in:ceo',
        ]);

        $email = $validated['email'];
        $role = $validated['role'] ?? 'ceo';

        // Check if user is already a member of this company
        $existingUser = User::where('email', $email)->first();
        if ($existingUser && $company->users()->where('users.id', $existingUser->id)->exists()) {
            return back()->withErrors(['email' => 'This user is already a member of this company.']);
        }

        // Check SMTP configuration before sending invitation
        if (!\App\Services\SmtpConfigurationService::isConfigured()) {
            return back()->withErrors(['email' => 'SMTP is not configured. Please configure email settings before sending invitations.']);
        }

        // Check if there's a pending invitation for this email and company
        $existingInvitation = CompanyInvitation::where('company_id', $company->id)
            ->where('email', $email)
            ->whereNull('accepted_at')
            ->whereNull('rejected_at')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();

        if ($existingInvitation) {
            return back()->withErrors(['email' => 'An invitation has already been sent to this email address.']);
        }

        // Create invitation (don't create user yet - will be created when CEO accepts)
        $invitation = CompanyInvitation::create([
            'company_id' => $company->id,
            'invited_by' => Auth::id(),
            'email' => $email,
            'role' => $role,
            'token' => CompanyInvitation::generateToken(),
            'expires_at' => now()->addDays(7), // Invitation expires in 7 days
        ]);

        // Send invitation email (without password - will be sent when CEO accepts)
        \Illuminate\Support\Facades\Notification::route('mail', $email)
            ->notify(new CompanyInvitationNotification($invitation));

        return back()->with('success', 'Invitation sent successfully to ' . $email . '. CEO will receive login credentials when they accept the invitation.');
    }

    /**
     * Accept an invitation.
     */
    public function accept(Request $request, string $token)
    {
        $invitation = CompanyInvitation::where('token', $token)
            ->whereNull('accepted_at')
            ->whereNull('rejected_at')
            ->with('company')
            ->first();

        if (!$invitation) {
            return Inertia::render('invitations/accept', [
                'error' => 'Invitation not found, already accepted, or has been rejected.',
            ]);
        }

        if ($invitation->isRejected()) {
            return Inertia::render('invitations/accept', [
                'error' => 'This invitation has been rejected.',
            ]);
        }

        if (!$invitation->isValid()) {
            return Inertia::render('invitations/accept', [
                'error' => 'This invitation has expired.',
            ]);
        }

        // Check if invitation is already accepted
        if ($invitation->accepted_at) {
            // Show credentials if already accepted
            return Inertia::render('invitations/accept', [
                'invitation' => $invitation,
                'isAuthenticated' => false,
                'token' => $token,
                'password' => $invitation->temporary_password,
                'message' => 'Your CEO account has been created! Login credentials have been sent to your email.',
            ]);
        }

        // Show invitation page (don't create account yet - wait for accept button click)
        return Inertia::render('invitations/accept', [
            'invitation' => $invitation,
            'isAuthenticated' => Auth::check(),
            'token' => $token,
        ]);
    }

    /**
     * Show reject invitation confirmation page.
     */
    public function showReject(Request $request, string $token)
    {
        $invitation = CompanyInvitation::where('token', $token)
            ->whereNull('accepted_at')
            ->whereNull('rejected_at')
            ->with('company')
            ->first();

        if (!$invitation) {
            return Inertia::render('invitations/accept', [
                'error' => 'Invitation not found, already accepted, or has been rejected.',
            ]);
        }

        if (!$invitation->isValid()) {
            return Inertia::render('invitations/accept', [
                'error' => 'This invitation has expired.',
            ]);
        }

        return Inertia::render('invitations/reject', [
            'invitation' => $invitation,
            'token' => $token,
        ]);
    }

    /**
     * Reject an invitation.
     */
    public function reject(Request $request, string $token)
    {
        $invitation = CompanyInvitation::where('token', $token)
            ->whereNull('accepted_at')
            ->whereNull('rejected_at')
            ->with('company')
            ->first();

        if (!$invitation) {
            return redirect()->route('home')
                ->withErrors(['error' => 'Invitation not found, already accepted, or has been rejected.']);
        }

        if (!$invitation->isValid()) {
            return redirect()->route('home')
                ->withErrors(['error' => 'This invitation has expired.']);
        }

        // Mark invitation as rejected
        $invitation->update([
            'rejected_at' => now(),
        ]);

        return redirect()->route('home')
            ->with('success', 'Invitation has been rejected.');
    }

    /**
     * Process the invitation acceptance (POST request).
     */
    public function processAccept(Request $request, string $token)
    {
        $invitation = CompanyInvitation::where('token', $token)
            ->whereNull('accepted_at')
            ->whereNull('rejected_at')
            ->with('company')
            ->first();

        if (!$invitation) {
            return redirect()->route('invitations.accept', ['token' => $token])
                ->withErrors(['error' => 'Invitation not found, already accepted, or has been rejected.']);
        }

        if ($invitation->isRejected()) {
            return redirect()->route('invitations.accept', ['token' => $token])
                ->withErrors(['error' => 'This invitation has been rejected.']);
        }

        if (!$invitation->isValid()) {
            return redirect()->route('invitations.accept', ['token' => $token])
                ->withErrors(['error' => 'This invitation has expired.']);
        }
        
        // Check SMTP configuration before processing
        if (!\App\Services\SmtpConfigurationService::isConfigured()) {
            return redirect()->route('invitations.accept', ['token' => $token])
                ->withErrors(['error' => 'Email services are not configured. Please contact the administrator.']);
        }

        // Check if company exists
        if (!$invitation->company) {
            return redirect()->route('invitations.accept', ['token' => $token])
                ->withErrors(['error' => 'Company account does not exist. Please contact the HR Manager.']);
        }
        
        // Check if user already exists
        $existingUser = User::where('email', $invitation->email)->first();
        
        // Generate secure password for CEO
        $temporaryPassword = \Illuminate\Support\Str::random(12);
        
        DB::transaction(function () use ($invitation, $temporaryPassword, $existingUser) {
            // Create CEO user account if doesn't exist
            if (!$existingUser) {
                $ceoUser = User::create([
                    'name' => explode('@', $invitation->email)[0], // Use email prefix as default name
                    'email' => $invitation->email,
                    'password' => Hash::make($temporaryPassword),
                    'email_verified_at' => now(), // Auto-verify email when accepting invitation
                ]);

                // Assign CEO role
                $ceoUser->assignRole('ceo');
                
                // Attach CEO to company
                $invitation->company->users()->attach($ceoUser->id, ['role' => 'ceo']);
            } else {
                // If user exists, attach to company and assign role
                $invitation->company->users()->syncWithoutDetaching([
                    $existingUser->id => ['role' => 'ceo'],
                ]);
                if (!$existingUser->hasRole('ceo')) {
                    $existingUser->assignRole('ceo');
                }
                // Reset password for existing user
                $existingUser->update(['password' => Hash::make($temporaryPassword)]);
            }

            // Update invitation with password and mark as accepted
            $invitation->update([
                'temporary_password' => $temporaryPassword,
                'accepted_at' => now(),
            ]);
        });

        // Send email with login credentials
        $ceoUser = User::where('email', $invitation->email)->first();
        try {
            $ceoUser->notify(new CompanyInvitationNotification($invitation->fresh()));
        } catch (\Exception $e) {
            \Log::error('Failed to send CEO welcome email: ' . $e->getMessage());
            // Continue even if email fails - credentials are shown on page
        }

        // Redirect back to accept page with credentials
        return redirect()->route('invitations.accept', ['token' => $token])
            ->with('password', $temporaryPassword)
            ->with('message', 'Your CEO account has been created! Login credentials have been sent to your email.');
    }

    /**
     * Redirect CEO to appropriate page after login/acceptance.
     */
    protected function redirectCeo(Company $company)
    {
        $hrProject = $company->hrProjects()->latest()->first();
        
        if ($hrProject) {
            // Redirect CEO to review company info first, then they can complete the survey
            return redirect()->route('companies.show', $company->id)
                ->with('success', 'Welcome! You have successfully joined ' . $company->name . ' as CEO. Please review the company information and complete the Management Philosophy Survey.');
        }
        
        return redirect()->route('dashboard.ceo')
            ->with('success', 'You have successfully joined ' . $company->name . ' as CEO.');
    }

    /**
     * Cancel/delete an invitation.
     */
    public function destroy(Company $company, CompanyInvitation $invitation)
    {
        $this->authorize('update', $company);

        // Only the inviter or company creator can cancel
        if ($invitation->invited_by !== Auth::id() && $company->created_by !== Auth::id()) {
            abort(403);
        }

        $invitation->delete();

        return back()->with('success', 'Invitation cancelled.');
    }
}
