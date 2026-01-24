<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Demo HR Manager Account
        $hrManager = User::firstOrCreate(
            ['email' => 'hr@company.com'],
            [
                'name' => 'HR Manager Demo',
                'email' => 'hr@company.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$hrManager->hasRole('hr_manager')) {
            $hrManager->assignRole('hr_manager');
        }

        // Demo CEO Account
        $ceo = User::firstOrCreate(
            ['email' => 'ceo@company.com'],
            [
                'name' => 'CEO Demo',
                'email' => 'ceo@company.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$ceo->hasRole('ceo')) {
            $ceo->assignRole('ceo');
        }

        // Demo Consultant Account (admin@hrpathfinder.com)
        $consultant = User::firstOrCreate(
            ['email' => 'admin@hrpathfinder.com'],
            [
                'name' => 'Consultant Demo',
                'email' => 'admin@hrpathfinder.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$consultant->hasRole('consultant')) {
            $consultant->assignRole('consultant');
        }

        $this->command->info('Demo accounts created successfully!');
    }
}
