<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CompensationSnapshotQuestion;
use App\Models\CompensationSnapshotResponse;

class CompensationSnapshotQuestionSeeder extends Seeder
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
        CompensationSnapshotResponse::query()->delete();
        
        // Delete all existing compensation snapshot questions
        CompensationSnapshotQuestion::query()->delete();

        // Stage 4-1. Strategic Compensation Snapshot (19 Questions)
        // All questions support admin-editable options and answer types
        // Database design supports versioning and metadata for future recommendation automation
        $questions = [
            [
                'order' => 1,
                'question_text' => 'Please select the two statements that best describe your company\'s compensation philosophy.',
                'answer_type' => 'select_up_to_2',
                'options' => [
                    'Above industry average',
                    'Maintain industry average',
                    'Internal equity priority',
                    'Performance-based differentiated pay',
                    'Additional compensation for critical roles',
                ],
                'is_active' => true,
                'metadata' => [
                    'is_multi_year' => false,
                    'is_job_functions' => false,
                    'is_years_of_service' => false,
                ],
            ],
            [
                'order' => 2,
                'question_text' => 'How would you assess your company\'s current compensation level relative to the market?',
                'answer_type' => 'select_one',
                'options' => [
                    'Top of industry',
                    'Above industry average',
                    'Market average',
                    'Below industry average',
                    'Bottom of industry',
                    'Not sure',
                ],
                'is_active' => true,
            ],
            [
                'order' => 3,
                'question_text' => 'What was the total base salary paid in the last fiscal year? (Based on actual cumulative payments)',
                'answer_type' => 'numeric',
                'options' => null,
                'is_active' => true,
                'metadata' => [
                    'unit' => 'KRW',
                    'auto_populate_to' => 'benefits_previous_year_total_salary',
                ],
            ],
            [
                'order' => 4,
                'question_text' => 'What was the total bonus amount paid in the last fiscal year?',
                'answer_type' => 'numeric',
                'options' => null,
                'is_active' => true,
                'metadata' => [
                    'unit' => 'KRW',
                ],
            ],
            [
                'order' => 5,
                'question_text' => 'What was the total benefits expenditure in the last fiscal year? (Excluding statutory benefits such as social insurance)',
                'answer_type' => 'numeric',
                'options' => null,
                'is_active' => true,
                'metadata' => [
                    'unit' => 'KRW',
                    'auto_populate_to' => 'benefits_previous_year_total_benefits_expense',
                ],
            ],
            [
                'order' => 6,
                'question_text' => 'Even for similar roles, are compensation gaps significant due to differences in employees\' prior salary levels?',
                'answer_type' => 'select_one',
                'options' => [
                    'Significant overall',
                    'Not significantly different',
                    'Applies only to some roles',
                ],
                'is_active' => true,
            ],
            [
                'order' => 7,
                'question_text' => 'Does your company provide differentiated compensation for key talent? (Excluding executives)',
                'answer_type' => 'select_one',
                'options' => [
                    'Very actively applied',
                    'Partially applied',
                    'Rarely applied',
                    'No key talent differentiation system',
                ],
                'is_active' => true,
            ],
            [
                'order' => 8,
                'question_text' => 'What has been the average annual salary increase rate over the past three years? (Excluding executives)',
                'answer_type' => 'numeric_multi_year',
                'options' => null,
                'is_active' => true,
                'metadata' => [
                    'years' => ['2023', '2024', '2025'],
                    'unit' => '%',
                ],
            ],
            [
                'order' => 9,
                'question_text' => 'What has been your labor cost ratio over the past three years? (Labor cost / annual revenue)',
                'answer_type' => 'numeric_multi_year',
                'options' => null,
                'is_active' => true,
                'metadata' => [
                    'years' => ['2023', '2024', '2025'],
                    'unit' => '%',
                ],
            ],
            [
                'order' => 10,
                'question_text' => 'How does your company plan to manage labor costs going forward?',
                'answer_type' => 'select_one',
                'options' => [
                    'Maintain stable total labor cost',
                    'Maintain labor cost but increase performance-based portion',
                    'Accept labor cost variability based on financial performance',
                    'Proactively increase labor cost to secure talent',
                ],
                'is_active' => true,
            ],
            [
                'order' => 11,
                'question_text' => 'What is the current average salary by job function?',
                'answer_type' => 'numeric_job_rows',
                'options' => null,
                'is_active' => true,
                'metadata' => [
                    'unit' => 'KRW',
                    'default_functions' => ['Overall', 'Management', 'R&D', 'Sales & Marketing', 'Production'],
                ],
            ],
            [
                'order' => 12,
                'question_text' => 'What is the current average salary by years of service?',
                'answer_type' => 'numeric_service_ranges',
                'options' => null,
                'is_active' => true,
                'metadata' => [
                    'unit' => 'KRW',
                    'service_ranges' => [
                        ['label' => 'Overall', 'key' => 'overall'],
                        ['label' => '1–3 years', 'key' => '1_3'],
                        ['label' => '4–7 years', 'key' => '4_7'],
                        ['label' => '8–12 years', 'key' => '8_12'],
                        ['label' => '13–17 years', 'key' => '13_17'],
                        ['label' => '18–20 years', 'key' => '18_20'],
                    ],
                ],
            ],
            [
                'order' => 13,
                'question_text' => 'Which metrics should be most important when determining the bonus pool?',
                'answer_type' => 'select_up_to_2',
                'options' => [
                    'Estimated operating profit after tax',
                    'Estimated net profit after tax',
                    'EBITDA',
                    'Revenue growth rate',
                    'Operating profit growth rate',
                    'Target revenue achievement rate',
                    'Target operating profit achievement rate',
                ],
                'is_active' => true,
            ],
            [
                'order' => 14,
                'question_text' => 'Please explain why you selected those metrics.',
                'answer_type' => 'text',
                'options' => null,
                'is_active' => true,
                'metadata' => [
                    'parent_question_order' => 13,
                    'show_when_parent_answered' => true,
                ],
            ],
            [
                'order' => 15,
                'question_text' => 'What is the most appropriate method for allocating the bonus pool?',
                'answer_type' => 'select_one',
                'options' => [
                    'Company-wide equal allocation',
                    'Differentiated by organization',
                    'Additional allocation for critical roles',
                    'Differentiated by individual performance (evaluation-linked)',
                ],
                'is_active' => true,
            ],
            [
                'order' => 16,
                'question_text' => 'What has been the average bonus payout ratio over the past three years? (As % of base salary, excluding executives)',
                'answer_type' => 'numeric_multi_year',
                'options' => null,
                'is_active' => true,
                'metadata' => [
                    'years' => ['2023', '2024', '2025'],
                    'unit' => '%',
                ],
            ],
            [
                'order' => 17,
                'question_text' => 'Please select all benefits programs currently in operation.',
                'answer_type' => 'multiple',
                'options' => [
                    'Meal allowance',
                    'Benefit points',
                    'Employee clubs',
                    'Half-day leave',
                    'Reward leave',
                    'Seasonal leave',
                    'Remote work',
                    'Flexible work arrangement',
                    'Vacation facilities',
                    'Medical support',
                    'Group insurance',
                    'Family event leave',
                    'Holiday gifts',
                    'Other (Text)',
                ],
                'is_active' => true,
                'metadata' => [
                    'auto_populate_to' => 'benefits_current_programs',
                    'links_to_question' => 18, // Q18 filters from Q17
                ],
            ],
            [
                'order' => 18,
                'question_text' => 'Please select the two benefits programs currently in operation that you believe are the least effective.',
                'answer_type' => 'select_up_to_2',
                'options' => [], // Options will be filtered from Q17 selections
                'is_active' => true,
                'metadata' => [
                    'filters_from_question' => 17, // Filters options from Q17
                ],
            ],
            [
                'order' => 19,
                'question_text' => 'What do you think is the reason for their low effectiveness?',
                'answer_type' => 'text',
                'options' => null,
                'is_active' => true,
                'metadata' => [
                    'parent_question_order' => 18,
                    'show_when_parent_answered' => true,
                ],
            ],
        ];

        foreach ($questions as $question) {
            CompensationSnapshotQuestion::create($question);
        }

        $this->command->info('Created ' . count($questions) . ' compensation snapshot questions.');
    }
}
