<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
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
    }
}
