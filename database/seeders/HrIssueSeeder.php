<?php

namespace Database\Seeders;

use App\Models\HrIssue;
use Illuminate\Database\Seeder;

class HrIssueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $issues = [
            // Recruitment / Retention
            ['category' => 'recruitment_retention', 'name' => 'Overall hiring cost is high (including headcount expense)', 'order' => 1],
            ['category' => 'recruitment_retention', 'name' => 'Difficulty hiring for key roles', 'order' => 2],
            ['category' => 'recruitment_retention', 'name' => 'Difficulty hiring in compensation discussion', 'order' => 3],
            ['category' => 'recruitment_retention', 'name' => 'High turnover in specific roles or teams', 'order' => 4],
            ['category' => 'recruitment_retention', 'name' => 'High turnover within the first year of employment', 'order' => 5],
            ['category' => 'recruitment_retention', 'name' => 'High turnover within the first three years of employment', 'order' => 6],
            
            // Organization
            ['category' => 'organization', 'name' => 'R&R is not clearly defined', 'order' => 1],
            ['category' => 'organization', 'name' => 'Roles & responsibilities are unclear', 'order' => 2],
            ['category' => 'organization', 'name' => 'Organizational structure is vulnerable to change', 'order' => 3],
            ['category' => 'organization', 'name' => 'Excessive competition or conflict between teams', 'order' => 4],
            ['category' => 'organization', 'name' => 'Organizational rigidity', 'order' => 5],
            ['category' => 'organization', 'name' => 'Avoidance of responsibility and accountability', 'order' => 6],
            ['category' => 'organization', 'name' => 'Workload imbalance', 'order' => 7],
            ['category' => 'organization', 'name' => 'Overall headcount is excessive', 'order' => 8],
            ['category' => 'organization', 'name' => 'Excessive headcount in specific roles', 'order' => 9],
            ['category' => 'organization', 'name' => 'Organizational obesity (overstaffing)', 'order' => 10],
            ['category' => 'organization', 'name' => 'Overall staff shortage', 'order' => 11],
            ['category' => 'organization', 'name' => 'Slow decision-making', 'order' => 12],
            
            // Culture / Leadership
            ['category' => 'culture_leadership', 'name' => 'Top-down or authoritarian leadership style', 'order' => 1],
            ['category' => 'culture_leadership', 'name' => 'Lack of communication between management and employees', 'order' => 2],
            ['category' => 'culture_leadership', 'name' => 'Weak employee engagement', 'order' => 3],
            ['category' => 'culture_leadership', 'name' => 'Some managers lack leadership capability', 'order' => 4],
            ['category' => 'culture_leadership', 'name' => 'Generational conflict', 'order' => 5],
            ['category' => 'culture_leadership', 'name' => 'Low morale or lack of motivation', 'order' => 6],
            ['category' => 'culture_leadership', 'name' => 'Labor–management conflict', 'order' => 7],
            
            // Evaluation / Compensation
            ['category' => 'evaluation_compensation', 'name' => 'Performance evaluation criteria are unclear', 'order' => 1],
            ['category' => 'evaluation_compensation', 'name' => 'Weak performance-based compensation system', 'order' => 2],
            ['category' => 'evaluation_compensation', 'name' => 'Dissatisfaction with fairness of compensation', 'order' => 3],
            ['category' => 'evaluation_compensation', 'name' => 'Compensation is not competitive (market mismatch)', 'order' => 4],
            ['category' => 'evaluation_compensation', 'name' => 'Pay gap between executives and employees', 'order' => 5],
            ['category' => 'evaluation_compensation', 'name' => 'Lack of incentives', 'order' => 6],
            ['category' => 'evaluation_compensation', 'name' => 'Excessive evaluation-related workload', 'order' => 7],
            ['category' => 'evaluation_compensation', 'name' => 'Presence of free riders', 'order' => 8],
            ['category' => 'evaluation_compensation', 'name' => 'Insufficient welfare and benefits', 'order' => 9],
            
            // Upskilling
            ['category' => 'upskilling', 'name' => 'Low employee motivation for learning and development', 'order' => 1],
            ['category' => 'upskilling', 'name' => 'Insufficient training budget or time', 'order' => 2],
            ['category' => 'upskilling', 'name' => 'Lack of leadership development programs', 'order' => 3],
            ['category' => 'upskilling', 'name' => 'Lack of systems to manage low-performers', 'order' => 4],
            
            // Others
            ['category' => 'others', 'name' => 'Other issues', 'order' => 1],
        ];

        foreach ($issues as $issue) {
            HrIssue::create([
                'category' => $issue['category'],
                'name' => $issue['name'],
                'order' => $issue['order'],
                'is_active' => true,
            ]);
        }

        $this->command->info('HR Issues seeded successfully!');
        $this->command->info('Total issues created: ' . HrIssue::count());
    }
}
