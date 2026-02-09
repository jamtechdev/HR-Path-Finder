<?php

namespace Database\Seeders;

use App\Models\DiagnosisQuestion;
use Illuminate\Database\Seeder;

class DiagnosisQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Management Philosophy Questions (24 questions - Likert scale 1-7)
        $managementPhilosophyQuestions = [
            ['order' => 1, 'question_text' => 'Even if wage gaps widen, differential compensation based on performance is more important than internal equity.'],
            ['order' => 2, 'question_text' => 'Achieving final results is more important than the completeness of the work process.'],
            ['order' => 3, 'question_text' => 'Even if administrative burdens increase, performance reviews must be conducted regularly and thoroughly.'],
            ['order' => 4, 'question_text' => 'Long-term loyalty to the organization is prioritized over an individual\'s outstanding capabilities.'],
            ['order' => 5, 'question_text' => 'Stable operations should take precedence over aggressive growth.'],
            ['order' => 6, 'question_text' => 'Even in difficult times, protecting employees should take precedence over short-term profits.'],
            ['order' => 7, 'question_text' => 'Systematic internal and external training should precede immediate deployment to practical tasks upon hiring, as it is more effective.'],
            ['order' => 8, 'question_text' => 'Hiring trained external talent is more effective than developing internal personnel.'],
            ['order' => 9, 'question_text' => 'Even if short-term performance declines slightly, active investment in employee training and organizational learning is necessary.'],
            ['order' => 10, 'question_text' => 'Members who present new ideas and opinions should be preferred, even if results do not appear immediately.'],
            ['order' => 11, 'question_text' => 'New attempts should be encouraged, even if a certain level of failure costs occur.'],
            ['order' => 12, 'question_text' => 'New approaches and attempts are often more important than proven methods.'],
            ['order' => 13, 'question_text' => 'Overall, how much employee evaluation and compensation criteria contribute to customer satisfaction is the core of our organization.'],
            ['order' => 14, 'question_text' => 'To understand customer and market trends, it is necessary to actively utilize external reports, even if they are expensive.'],
            ['order' => 15, 'question_text' => 'The role of a dedicated organization to confirm customer satisfaction and respond is decisive for our company\'s business performance.'],
            ['order' => 16, 'question_text' => 'Budget management for cost control is necessary, even if administrative burdens increase.'],
            ['order' => 17, 'question_text' => 'The effectiveness of each cost must be measured, even if it requires using external services.'],
            ['order' => 18, 'question_text' => 'New hires are not necessary. Experienced hires can be made when needed.'],
            ['order' => 19, 'question_text' => 'Teamwork across the organization is more important than an individual\'s outstanding abilities.'],
            ['order' => 20, 'question_text' => 'Maintaining a harmonious internal environment is more important than winning external competition.'],
            ['order' => 21, 'question_text' => 'Sufficient consensus among members is more important than the speed of decision-making.'],
            ['order' => 22, 'question_text' => 'Adhering to rules and principles is more important than achieving short-term business goals.'],
            ['order' => 23, 'question_text' => 'Long-term corporate reputation in the industry is more important than short-term profits.'],
            ['order' => 24, 'question_text' => 'Ethical management is more important for long-term success than expanding market share.'],
        ];

        foreach ($managementPhilosophyQuestions as $question) {
            DiagnosisQuestion::create([
                'category' => 'management_philosophy',
                'question_text' => $question['question_text'],
                'question_type' => 'likert',
                'order' => $question['order'],
                'is_active' => true,
                'metadata' => [
                    'scale' => '1-7',
                    'labels' => ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree'],
                ],
            ]);
        }

        // Vision/Mission/Ideal Talent Type Questions (11 questions)
        $visionMissionQuestions = [
            [
                'order' => 1,
                'question_text' => 'From a business perspective, which time point—3 years, 5 years, or 10 years from now—do you set as the benchmark for company growth?',
                'question_type' => 'select',
                'options' => ['After 3 years', 'After 5 years', 'After 10 years'],
            ],
            [
                'order' => 2,
                'question_text' => 'At that time point, what is the ideal revenue scale for our company?',
                'question_type' => 'number',
                'metadata' => ['unit' => 'Billions of KRW'],
            ],
            [
                'order' => 3,
                'question_text' => 'Is there a specific area where you want us to become No.1 compared to competitors?',
                'question_type' => 'text',
            ],
            [
                'order' => 4,
                'question_text' => 'When leading the entire organization, do you place more emphasis on realistic goals or ideal goals?',
                'question_type' => 'select',
                'options' => ['Realistic', 'Ideal'],
            ],
            [
                'order' => 5,
                'question_text' => 'What is the one keyword you want customers to associate with us first when they think of us?',
                'question_type' => 'text',
            ],
            [
                'order' => 6,
                'question_text' => 'What is the most important value our company wants to contribute to society or the industry?',
                'question_type' => 'text',
            ],
            [
                'order' => 7,
                'question_text' => 'If there are 3 numerical indicators (revenue, market share, MAU, etc.) to judge whether the vision is achieved, what are they?',
                'question_type' => 'text',
            ],
            [
                'order' => 8,
                'question_text' => 'If our company disappeared, what is the biggest value that would be lost in the customer or market?',
                'question_type' => 'text',
            ],
            [
                'order' => 9,
                'question_text' => 'If you were to express the most important core value in our main business with one word?',
                'question_type' => 'text',
            ],
            [
                'order' => 10,
                'question_text' => 'What is the mindset of a member that best fits our organizational culture?',
                'question_type' => 'text',
            ],
            [
                'order' => 11,
                'question_text' => 'If there is a characteristic of a member who is difficult to stay with long-term no matter how good their performance is, what is it?',
                'question_type' => 'text',
            ],
        ];

        foreach ($visionMissionQuestions as $question) {
            DiagnosisQuestion::create([
                'category' => 'vision_mission',
                'question_text' => $question['question_text'],
                'question_type' => $question['question_type'],
                'order' => $question['order'],
                'is_active' => true,
                'options' => $question['options'] ?? null,
                'metadata' => $question['metadata'] ?? null,
            ]);
        }

        // Growth Stage Question (1 question)
        DiagnosisQuestion::create([
            'category' => 'growth_stage',
            'question_text' => 'What is the growth stage closest to our company\'s current situation? (Choose the most similar stage even if it doesn\'t match perfectly)',
            'question_type' => 'select',
            'order' => 1,
            'is_active' => true,
            'options' => [
                'Foundation Building Phase - Actively building workforce and organization, but revenue structure is not yet stable.',
                'Growth Acceleration Phase - Revenue or customers are rapidly increasing, and issues related to organizational contribution, compensation, and roles emerge.',
                'Stable Expansion Phase - Growth momentum has slowed, but the organization is expanding and roles/responsibilities are being clarified.',
                'Profit Optimization Phase - Performance growth is stagnant or limited, focusing on operational efficiency and cost management rather than revenue expansion.',
                'Business Restructuring Phase - Market size is shrinking or competitiveness is weakening, reviewing business structure adjustment or workforce adjustment.',
            ],
        ]);

        // Leadership Questions (5 scenario-based slider questions)
        $leadershipQuestions = [
            [
                'order' => 1,
                'question_text' => 'Subordinates of a specific manager are resigning one after another this year.',
                'metadata' => [
                    'option_a' => 'Prioritize reviewing the manager\'s leadership style and organizational management responsibility, and re-evaluate their suitability for the managerial role regardless of short-term performance.',
                    'option_b' => 'If the organization\'s quantitative performance is clearly maintained, view it as the manager\'s personal style and continue operations by recruiting replacements.',
                ],
            ],
            [
                'order' => 2,
                'question_text' => 'Operational errors by practitioners in a specific team are continuously occurring.',
                'metadata' => [
                    'option_a' => 'Before addressing the practitioners\' issues, check for deficiencies in work standards, training, and management systems, and consider the manager\'s management responsibility as well.',
                    'option_b' => 'Judge it as a competency/attitude issue of the practitioners, and it is desirable to stabilize quickly through replacement or additional hiring.',
                ],
            ],
            [
                'order' => 3,
                'question_text' => 'Decision-making is delayed as team discussions on important matters drag on.',
                'metadata' => [
                    'option_a' => 'Sufficient discussion and consensus processes are necessary, but if delays repeat, the leader must clearly make the final decision.',
                    'option_b' => 'Consensus and agreement among members are more important than decision speed, and a certain level of delay can be tolerated.',
                ],
            ],
            [
                'order' => 4,
                'question_text' => 'Field confusion is recurring, negatively impacting performance.',
                'metadata' => [
                    'option_a' => 'The manager\'s direct intervention is an inevitable temporary measure, but fundamentally, clarifying roles, responsibilities, and work standards is the leader\'s role.',
                    'option_b' => 'The manager directly monitoring and intervening is an important role of leadership responsible for organizational performance.',
                ],
            ],
            [
                'order' => 5,
                'question_text' => 'There is a leader with outstanding performance but who frequently deviates from organizational norms and often expresses dissatisfaction.',
                'metadata' => [
                    'option_a' => 'Organizational standards and stability take precedence over performance, and clear adjustment is needed if it negatively impacts the organization long-term.',
                    'option_b' => 'If they significantly contribute to organizational performance, a certain level of deviation from standards can be realistically tolerated.',
                ],
            ],
        ];

        foreach ($leadershipQuestions as $question) {
            DiagnosisQuestion::create([
                'category' => 'leadership',
                'question_text' => $question['question_text'],
                'question_type' => 'slider',
                'order' => $question['order'],
                'is_active' => true,
                'metadata' => array_merge($question['metadata'], [
                    'min' => 1,
                    'max' => 7,
                ]),
            ]);
        }

        // General Management Questions (6 value orientation sliders - removed Policy Application per spec)
        $generalQuestions = [
            [
                'order' => 1,
                'question_text' => 'Manager Role Perception',
                'metadata' => [
                    'option_a' => 'Practical Expert',
                    'option_b' => 'Organization/Member Coordinator',
                ],
            ],
            [
                'order' => 2,
                'question_text' => 'Source of Performance',
                'metadata' => [
                    'option_a' => 'Key Talents',
                    'option_b' => 'Systems within the Organization',
                ],
            ],
            [
                'order' => 3,
                'question_text' => 'Standards and Discretion',
                'metadata' => [
                    'option_a' => 'Manager\'s Judgment and Discretion',
                    'option_b' => 'Clear Standards and Processes',
                ],
            ],
            [
                'order' => 4,
                'question_text' => 'Job Value',
                'metadata' => [
                    'option_a' => 'There are differentials in objective internal job values.',
                    'option_b' => 'Ultimately, all jobs are equally important for business progression.',
                ],
            ],
            [
                'order' => 5,
                'question_text' => 'Decision-Making',
                'metadata' => [
                    'option_a' => 'Fast Speed, Individual Responsibility',
                    'option_b' => 'Consensus First, Organizational Responsibility',
                ],
            ],
            [
                'order' => 6,
                'question_text' => 'Sharing Management Information with Members',
                'metadata' => [
                    'option_a' => 'Necessary Scope, Selective Sharing',
                    'option_b' => 'As Transparent Sharing as Possible',
                ],
            ],
        ];

        foreach ($generalQuestions as $question) {
            DiagnosisQuestion::create([
                'category' => 'general',
                'question_text' => $question['question_text'],
                'question_type' => 'slider',
                'order' => $question['order'],
                'is_active' => true,
                'metadata' => array_merge($question['metadata'], [
                    'min' => 1,
                    'max' => 7,
                ]),
            ]);
        }

        // Organizational Issues Question
        DiagnosisQuestion::create([
            'category' => 'issues',
            'question_text' => 'These issues have been identified by your HR manager as key challenges currently facing the company. Please select the issues that you also agree are relevant from your perspective as CEO.',
            'question_type' => 'select',
            'order' => 1,
            'is_active' => true,
            'metadata' => [
                'note' => 'This will be populated with HR-identified issues dynamically',
            ],
        ]);

        // CEO Concerns Question
        DiagnosisQuestion::create([
            'category' => 'concerns',
            'question_text' => 'What is the biggest people or organizational challenge you are currently facing?',
            'question_type' => 'text',
            'order' => 1,
            'is_active' => true,
        ]);

        $this->command->info('Diagnosis questions seeded successfully!');
        $this->command->info('Total questions created: ' . DiagnosisQuestion::count());
    }
}
