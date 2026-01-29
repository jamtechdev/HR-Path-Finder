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

        // Check if there's a pending invitation for this email and company
        $existingInvitation = CompanyInvitation::where('company_id', $company->id)
            ->where('email', $email)
            ->whereNull('accepted_at')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();

        if ($existingInvitation) {
            return back()->withErrors(['email' => 'An invitation has already been sent to this email address.']);
        }

        // Create invitation
        $invitation = CompanyInvitation::create([
            'company_id' => $company->id,
            'invited_by' => Auth::id(),
            'email' => $email,
            'role' => $role,
            'token' => CompanyInvitation::generateToken(),
            'expires_at' => now()->addDays(7), // Invitation expires in 7 days
        ]);

        // Send notification
        // If user exists, send to user; otherwise, send to email address
        if ($existingUser) {
            $existingUser->notify(new CompanyInvitationNotification($invitation));
        } else {
            // For new users, send the invitation email with registration link
            \Illuminate\Support\Facades\Notification::route('mail', $email)
                ->notify(new CompanyInvitationNotification($invitation));
        }

        return back()->with('success', 'Invitation sent successfully to ' . $email);
    }

    /**
     * Accept an invitation.
     */
    public function accept(Request $request, string $token)
    {
        $invitation = CompanyInvitation::where('token', $token)
            ->whereNull('accepted_at')
            ->with('company')
            ->first();

        if (!$invitation) {
            return Inertia::render('invitations/accept', [
                'error' => 'Invitation not found or already accepted.',
            ]);
        }

        if (!$invitation->isValid()) {
            return Inertia::render('invitations/accept', [
                'error' => 'This invitation has expired.',
            ]);
        }

        // Check if user is authenticated
        if (!Auth::check()) {
            // Store invitation token in session for after registration
            session(['invitation_token' => $token]);
            return Inertia::render('invitations/accept', [
                'invitation' => $invitation,
                'isAuthenticated' => false,
                'token' => $token,
            ]);
        }

        // User is authenticated, process invitation
        $result = $this->processInvitation($invitation, Auth::user());
        
        // If result is a redirect, return it; otherwise show success page
        if ($result instanceof \Illuminate\Http\RedirectResponse) {
            return $result;
        }

        return Inertia::render('invitations/accept', [
            'invitation' => $invitation,
            'isAuthenticated' => true,
            'token' => $token,
        ]);
    }

    /**
     * Process the invitation acceptance.
     */
    protected function processInvitation(CompanyInvitation $invitation, User $user)
    {
        // Verify email matches (if user is logged in)
        if ($user->email !== $invitation->email) {
            return redirect()->route('dashboard')
                ->withErrors(['message' => 'The invitation email does not match your account email.']);
        }

        DB::transaction(function () use ($invitation, $user) {
            // Attach user to company with the specified role
            $company = $invitation->company;
            $company->users()->syncWithoutDetaching([
                $user->id => ['role' => $invitation->role],
            ]);

            // Assign role to user if not already assigned
            if (!$user->hasRole($invitation->role)) {
                $user->assignRole($invitation->role);
            }

            // Mark invitation as accepted
            $invitation->update(['accepted_at' => now()]);
        });

        // Redirect based on role
        if ($invitation->role === 'ceo') {
            // Get the company's first HR project for CEO onboarding
            $company = $invitation->company;
            $hrProject = $company->hrProjects()->latest()->first();
            
            if ($hrProject) {
                // Redirect CEO to review company info first, then they can complete the survey
                return redirect()->route('companies.show', $company->id)
                    ->with('success', 'Welcome! You have successfully joined ' . $company->name . ' as CEO. Please review the company information and complete the Management Philosophy Survey.');
            }
            
            return redirect()->route('dashboard.ceo')
                ->with('success', 'You have successfully joined ' . $company->name . ' as CEO.');
        }

        return redirect()->route('dashboard')
            ->with('success', 'You have successfully joined ' . $invitation->company->name . '.');
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
