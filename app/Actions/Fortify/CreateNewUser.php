<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        // Remove role from input if present (we assign it automatically)
        unset($input['role']);
        
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        try {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
            ]);
        } catch (\Exception $e) {
            \Log::error('User creation failed', [
                'error' => $e->getMessage(),
                'input' => array_merge($input, ['password' => '***']),
            ]);
            throw $e;
        }

        // Always assign HR Manager role
        $roleToAssign = 'hr_manager';
        
        // Assign the role (will create if it doesn't exist via firstOrCreate in seeder)
        try {
            // Ensure role exists
            \Spatie\Permission\Models\Role::firstOrCreate(
                ['name' => $roleToAssign, 'guard_name' => 'web']
            );
            
            $user->assignRole($roleToAssign);
            
            // Clear permission cache to ensure roles are fresh
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
            
            // Reload user with fresh roles from database
            $user->refresh();
            $user->load('roles');
            
            // Verify role was assigned
            if (!$user->hasRole($roleToAssign)) {
                // Force assign if somehow not assigned
                $user->assignRole($roleToAssign);
                $user->refresh();
                $user->load('roles');
            }
        } catch (\Exception $e) {
            \Log::error('Role assignment failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'role' => $roleToAssign,
            ]);
            // Don't fail registration if role assignment fails - user can still be created
            // Admin can assign role manually if needed
        }

        // Check if there's a pending invitation for this email
        $invitationToken = session('invitation_token');
        if ($invitationToken) {
            $invitation = \App\Models\CompanyInvitation::where('token', $invitationToken)
                ->where('email', $user->email)
                ->whereNull('accepted_at')
                ->first();

            if ($invitation && $invitation->isValid()) {
                // Accept the invitation
                $company = $invitation->company;
                $company->users()->syncWithoutDetaching([
                    $user->id => ['role' => $invitation->role],
                ]);

                // Assign role if not already assigned
                if (!$user->hasRole($invitation->role)) {
                    $user->assignRole($invitation->role);
                }

                // Mark invitation as accepted
                $invitation->update(['accepted_at' => now()]);

                // Clear invitation token from session
                session()->forget('invitation_token');
            }
        }

        // Send email verification notification after user creation
        if (!$user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }

        return $user;
    }
}
