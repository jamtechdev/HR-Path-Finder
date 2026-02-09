<?php

namespace Database\Seeders;

use App\Models\PolicySnapshotQuestion;
use Illuminate\Database\Seeder;

class PolicySnapshotQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questions = [
            [
                'order' => 1,
                'question_text' => 'Our company has a formal job classification framework in place.',
                'has_conditional_text' => false,
            ],
            [
                'order' => 2,
                'question_text' => 'Even within the same job, expected roles and responsibilities differ depending on skill level or role maturity.',
                'has_conditional_text' => false,
            ],
            [
                'order' => 3,
                'question_text' => 'Differences in responsibility scope and decision-making authority by job grade (level) are clearly defined.',
                'has_conditional_text' => false,
            ],
            [
                'order' => 4,
                'question_text' => 'Role differences between appointed leaders (e.g., team leaders, division heads) and team members are clearly defined.',
                'has_conditional_text' => false,
            ],
            [
                'order' => 5,
                'question_text' => 'There are jobs in which responsibilities expand as tenure increases.',
                'has_conditional_text' => true,
            ],
            [
                'order' => 6,
                'question_text' => 'Conversely, there are jobs in which responsibilities remain relatively fixed regardless of tenure.',
                'has_conditional_text' => true,
            ],
        ];

        foreach ($questions as $question) {
            PolicySnapshotQuestion::create([
                'question_text' => $question['question_text'],
                'order' => $question['order'],
                'is_active' => true,
                'has_conditional_text' => $question['has_conditional_text'],
            ]);
        }

        $this->command->info('Policy snapshot questions seeded successfully!');
        $this->command->info('Total questions created: ' . PolicySnapshotQuestion::count());
    }
}
