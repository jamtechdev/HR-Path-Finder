<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Notifications\CompanyInvitationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CeoController extends Controller
{
    /**
     * Display CEO management page.
     */
    public function index(): Response
    {
        $ceos = User::role('ceo')->with('companies')->get();
        $companies = Company::with('users')->get();
        
        // Get all CEO invitations with status (including soft deleted/rejected ones)
        $invitations = \App\Models\CompanyInvitation::where('role', 'ceo')
            ->withTrashed()
            ->with(['company', 'inviter', 'hrProject'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($invitation) {
                $status = 'pending';
                if ($invitation->accepted_at) {
                    $status = 'accepted';
                } elseif ($invitation->trashed()) {
                    $status = 'rejected';
                }
                
                return [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'company' => $invitation->company ? [
                        'id' => $invitation->company->id,
                        'name' => $invitation->company->name,
                    ] : null,
                    'status' => $status,
                    'invited_by' => $invitation->inviter ? [
                        'id' => $invitation->inviter->id,
                        'name' => $invitation->inviter->name,
                        'email' => $invitation->inviter->email,
                    ] : null,
                    'invited_at' => $invitation->created_at,
                    'accepted_at' => $invitation->accepted_at,
                    'rejected_at' => $invitation->trashed() ? $invitation->deleted_at : null,
                    'hr_project' => $invitation->hrProject ? [
                        'id' => $invitation->hrProject->id,
                    ] : null,
                ];
            });

        return Inertia::render('Admin/Ceo/Index', [
            'ceos' => $ceos,
            'companies' => $companies,
            'invitations' => $invitations,
        ]);
    }

    /**
     * Create a new CEO user and optionally assign to company.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'company_id' => ['nullable', 'exists:companies,id'],
        ]);

        // Check if user already exists
        $existingUser = User::where('email', $request->email)->first();
        
        if ($existingUser) {
            // User exists, assign CEO role if not already assigned
            if (!$existingUser->hasRole('ceo')) {
                $existingUser->assignRole('ceo');
            }
            $ceo = $existingUser;
        } else {
            // Generate temporary password
            $temporaryPassword = Str::random(12);

            // Create CEO user
            $ceo = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($temporaryPassword),
                'email_verified_at' => now(),
            ]);

            // Assign CEO role
            $ceo->assignRole('ceo');
        }

        // If company_id is provided, associate CEO with company
        if ($request->company_id) {
            $company = Company::findOrFail($request->company_id);
            
            // Check if CEO is already associated with this company
            $isCompanyMember = $company->users->contains($ceo);
            $existingCompanyRoles = [];
            if ($isCompanyMember) {
                $existingCompanyRoles = $company->users()
                    ->where('users.id', $ceo->id)
                    ->pluck('company_users.role')
                    ->toArray();
            }

            // Associate CEO with company if not already associated
            if (!in_array('ceo', $existingCompanyRoles)) {
                $company->users()->syncWithoutDetaching([
                    $ceo->id => ['role' => 'ceo'],
                ]);

                // Create invitation record for tracking
                $invitation = \App\Models\CompanyInvitation::create([
                    'company_id' => $company->id,
                    'email' => $request->email,
                    'role' => 'ceo',
                    'inviter_id' => $request->user()->id,
                    'accepted_at' => now(),
                    'temporary_password' => $existingUser ? null : $temporaryPassword,
                ]);

                // Send welcome email with credentials
                try {
                    \Log::info('Sending CEO Welcome Email (Admin Created)', [
                        'invitation_id' => $invitation->id,
                        'email' => $request->email,
                        'company_id' => $company->id,
                        'company_name' => $company->name,
                        'is_new_user' => !$existingUser,
                        'mailer' => config('mail.default'),
                        'mail_host' => config('mail.mailers.smtp.host'),
                        'timestamp' => now()->toIso8601String(),
                    ]);

                    Notification::route('mail', $request->email)
                        ->notify(new CompanyInvitationNotification($invitation));

                    \Log::info('CEO Welcome Email sent successfully (Admin Created)', [
                        'invitation_id' => $invitation->id,
                        'email' => $request->email,
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to send CEO Welcome Email (Admin Created)', [
                        'invitation_id' => $invitation->id,
                        'email' => $request->email,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }

                $message = $existingUser 
                    ? "CEO account has been successfully assigned to {$company->name}. Welcome email sent."
                    : "CEO account created and assigned to {$company->name}. Welcome email with credentials sent.";
            } else {
                $message = "CEO is already associated with {$company->name}.";
            }
        } else {
            $message = $existingUser 
                ? "CEO account already exists. Please assign to a company."
                : "CEO created successfully. Please assign to a company.";
        }

        return back()->with('success', $message);
    }
}
