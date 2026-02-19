<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call(RolePermissionSeeder::class);

        // Seed industry master data
        $this->call(IndustrySeeder::class);

        // Seed diagnosis questions for HR and CEO
        $this->call(DiagnosisQuestionSeeder::class);
        
        // Seed policy snapshot questions
        $this->call(PolicySnapshotQuestionSeeder::class);
        
        // Seed performance snapshot questions
        $this->call(PerformanceSnapshotQuestionSeeder::class);
        
        // Seed HR issues
        $this->call(HrIssueSeeder::class);
        
        // Seed job keywords
        $this->call(JobKeywordSeeder::class);
        
        // Seed intro texts
        $this->call(IntroTextSeeder::class);
        
        // Seed HQ locations
        $this->call(HqLocationSeeder::class);
        
        // Seed job definition templates (must run after JobKeywordSeeder)
        $this->call(JobDefinitionTemplateSeeder::class);
        
        // Seed landing page sections
        $this->call(LandingPageSectionSeeder::class);

        // Seed sample HR project if needed
        // $this->call(HrProjectSeeder::class);
    }
}
