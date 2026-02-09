<?php

namespace Database\Seeders;

use App\Models\IntroText;
use Illuminate\Database\Seeder;

class IntroTextSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $introTexts = [
            [
                'key' => 'ceo_survey_intro',
                'title' => 'Before You Begin',
                'content' => "This diagnostic is not an evaluation of your leadership or performance.\nThere are no right or wrong answers.\nThis assessment is designed to understand your current management priorities and decision-making perspective, based on your responses at this point in time.\nPlease note the following:\n• Your individual responses will not be shared as-is with the HR manager or any other employees.\n• No one will be able to view your original answers to individual questions.\n• Results will be used only after being aggregated, interpreted, and anonymized into summary insights.\n• Any comparison with HR input is intended to understand differences in perspective, not to judge or evaluate individuals.\nFor the most meaningful outcome, please answer honestly and instinctively, based on what you consider most important right now, rather than what may appear ideal or socially desirable.",
                'is_active' => true,
            ],
            [
                'key' => 'hr_job_analysis_intro',
                'title' => 'Before You Begin',
                'content' => "This stage is not intended to redesign or change your current organizational structure.\nIts purpose is to organize and clarify the job standards and role expectations\nas they are currently operated within your company.\n\nThere are no right or wrong answers to any of the questions.\nYour responses will be used solely as baseline inputs\nfor the subsequent design of the performance management and compensation systems.\n\nAll inputs are confidential and will not be shared with other employees.\n\nAdditional Notice (MVP Scope Limitation):\nOrganizational structure and job grade systems are too broad to fully formalize at this stage.\nFor the MVP, we focus on structuring the organization solely through job analysis.",
                'is_active' => true,
            ],
        ];

        foreach ($introTexts as $introText) {
            IntroText::updateOrCreate(
                ['key' => $introText['key']],
                $introText
            );
        }

        $this->command->info('Intro texts seeded successfully!');
    }
}
