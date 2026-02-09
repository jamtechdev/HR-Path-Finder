<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions for HR project steps
        $permissions = [
            // Company permissions
            'create company',
            'view company',
            'update company',
            
            // Diagnosis permissions
            'create diagnosis',
            'view diagnosis',
            'update diagnosis',
            'submit diagnosis',
            
            // CEO Philosophy permissions
            'view ceo philosophy',
            'update ceo philosophy',
            'submit ceo philosophy',
            
            // Organization Design permissions
            'view organization design',
            'update organization design',
            'submit organization design',
            
            // Performance System permissions
            'view performance system',
            'update performance system',
            'submit performance system',
            
            // Compensation System permissions
            'view compensation system',
            'update compensation system',
            'submit compensation system',
            
            // Consultant Review permissions
            'view consultant review',
            'create consultant review',
            'update consultant review',
            
            // CEO Approval permissions
            'view ceo approval',
            'approve hr system',
            'request changes',
            
            // Dashboard permissions
            'view hr system dashboard',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web']
            );
        }

        // Get all permissions for admin role
        $allPermissions = Permission::all()->pluck('name')->toArray();

        // Create Admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        // Admin has all permissions
        $adminRole->syncPermissions($allPermissions);

        // Create HR Manager role
        $hrManagerRole = Role::firstOrCreate(['name' => 'hr_manager', 'guard_name' => 'web']);

        // Assign permissions to HR Manager role
        $hrManagerRole->givePermissionTo([
            'create company',
            'view company',
            'update company',
            'create diagnosis',
            'view diagnosis',
            'update diagnosis',
            'submit diagnosis',
            'view organization design',
            'update organization design',
            'submit organization design',
            'view performance system',
            'update performance system',
            'submit performance system',
            'view compensation system',
            'update compensation system',
            'submit compensation system',
            'view hr system dashboard',
        ]);

        // Create CEO role
        $ceoRole = Role::firstOrCreate(['name' => 'ceo', 'guard_name' => 'web']);

        // Assign permissions to CEO role
        $ceoRole->givePermissionTo([
            'view company',
            'view ceo philosophy',
            'update ceo philosophy',
            'submit ceo philosophy',
            'view organization design',
            'view performance system',
            'view compensation system',
            'view ceo approval',
            'approve hr system',
            'request changes',
            'view hr system dashboard',
        ]);

        // Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        $admin->syncRoles(['admin']);

        // Create HR Manager User
        $hrManager = User::firstOrCreate(
            ['email' => 'hr@demo.com'],
            [
                'name' => 'HR Manager',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        $hrManager->syncRoles(['hr_manager']);

        // Create CEO User
        $ceo = User::firstOrCreate(
            ['email' => 'ceo@demo.com'],
            [
                'name' => 'CEO',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        $ceo->syncRoles(['ceo']);

        $this->command->info('Roles and users seeded successfully!');
        $this->command->info('Admin: admin@demo.com / password123');
        $this->command->info('HR Manager: hr@demo.com / password123');
        $this->command->info('CEO: ceo@demo.com / password123');
        $this->command->info('');
        $this->command->info('=== Demo Users Created ===');
        $this->command->info('Admin: admin@demo.com / password123');
        $this->command->info('HR Manager: hr@demo.com / password123');
        $this->command->info('CEO: ceo@demo.com / password123');
        $this->command->info('Consultant: consultant@demo.com / password123');
        $this->command->info('');
        $this->command->info('Note: All users are email verified and ready to use.');
    }
}
