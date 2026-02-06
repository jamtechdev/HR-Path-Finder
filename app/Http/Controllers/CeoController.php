<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use App\Models\CompanyInvitation;
use App\Notifications\CompanyInvitationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CeoController extends Controller
{
    /**
     * Display a listing of CEOs.
     */
    public function index(): Response
    {
        // Only HR Managers can access
        if (!Auth::user()->hasRole('hr_manager')) {
            abort(403);
        }

        $user = Auth::user();
        
        // Get all companies where user is HR Manager
        $companies = $user->companies()->wherePivot('role', 'hr_manager')->get();
        $companyIds = $companies->pluck('id');

        // Get all CEOs from these companies
        $ceos = User::whereHas('roles', function($query) {
            $query->where('name', 'ceo');
        })
        ->whereHas('companies', function($query) use ($companyIds) {
            $query->whereIn('companies.id', $companyIds)
                  ->where('company_users.role', 'ceo');
        })
        ->with(['companies' => function($query) use ($companyIds) {
            $query->whereIn('companies.id', $companyIds)
                  ->where('company_users.role', 'ceo');
        }])
        ->get()
        ->map(function($ceo) {
            return [
                'id' => $ceo->id,
                'name' => $ceo->name,
                'email' => $ceo->email,
                'companies' => $ceo->companies->map(function($company) {
                    return [
                        'id' => $company->id,
                        'name' => $company->name,
                    ];
                }),
                'created_at' => $ceo->created_at,
            ];
        });

        // Get pending invitations
        $pendingInvitations = CompanyInvitation::whereIn('company_id', $companyIds)
            ->whereNull('accepted_at')
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->with('company')
            ->latest()
            ->get()
            ->map(function($invitation) {
                return [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'company_id' => $invitation->company_id,
                    'company_name' => $invitation->company->name,
                    'created_at' => $invitation->created_at,
                    'expires_at' => $invitation->expires_at,
                ];
            });

        // Get accepted invitations for status display - get the latest accepted invitation per email+company
        $acceptedInvitations = CompanyInvitation::whereIn('company_id', $companyIds)
            ->whereNotNull('accepted_at')
            ->with('company')
            ->get()
            ->groupBy(function($invitation) {
                return $invitation->email . '_' . $invitation->company_id;
            })
            ->map(function($group) {
                // Get the latest accepted invitation for each email+company combination
                return $group->sortByDesc('accepted_at')->first();
            })
            ->map(function($invitation) {
                return [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'company_id' => $invitation->company_id,
                    'company_name' => $invitation->company->name,
                    'accepted_at' => $invitation->accepted_at ? $invitation->accepted_at->toDateTimeString() : null,
                ];
            })
            ->values();

        // Create a map of pending invitations by CEO email and company ID for easy lookup
        $pendingInvitationsMap = [];
        foreach ($pendingInvitations as $invitation) {
            $key = $invitation['email'] . '_' . $invitation['company_id'];
            $pendingInvitationsMap[$key] = $invitation['id'];
        }

        // Create a map of accepted invitations by CEO email and company ID for easy lookup
        $acceptedInvitationsMap = [];
        foreach ($acceptedInvitations as $invitation) {
            $key = $invitation['email'] . '_' . $invitation['company_id'];
            $acceptedInvitationsMap[$key] = $invitation;
        }

        return Inertia::render('CEOs/Index', [
            'ceos' => $ceos,
            'pendingInvitations' => $pendingInvitations,
            'pendingInvitationsMap' => $pendingInvitationsMap,
            'acceptedInvitationsMap' => $acceptedInvitationsMap,
            'companies' => $companies,
        ]);
    }

    /**
     * Show the form for creating a new CEO.
     */
    public function create(): Response
    {
        if (!Auth::user()->hasRole('hr_manager')) {
            abort(403);
        }

        $user = Auth::user();
        $companies = $user->companies()->wherePivot('role', 'hr_manager')->get();

        return Inertia::render('CEOs/Create', [
            'companies' => $companies,
        ]);
    }

    /**
     * Store a newly created CEO.
     */
    public function store(Request $request)
    {
        if (!Auth::user()->hasRole('hr_manager')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'company_id' => 'required|exists:companies,id',
            'send_invitation' => 'nullable|boolean',
        ]);

        $user = Auth::user();
        
        // Verify HR Manager has access to this company
        $company = Company::findOrFail($validated['company_id']);
        if (!$user->companies()->wherePivot('role', 'hr_manager')->where('companies.id', $company->id)->exists()) {
            abort(403, 'You do not have access to this company.');
        }

        // Check if user already exists with this email
        $existingUser = User::where('email', $validated['email'])->first();

        if ($existingUser) {
            // If user exists, check if already attached to this company
            if ($company->users()->where('users.id', $existingUser->id)->exists()) {
                return back()->withErrors(['email' => 'This user is already a member of this company.']);
            }

            // Attach existing user to company
            $company->users()->attach($existingUser->id, ['role' => 'ceo']);
            if (!$existingUser->hasRole('ceo')) {
                $existingUser->assignRole('ceo');
            }

            $ceo = $existingUser;
        } else {
            // Generate temporary password
            $temporaryPassword = \Illuminate\Support\Str::random(12);

            // Create new CEO user
            $ceo = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($temporaryPassword),
                'email_verified_at' => now(),
                'address' => $validated['address'] ?? null,
                'city' => $validated['city'] ?? null,
                'state' => $validated['state'] ?? null,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
            ]);

            // Assign CEO role
            $ceo->assignRole('ceo');

            // Attach to company
            $company->users()->attach($ceo->id, ['role' => 'ceo']);

            // Send invitation email if requested
            if ($request->boolean('send_invitation')) {
                $invitation = CompanyInvitation::create([
                    'company_id' => $company->id,
                    'invited_by' => Auth::id(),
                    'email' => $ceo->email,
                    'role' => 'ceo',
                    'token' => CompanyInvitation::generateToken(),
                    'expires_at' => now()->addDays(7),
                    'accepted_at' => now(), // Mark as accepted since we're creating the account
                    'temporary_password' => $temporaryPassword,
                ]);

                $ceo->notify(new CompanyInvitationNotification($invitation));
            }
        }

        return redirect()->route('hr-manager.ceos.index')
            ->with('success', 'CEO added successfully' . ($request->boolean('send_invitation') ? ' and invitation sent.' : '.'));
    }

    /**
     * Show the form for editing the specified CEO.
     */
    public function edit(User $ceo): Response
    {
        if (!Auth::user()->hasRole('hr_manager')) {
            abort(403);
        }

        $user = Auth::user();
        $companies = $user->companies()->wherePivot('role', 'hr_manager')->get();
        
        // Verify CEO belongs to one of HR Manager's companies
        $ceoCompanies = $ceo->companies()->whereIn('companies.id', $companies->pluck('id'))
            ->wherePivot('role', 'ceo')
            ->get();

        if ($ceoCompanies->isEmpty()) {
            abort(403, 'You do not have access to this CEO.');
        }

        return Inertia::render('CEOs/Edit', [
            'ceo' => [
                'id' => $ceo->id,
                'name' => $ceo->name,
                'email' => $ceo->email,
                'address' => $ceo->address,
                'city' => $ceo->city,
                'state' => $ceo->state,
                'latitude' => $ceo->latitude,
                'longitude' => $ceo->longitude,
                'companies' => $ceoCompanies->map(function($company) {
                    return [
                        'id' => $company->id,
                        'name' => $company->name,
                    ];
                }),
            ],
            'companies' => $companies,
        ]);
    }

    /**
     * Update the specified CEO.
     */
    public function update(Request $request, User $ceo)
    {
        if (!Auth::user()->hasRole('hr_manager')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $ceo->id,
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'company_ids' => 'required|array',
            'company_ids.*' => 'exists:companies,id',
        ]);

        $user = Auth::user();
        
        // Verify HR Manager has access to all selected companies
        $hrManagerCompanies = $user->companies()->wherePivot('role', 'hr_manager')->pluck('companies.id');
        foreach ($validated['company_ids'] as $companyId) {
            if (!$hrManagerCompanies->contains($companyId)) {
                abort(403, 'You do not have access to one or more selected companies.');
            }
        }

        // Update CEO details
        $ceo->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'address' => $validated['address'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
        ]);

        // Update company associations (only for companies HR Manager has access to)
        $syncData = [];
        foreach ($validated['company_ids'] as $companyId) {
            $syncData[$companyId] = ['role' => 'ceo'];
        }
        
        // Keep existing associations with companies HR Manager doesn't manage
        $existingCompanies = $ceo->companies()
            ->whereNotIn('companies.id', $hrManagerCompanies)
            ->wherePivot('role', 'ceo')
            ->pluck('companies.id');
        
        foreach ($existingCompanies as $companyId) {
            $syncData[$companyId] = ['role' => 'ceo'];
        }

        $ceo->companies()->sync($syncData);

        return redirect()->route('hr-manager.ceos.index')
            ->with('success', 'CEO updated successfully.');
    }

    /**
     * Remove the specified CEO from a company.
     */
    public function destroy(User $ceo, Company $company)
    {
        if (!Auth::user()->hasRole('hr_manager')) {
            abort(403);
        }

        $user = Auth::user();
        
        // Verify HR Manager has access to this company
        if (!$user->companies()->wherePivot('role', 'hr_manager')->where('companies.id', $company->id)->exists()) {
            abort(403);
        }

        // Delete pending invitations for this CEO and company
        CompanyInvitation::where('company_id', $company->id)
            ->where('email', $ceo->email)
            ->whereNull('accepted_at')
            ->whereNull('rejected_at')
            ->delete();

        // Detach CEO from company
        $company->users()->detach($ceo->id);

        return redirect()->route('hr-manager.ceos.index')
            ->with('success', 'CEO removed from company successfully. Pending invitations have been cancelled.');
    }

    /**
     * Send invitation to CEO.
     */
    public function sendInvitation(Request $request, User $ceo, Company $company)
    {
        if (!Auth::user()->hasRole('hr_manager')) {
            abort(403);
        }

        $user = Auth::user();
        
        // Verify HR Manager has access to this company
        if (!$user->companies()->wherePivot('role', 'hr_manager')->where('companies.id', $company->id)->exists()) {
            abort(403);
        }

        // Check if CEO is attached to company
        if (!$company->users()->where('users.id', $ceo->id)->wherePivot('role', 'ceo')->exists()) {
            return back()->withErrors(['error' => 'CEO is not associated with this company.']);
        }

        // Check if there's already a pending invitation
        $existingInvitation = CompanyInvitation::where('company_id', $company->id)
            ->where('email', $ceo->email)
            ->whereNull('accepted_at')
            ->whereNull('rejected_at')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();

        if ($existingInvitation) {
            return back()->withErrors(['error' => 'An invitation has already been sent to this CEO.']);
        }
        
        // Check SMTP configuration before sending invitation
        // #region agent log
        $smtpConfigured = \App\Services\SmtpConfigurationService::isConfigured();
        \Log::info('CEO Invitation Debug', [
            'smtp_configured' => $smtpConfigured,
            'ceo_email' => $ceo->email,
            'company_id' => $company->id,
            'mail_default' => config('mail.default'),
            'queue_connection' => config('queue.default'),
        ]);
        // #endregion
        
        if (!$smtpConfigured) {
            return back()->withErrors(['error' => 'SMTP is not configured. Please configure email settings before sending invitations.']);
        }

        // Generate temporary password if CEO doesn't have one set
        $temporaryPassword = \Illuminate\Support\Str::random(12);
        
        // Create invitation
        $invitation = CompanyInvitation::create([
            'company_id' => $company->id,
            'invited_by' => Auth::id(),
            'email' => $ceo->email,
            'role' => 'ceo',
            'token' => CompanyInvitation::generateToken(),
            'expires_at' => now()->addDays(7),
        ]);

        // Send invitation email
        // #region agent log
        \Log::info('Sending CEO invitation email', [
            'invitation_id' => $invitation->id,
            'email' => $ceo->email,
            'notification_class' => CompanyInvitationNotification::class,
            'queue_connection' => config('queue.default'),
            'mail_driver' => config('mail.default'),
        ]);
        // #endregion
        
        try {
            // Send email directly using Mail::send (no queue needed)
            // #region agent log
            \Log::info('Sending email directly using Mail::send', [
                'email' => $ceo->email,
                'invitation_id' => $invitation->id,
            ]);
            // #endregion
            
            // Create notification instance to get mail message
            $notification = new CompanyInvitationNotification($invitation);
            $mailMessage = $notification->toMail($ceo);
            
            // Extract data from MailMessage
            $mailData = [
                'subject' => $mailMessage->subject,
                'greeting' => $mailMessage->greeting ?? 'Hello!',
                'introLines' => $mailMessage->introLines ?? [],
                'actionText' => $mailMessage->actionText ?? null,
                'actionUrl' => $mailMessage->actionUrl ?? null,
                'outroLines' => $mailMessage->outroLines ?? [],
                'salutation' => $mailMessage->salutation ?? 'Best regards,<br>The HR Path-Finder Team',
            ];
            
            // Send email directly using Mail facade
            \Illuminate\Support\Facades\Mail::send([], [], function ($message) use ($mailData, $ceo) {
                $message->to($ceo->email)
                    ->subject($mailData['subject']);
                
                // Build HTML content
                $html = view('emails.invitation', $mailData)->render();
                
                $message->html($html);
            });
            
            // #region agent log
            \Log::info('Email sent successfully via Mail::send', [
                'email' => $ceo->email,
                'invitation_id' => $invitation->id,
                'sent_at' => now()->toDateTimeString(),
            ]);
            // #endregion
        } catch (\Exception $e) {
            // #region agent log
            \Log::error('Failed to send CEO invitation email', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'email' => $ceo->email,
            ]);
            // #endregion
            return back()->withErrors(['error' => 'Failed to send invitation email: ' . $e->getMessage()]);
        }

        return back()->with('success', 'Invitation sent successfully to ' . $ceo->email . '.');
    }

    /**
     * Resend invitation email.
     */
    public function resendInvitation(CompanyInvitation $invitation)
    {
        if (!Auth::user()->hasRole('hr_manager')) {
            abort(403);
        }

        $user = Auth::user();
        
        // Verify HR Manager has access to this company
        if (!$user->companies()->wherePivot('role', 'hr_manager')->where('companies.id', $invitation->company_id)->exists()) {
            abort(403);
        }

        // Check if invitation is still valid (not accepted/rejected)
        if ($invitation->accepted_at || $invitation->rejected_at) {
            return back()->withErrors(['error' => 'This invitation has already been ' . ($invitation->accepted_at ? 'accepted' : 'rejected') . '.']);
        }

        // Check if invitation has expired - extend it
        if ($invitation->expires_at && $invitation->expires_at->isPast()) {
            $invitation->update(['expires_at' => now()->addDays(7)]);
        }

        // #region agent log
        \Log::info('Resending CEO invitation email', [
            'invitation_id' => $invitation->id,
            'email' => $invitation->email,
            'company_id' => $invitation->company_id,
        ]);
        // #endregion

        // Send invitation email directly using Mail::send
        try {
            // Create notification instance to get mail message
            $notification = new CompanyInvitationNotification($invitation->fresh());
            $mailMessage = $notification->toMail((object)['email' => $invitation->email]);
            
            // Extract data from MailMessage
            $mailData = [
                'subject' => $mailMessage->subject,
                'greeting' => $mailMessage->greeting ?? 'Hello!',
                'introLines' => $mailMessage->introLines ?? [],
                'actionText' => $mailMessage->actionText ?? null,
                'actionUrl' => $mailMessage->actionUrl ?? null,
                'outroLines' => $mailMessage->outroLines ?? [],
                'salutation' => $mailMessage->salutation ?? 'Best regards,<br>The HR Path-Finder Team',
            ];
            
            // Send email directly using Mail facade
            \Illuminate\Support\Facades\Mail::send([], [], function ($message) use ($mailData, $invitation) {
                $message->to($invitation->email)
                    ->subject($mailData['subject']);
                
                // Build HTML content
                $html = view('emails.invitation', $mailData)->render();
                
                $message->html($html);
            });
            
            // #region agent log
            \Log::info('Invitation email resent successfully via Mail::send', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email,
                'resent_at' => now()->toDateTimeString(),
            ]);
            // #endregion

            return back()->with('success', 'Invitation email resent successfully to ' . $invitation->email . '.');
        } catch (\Exception $e) {
            // #region agent log
            \Log::error('Failed to resend invitation email', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'invitation_id' => $invitation->id,
            ]);
            // #endregion
            return back()->withErrors(['error' => 'Failed to resend invitation email: ' . $e->getMessage()]);
        }
    }
}
