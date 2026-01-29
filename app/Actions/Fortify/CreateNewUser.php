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
        // #region agent log
        $logData = ['location' => 'CreateNewUser.php:21', 'message' => 'Registration create method called', 'data' => ['hasName' => isset($input['name']), 'hasEmail' => isset($input['email']), 'hasPassword' => isset($input['password']), 'hasRole' => isset($input['role']), 'sessionId' => session()->getId()], 'timestamp' => time() * 1000, 'sessionId' => 'debug-session', 'runId' => 'run1', 'hypothesisId' => 'A'];
        file_put_contents('c:\laragon\www\HRCopilotSaaS\.cursor\debug.log', json_encode($logData) . "\n", FILE_APPEND);
        // #endregion
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
        ]);

        // Always assign HR Manager role
        $roleToAssign = 'hr_manager';
        
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
