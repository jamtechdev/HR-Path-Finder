<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PerformanceSnapshotQuestion;
use App\Models\PerformanceSnapshotResponse;

class PerformanceSnapshotQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Note: All questions and options are fully manageable via Admin panel.
     * This seeder provides initial data only. Admin can add/edit/remove/reorder without code changes.
     */
    public function run(): void
    {
        // Delete all related responses first (to avoid foreign key constraint issues)
        PerformanceSnapshotResponse::query()->delete();
        
        // Delete all existing performance snapshot questions
        PerformanceSnapshotQuestion::query()->delete();

        // Stage 4-1. Strategic Performance Snapshot (10 Questions)
        // All questions support admin-editable options and answer types
        // Database design supports versioning and metadata for future recommendation automation
        $questions = [
            [
                'question_text' => 'What is the most important purpose of performance management in your company?',
                'answer_type' => 'select_up_to_2',
                'options' => [
                    'Strategic execution alignment',
                    'Differentiation of individual performance',
                    'Talent development',
                    'Basis for compensation allocation',
                    'Organizational control and management',
                    'Not yet clearly defined',
                ],
                'order' => 1,
                'is_active' => true,
            ],
            [
                'question_text' => 'Are your current business strategy and performance indicators clearly aligned?',
                'answer_type' => 'select_one',
                'options' => [
                    'Very clearly aligned',
                    'Partially aligned',
                    'Formal or superficial alignment',
                    'Barely aligned',
                ],
                'order' => 2,
                'is_active' => true,
            ],
            [
                'question_text' => 'What is the overall level of employee trust in the current performance evaluation process?',
                'answer_type' => 'select_one',
                'options' => [
                    'High',
                    'Moderate',
                    'Low',
                    'Frequent expression of dissatisfaction or conflict',
                ],
                'order' => 3,
                'is_active' => true,
            ],
            [
                'question_text' => 'What is the primary source of dissatisfaction with the current performance evaluation system?',
                'answer_type' => 'select_all_that_apply',
                'options' => [
                    'Unclear goals',
                    'Ambiguous evaluation criteria',
                    'Excessive subjective judgment by managers',
                    'Weak linkage to compensation',
                    'Formalistic implementation',
                    'Other (text)',
                ],
                'order' => 4,
                'is_active' => true,
            ],
            [
                'question_text' => 'Do you believe performance should primarily be managed at the individual level, or at the organizational level?',
                'answer_type' => 'select_one',
                'options' => [
                    'Individual-focused',
                    'Organization-focused',
                    'Hybrid (Individual/Organization)',
                    'Not yet clearly defined',
                ],
                'order' => 5,
                'is_active' => true,
            ],
            [
                'question_text' => 'Do you believe performance should be quantified as much as possible?',
                'answer_type' => 'select_one',
                'options' => [
                    'Primarily quantitative',
                    'Primarily qualitative',
                    'Balanced between quantitative and qualitative',
                    'Depends on the job role',
                ],
                'order' => 6,
                'is_active' => true,
            ],
            [
                'question_text' => 'Even if it increases administrative workload, do you believe ongoing performance tracking and coaching throughout the year are necessary?',
                'answer_type' => 'select_one',
                'options' => [
                    'Agree',
                    'Disagree (may become formalistic)',
                    'Not aligned with current organizational culture',
                ],
                'order' => 7,
                'is_active' => true,
            ],
            [
                'question_text' => 'Are leaders (team leaders and executives) generally willing to actively support the introduction of a new performance management system?',
                'answer_type' => 'select_one',
                'options' => [
                    'Very willing',
                    'Willing',
                    'Neutral',
                    'Slightly unwilling',
                    'Very unwilling',
                ],
                'order' => 8,
                'is_active' => true,
            ],
            [
                'question_text' => 'Is your company willing to differentiate compensation based on performance?',
                'answer_type' => 'select_one',
                'options' => [
                    'Strong differentiation based on performance',
                    'Moderate differentiation (e.g., at organizational level)',
                    'Prefer limited differentiation',
                    'No intention to differentiate',
                ],
                'order' => 9,
                'is_active' => true,
            ],
            [
                'question_text' => 'What is the organizational readiness to differentiate compensation based on performance differences?',
                'answer_type' => 'select_one',
                'options' => [
                    'There is little to no organizational resistance to compensation differentiation between high and low performers',
                    'Some resistance is expected, but adoption is likely over time',
                    'Formal differentiation is possible, but large gaps would be difficult',
                    'There is strong internal resistance to compensation differentiation',
                    'Difficult to assess at this time',
                ],
                'order' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($questions as $question) {
            PerformanceSnapshotQuestion::create($question);
        }
    }
}
