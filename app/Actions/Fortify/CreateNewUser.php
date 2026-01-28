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
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'role' => ['nullable', 'string', 'in:hr_manager,ceo'],
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
        ]);

        // Debug: Log the input to see what's being received
        \Log::info('Registration input', ['input' => $input, 'role' => $input['role'] ?? 'NOT SET']);
        
        // Ensure roles exist before assigning
        $availableRoles = ['hr_manager', 'ceo', 'consultant'];
        
        // Check if the requested role exists, otherwise default to hr_manager
        $roleToAssign = 'hr_manager'; // Default role
        
        // Check if role is provided and valid
        if (isset($input['role']) && !empty($input['role']) && is_string($input['role'])) {
            $requestedRole = trim($input['role']);
            
            if (in_array($requestedRole, $availableRoles)) {
                // Verify role exists in database
                $roleExists = \Spatie\Permission\Models\Role::where('name', $requestedRole)
                    ->where('guard_name', 'web')
                    ->exists();
                
                if ($roleExists) {
                    $roleToAssign = $requestedRole;
                    \Log::info('Role assigned', ['role' => $roleToAssign, 'user_email' => $input['email']]);
                } else {
                    \Log::warning('Role does not exist in database', ['requested_role' => $requestedRole]);
                }
            } else {
                \Log::warning('Invalid role provided', ['requested_role' => $requestedRole, 'available_roles' => $availableRoles]);
            }
        } else {
            \Log::warning('No role provided in registration', ['input_keys' => array_keys($input)]);
        }
        
        // Assign the role (will create if it doesn't exist via firstOrCreate in seeder)
        try {
            $user->assignRole($roleToAssign);
        } catch (\Spatie\Permission\Exceptions\RoleDoesNotExist $e) {
            // If role doesn't exist, create it and assign
            \Spatie\Permission\Models\Role::firstOrCreate(
                ['name' => $roleToAssign, 'guard_name' => 'web']
            );
            $user->assignRole($roleToAssign);
        }
        
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

        return $user;
    }
}
