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
                ['name' => $permission, 'guard_name' => 'web'],
                ['name' => $permission, 'guard_name' => 'web']
            );
        }

        // Create roles
        $ceoRole = Role::firstOrCreate(['name' => 'ceo', 'guard_name' => 'web']);
        $hrManagerRole = Role::firstOrCreate(['name' => 'hr_manager', 'guard_name' => 'web']);
        $consultantRole = Role::firstOrCreate(['name' => 'consultant', 'guard_name' => 'web']);

        // Assign permissions to CEO role
        $ceoRole->givePermissionTo([
            'view company',
            'view ceo philosophy',
            'update ceo philosophy',
            'submit ceo philosophy',
            'view ceo approval',
            'approve hr system',
            'request changes',
            'view hr system dashboard',
        ]);

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

        // Assign permissions to Consultant role
        $consultantRole->givePermissionTo([
            'view company',
            'view diagnosis',
            'view ceo philosophy',
            'view organization design',
            'view performance system',
            'view compensation system',
            'view consultant review',
            'create consultant review',
            'update consultant review',
            'view hr system dashboard',
        ]);

        // Demo data (temporary)
        $ceo = User::firstOrCreate(
            ['email' => 'ceo@demo.com'],
            [
                'name' => 'CEO Demo User',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        if (!$ceo->hasRole('ceo')) {
            $ceo->assignRole('ceo');
        }

        $company = Company::firstOrCreate(
            ['name' => 'Demo Tech Solutions'],
            [
                'industry' => 'Technology',
                'size' => '100-500',
                'created_by' => $ceo->id,
            ]
        );
        $ceo->companies()->syncWithoutDetaching([$company->id => ['role' => 'ceo']]);

        $hrManager = User::firstOrCreate(
            ['email' => 'hr@demo.com'],
            [
                'name' => 'HR Manager Demo User',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        if (!$hrManager->hasRole('hr_manager')) {
            $hrManager->assignRole('hr_manager');
        }
        $hrManager->companies()->syncWithoutDetaching([$company->id => ['role' => 'hr_manager']]);

        $consultant = User::firstOrCreate(
            ['email' => 'consultant@demo.com'],
            [
                'name' => 'Consultant Demo User',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );
        if (!$consultant->hasRole('consultant')) {
            $consultant->assignRole('consultant');
        }

        $legacyHrManager = User::firstOrCreate(
            ['email' => 'hr@company.com'],
            [
                'name' => 'HR Manager Demo',
                'email' => 'hr@company.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$legacyHrManager->hasRole('hr_manager')) {
            $legacyHrManager->assignRole('hr_manager');
        }

        $legacyCeo = User::firstOrCreate(
            ['email' => 'ceo@company.com'],
            [
                'name' => 'CEO Demo',
                'email' => 'ceo@company.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$legacyCeo->hasRole('ceo')) {
            $legacyCeo->assignRole('ceo');
        }

        $legacyConsultant = User::firstOrCreate(
            ['email' => 'admin@hrpathfinder.com'],
            [
                'name' => 'Consultant Demo',
                'email' => 'admin@hrpathfinder.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$legacyConsultant->hasRole('consultant')) {
            $legacyConsultant->assignRole('consultant');
        }

        $this->command->info('Demo accounts seeded.');
    }
}
