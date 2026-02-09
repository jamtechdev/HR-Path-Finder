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
     * Send CEO invitation.
     */
    public function inviteCeo(Request $request, Company $company)
    {
        $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        // Check if user already exists
        $existingUser = User::where('email', $request->email)->first();
        
        if ($existingUser && $company->users->contains($existingUser)) {
            return back()->withErrors(['email' => 'This user is already a member of the company.']);
        }

        // Create invitation
        $invitation = CompanyInvitation::create([
            'company_id' => $company->id,
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

        // Send credentials email
        Notification::route('mail', $invitation->email)
            ->notify(new CompanyInvitationNotification($invitation));

        return redirect()->route('login')
            ->with('success', 'Invitation accepted. Please check your email for login credentials.');
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
