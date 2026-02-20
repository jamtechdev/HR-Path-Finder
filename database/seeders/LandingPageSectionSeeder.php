<?php

namespace Database\Seeders;

use App\Models\LandingPageSection;
use Illuminate\Database\Seeder;

class LandingPageSectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sections = [
            // Hero Section
            [
                'section_key' => 'hero_badge_text',
                'section_type' => 'text',
                'content' => '20~300인 기업 특화 HR제도 설계 플랫폼',
                'locale' => 'ko',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'section_key' => 'hero_title_highlight',
                'section_type' => 'text',
                'content' => 'HR 시스템',
                'locale' => 'ko',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'section_key' => 'hero_title',
                'section_type' => 'text',
                'content' => 'HR컨설팅의 설계 프로세스를 온라인에서 직접 진행하세요',
                'locale' => 'ko',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'section_key' => 'hero_description',
                'section_type' => 'textarea',
                'content' => '복잡한 HR제도 설계를 단계별 가이드로 따라가며 직접 완성할 수 있습니다. 설계 과정에는 전문 HR컨설팅의 기준과 로직이 반영되어 있으며 고객사의 설계안에 대해 전문 컨설턴트가 종합 리포트를 제공합니다.',
                'locale' => 'ko',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'section_key' => 'hero_cta_primary',
                'section_type' => 'text',
                'content' => 'HR설계 시작하기',
                'locale' => 'ko',
                'order' => 4,
                'is_active' => true,
            ],
            [
                'section_key' => 'hero_cta_secondary',
                'section_type' => 'text',
                'content' => '데모 보기',
                'locale' => 'ko',
                'order' => 5,
                'is_active' => true,
            ],
            [
                'section_key' => 'hero_trust_text',
                'section_type' => 'text',
                'content' => '',
                'locale' => 'ko',
                'order' => 6,
                'is_active' => true,
            ],

            // Everything You Need Section
            [
                'section_key' => 'everything_title',
                'section_type' => 'text',
                'content' => '성과와 조직 안정을 이끄는 HR체계의 핵심 영역',
                'locale' => 'ko',
                'order' => 10,
                'is_active' => true,
            ],
            [
                'section_key' => 'everything_description',
                'section_type' => 'textarea',
                'content' => 'Pathfinder는 경영철학 진단, 직무분석, 성과체계, 보상체계의 단계별 설계로 조직 운영 기준을 명확히 정의합니다.',
                'locale' => 'ko',
                'order' => 11,
                'is_active' => true,
            ],
            [
                'section_key' => 'everything_cards',
                'section_type' => 'json',
                'content' => json_encode([
                    [
                        'title' => '조직속성 (경영철학)',
                        'description' => '우리 회사의 운영 원칙과 조직 방향을 정의합니다.',
                    ],
                    [
                        'title' => '직무분석',
                        'description' => '각 직무의 역할과 책임, 성과요인을 설정합니다.',
                    ],
                    [
                        'title' => '성과관리체계',
                        'description' => '성과평가의 기준과 운영 방식을 정의합니다.',
                    ],
                    [
                        'title' => '보상체계',
                        'description' => '조직 특성에 기반한 보상 기준을 설정합니다.',
                    ],
                ], JSON_UNESCAPED_UNICODE),
                'locale' => 'ko',
                'order' => 12,
                'is_active' => true,
            ],

            // Why HR Path-Finder Section
            [
                'section_key' => 'why_title',
                'section_type' => 'text',
                'content' => 'HR Pathfinder가 제공하는 핵심 가치는?',
                'locale' => 'ko',
                'order' => 20,
                'is_active' => true,
            ],
            [
                'section_key' => 'why_description',
                'section_type' => 'textarea',
                'content' => '전문 HR컨설팅의 설계방식을 기반으로 HR전담 조직이 없는 회사도 체계적인 정책 설계를 진행할 수 있습니다.',
                'locale' => 'ko',
                'order' => 21,
                'is_active' => true,
            ],
            [
                'section_key' => 'why_items',
                'section_type' => 'json',
                'content' => json_encode([
                    '업종과 조직규모, 경영철학을 고려한 맞춤형 설계',
                    '전문 컨설턴트의 맞춤형 검토, 리포트 제공',
                    '컨설턴트 기준에 따른 규칙 기반 설계 (AI추측 없음)',
                    '타겟 경쟁사와의 보상 수준 비교',
                    '설계된 전체 구조를 한 눈에 볼 수 있는 대시보드',
                    '운영지원 및 정기 조직진단 (옵션)',
                ], JSON_UNESCAPED_UNICODE),
                'locale' => 'ko',
                'order' => 22,
                'is_active' => true,
            ],

            // Feature Cards Section
            [
                'section_key' => 'feature_cards',
                'section_type' => 'json',
                'content' => json_encode([
                    [
                        'title' => '역할 기반 접근',
                        'description' => 'CEO와 HR담당자가 각자의 역할에 맞게 설계를 진행할 수 있습니다.',
                    ],
                    [
                        'title' => 'HR구조를 한눈에 확인',
                        'description' => '초안 설계 직후 직무,평가체계,보상구조를 하나의 화면에서 확인할 수 있습니다.',
                    ],
                    [
                        'title' => '논리적 검증',
                        'description' => '설계 과정의 충돌과 불일치를 방지하고 마지막 단계에서 전문 컨설턴트가 전체 구조를 검토, 제안을 드립니다.',
                    ],
                    [
                        'title' => 'CEO와 HR 협업 기반 설계',
                        'description' => '명확한 승인 구조를 기반으로 공동설계를 진행, 경영진과 인사부서의 생각을 연결합니다.',
                    ],
                ], JSON_UNESCAPED_UNICODE),
                'locale' => 'ko',
                'order' => 30,
                'is_active' => true,
            ],
            
            // Header Navigation
            [
                'section_key' => 'header_logo_text',
                'section_type' => 'text',
                'content' => 'HR Pathfinder',
                'locale' => 'ko',
                'order' => 50,
                'is_active' => true,
            ],
            [
                'section_key' => 'header_company_text',
                'section_type' => 'text',
                'content' => 'powered by bettercompany',
                'locale' => 'ko',
                'order' => 51,
                'is_active' => true,
            ],
            [
                'section_key' => 'header_sign_in',
                'section_type' => 'text',
                'content' => '로그인',
                'locale' => 'ko',
                'order' => 52,
                'is_active' => true,
            ],
            [
                'section_key' => 'header_get_started',
                'section_type' => 'text',
                'content' => '시작하기',
                'locale' => 'ko',
                'order' => 53,
                'is_active' => true,
            ],
            
            // Footer
            [
                'section_key' => 'footer_copyright',
                'section_type' => 'text',
                'content' => '© 2025 BetterCompany. All rights reserved.',
                'locale' => 'ko',
                'order' => 60,
                'is_active' => true,
            ],

            // HR System Overview Section
            [
                'section_key' => 'overview_title',
                'section_type' => 'text',
                'content' => 'HR 시스템 개요',
                'locale' => 'ko',
                'order' => 35,
                'is_active' => true,
            ],
            [
                'section_key' => 'overview_progress',
                'section_type' => 'text',
                'content' => '4/4 완료',
                'locale' => 'ko',
                'order' => 36,
                'is_active' => true,
            ],
            [
                'section_key' => 'overview_steps',
                'section_type' => 'json',
                'content' => json_encode([
                    ['id' => 1, 'name' => '진단', 'completed' => true],
                    ['id' => 2, 'name' => '조직 설계', 'completed' => true],
                    ['id' => 3, 'name' => '성과 관리', 'completed' => true],
                    ['id' => 4, 'name' => '보상 체계', 'completed' => true],
                ], JSON_UNESCAPED_UNICODE),
                'locale' => 'ko',
                'order' => 37,
                'is_active' => true,
            ],
            [
                'section_key' => 'alignment_label',
                'section_type' => 'text',
                'content' => 'CEO 정렬도',
                'locale' => 'ko',
                'order' => 38,
                'is_active' => true,
            ],
            [
                'section_key' => 'alignment_score',
                'section_type' => 'text',
                'content' => '높음',
                'locale' => 'ko',
                'order' => 39,
                'is_active' => true,
            ],
            [
                'section_key' => 'alignment_description',
                'section_type' => 'textarea',
                'content' => 'HR 시스템 설계가 CEO의 경영 철학과 잘 일치합니다',
                'locale' => 'ko',
                'order' => 40,
                'is_active' => true,
            ],

            // CTA Section
            [
                'section_key' => 'cta_title',
                'section_type' => 'text',
                'content' => 'HR 시스템을 설계할 준비가 되셨나요?',
                'locale' => 'ko',
                'order' => 50,
                'is_active' => true,
            ],
            [
                'section_key' => 'cta_description',
                'section_type' => 'textarea',
                'content' => '오늘 무료 체험을 시작하고 프로토타입부터 전체 구현까지 확장 가능한 컨설팅급 HR 설계를 경험해보세요.',
                'locale' => 'ko',
                'order' => 51,
                'is_active' => true,
            ],
            [
                'section_key' => 'cta_button',
                'section_type' => 'text',
                'content' => '무료로 시작하기',
                'locale' => 'ko',
                'order' => 52,
                'is_active' => true,
            ],

            // Page Title
            [
                'section_key' => 'page_title',
                'section_type' => 'text',
                'content' => 'HR Copilot - 전문가급 HR 시스템 설계 플랫폼',
                'locale' => 'ko',
                'order' => 0,
                'is_active' => true,
            ],

            // ========== ENGLISH SECTIONS ==========
            // Hero Section (English)
            [
                'section_key' => 'hero_badge_text',
                'section_type' => 'text',
                'content' => 'Consulting-Grade HR Design Platform',
                'locale' => 'en',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'section_key' => 'hero_title_highlight',
                'section_type' => 'text',
                'content' => 'HR System',
                'locale' => 'en',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'section_key' => 'hero_title',
                'section_type' => 'text',
                'content' => 'Design Your Precise HR System',
                'locale' => 'en',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'section_key' => 'hero_description',
                'section_type' => 'textarea',
                'content' => 'We revolutionize how SMEs build HR frameworks. Our step-by-step guided approach recreates professional consulting work within a modern SaaS platform.',
                'locale' => 'en',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'section_key' => 'hero_cta_primary',
                'section_type' => 'text',
                'content' => 'Start Free Trial',
                'locale' => 'en',
                'order' => 4,
                'is_active' => true,
            ],
            [
                'section_key' => 'hero_cta_secondary',
                'section_type' => 'text',
                'content' => 'View Demo',
                'locale' => 'en',
                'order' => 5,
                'is_active' => true,
            ],
            [
                'section_key' => 'hero_trust_text',
                'section_type' => 'text',
                'content' => 'Trusted by 100+ companies',
                'locale' => 'en',
                'order' => 6,
                'is_active' => true,
            ],

            // Everything You Need Section (English)
            [
                'section_key' => 'everything_title',
                'section_type' => 'text',
                'content' => 'Everything You Need to Build a Complete HR System',
                'locale' => 'en',
                'order' => 10,
                'is_active' => true,
            ],
            [
                'section_key' => 'everything_description',
                'section_type' => 'textarea',
                'content' => 'Our platform guides you through each step with consulting-grade logic and rule-based recommendations.',
                'locale' => 'en',
                'order' => 11,
                'is_active' => true,
            ],
            [
                'section_key' => 'everything_cards',
                'section_type' => 'json',
                'content' => json_encode([
                    [
                        'title' => 'Organization Design',
                        'description' => 'Structure your company with functional, team-based, divisional, or matrix organizations.',
                    ],
                    [
                        'title' => 'Performance Management System',
                        'description' => 'Design KPI, MBO, OKR, or BSC-based performance evaluation frameworks.',
                    ],
                    [
                        'title' => 'Compensation System',
                        'description' => 'Build competitive pay structures through merit, incentives, and role-based differentiation.',
                    ],
                    [
                        'title' => 'CEO Philosophy',
                        'description' => 'Align HR systems with leadership style through structured management philosophy surveys.',
                    ],
                ]),
                'locale' => 'en',
                'order' => 12,
                'is_active' => true,
            ],

            // Why HR Path-Finder Section (English)
            [
                'section_key' => 'why_title',
                'section_type' => 'text',
                'content' => 'Why Choose HR Path-Finder?',
                'locale' => 'en',
                'order' => 20,
                'is_active' => true,
            ],
            [
                'section_key' => 'why_description',
                'section_type' => 'textarea',
                'content' => 'We replicate the structured approach of professional HR consulting, making it accessible to companies without dedicated HR planning teams.',
                'locale' => 'en',
                'order' => 21,
                'is_active' => true,
            ],
            [
                'section_key' => 'why_items',
                'section_type' => 'json',
                'content' => json_encode([
                    'Sequential, consulting-grade workflow',
                    'Rule-based recommendations (no AI guesswork)',
                    'CEO and HR Manager collaboration',
                    'Complete audit trail for all decisions',
                    'Professional HR system dashboard',
                    'Export-ready reports and policies',
                ]),
                'locale' => 'en',
                'order' => 22,
                'is_active' => true,
            ],

            // Feature Cards Section (English)
            [
                'section_key' => 'feature_cards',
                'section_type' => 'json',
                'content' => json_encode([
                    [
                        'title' => 'Role-Based Access',
                        'description' => 'CEO, HR Manager, and Consultant each have specific permissions and views.',
                    ],
                    [
                        'title' => 'Visual Dashboard',
                        'description' => 'View your entire HR system at a glance with professional visualizations.',
                    ],
                    [
                        'title' => 'Logical Validation',
                        'description' => 'The system blocks incompatible choices to ensure consistent HR design.',
                    ],
                    [
                        'title' => 'Collaborative Workflow',
                        'description' => 'CEO and HR Manager work together with clear handoffs and approvals.',
                    ],
                ]),
                'locale' => 'en',
                'order' => 30,
                'is_active' => true,
            ],
            
            // Header Navigation (English)
            [
                'section_key' => 'header_logo_text',
                'section_type' => 'text',
                'content' => 'HR Copilot',
                'locale' => 'en',
                'order' => 50,
                'is_active' => true,
            ],
            [
                'section_key' => 'header_company_text',
                'section_type' => 'text',
                'content' => 'by BetterCompany',
                'locale' => 'en',
                'order' => 51,
                'is_active' => true,
            ],
            [
                'section_key' => 'header_sign_in',
                'section_type' => 'text',
                'content' => 'Sign In',
                'locale' => 'en',
                'order' => 52,
                'is_active' => true,
            ],
            [
                'section_key' => 'header_get_started',
                'section_type' => 'text',
                'content' => 'Get Started',
                'locale' => 'en',
                'order' => 53,
                'is_active' => true,
            ],
            
            // Footer (English)
            [
                'section_key' => 'footer_copyright',
                'section_type' => 'text',
                'content' => '© 2025 BetterCompany. All rights reserved.',
                'locale' => 'en',
                'order' => 60,
                'is_active' => true,
            ],

            // HR System Overview Section (English)
            [
                'section_key' => 'overview_title',
                'section_type' => 'text',
                'content' => 'HR System Overview',
                'locale' => 'en',
                'order' => 35,
                'is_active' => true,
            ],
            [
                'section_key' => 'overview_progress',
                'section_type' => 'text',
                'content' => '4/4 Complete',
                'locale' => 'en',
                'order' => 36,
                'is_active' => true,
            ],
            [
                'section_key' => 'overview_steps',
                'section_type' => 'json',
                'content' => json_encode([
                    ['id' => 1, 'name' => 'Diagnosis', 'completed' => true],
                    ['id' => 2, 'name' => 'Organization Design', 'completed' => true],
                    ['id' => 3, 'name' => 'Performance Management', 'completed' => true],
                    ['id' => 4, 'name' => 'Compensation System', 'completed' => true],
                ]),
                'locale' => 'en',
                'order' => 37,
                'is_active' => true,
            ],
            [
                'section_key' => 'alignment_label',
                'section_type' => 'text',
                'content' => 'CEO Alignment',
                'locale' => 'en',
                'order' => 38,
                'is_active' => true,
            ],
            [
                'section_key' => 'alignment_score',
                'section_type' => 'text',
                'content' => 'High',
                'locale' => 'en',
                'order' => 39,
                'is_active' => true,
            ],
            [
                'section_key' => 'alignment_description',
                'section_type' => 'textarea',
                'content' => 'HR system design aligns well with CEO management philosophy',
                'locale' => 'en',
                'order' => 40,
                'is_active' => true,
            ],

            // CTA Section (English)
            [
                'section_key' => 'cta_title',
                'section_type' => 'text',
                'content' => 'Ready to Design Your HR System?',
                'locale' => 'en',
                'order' => 50,
                'is_active' => true,
            ],
            [
                'section_key' => 'cta_description',
                'section_type' => 'textarea',
                'content' => 'Start your free trial today and experience scalable consulting-grade HR design from prototype to full implementation.',
                'locale' => 'en',
                'order' => 51,
                'is_active' => true,
            ],
            [
                'section_key' => 'cta_button',
                'section_type' => 'text',
                'content' => 'Get Started Free',
                'locale' => 'en',
                'order' => 52,
                'is_active' => true,
            ],

            // Page Title (English)
            [
                'section_key' => 'page_title',
                'section_type' => 'text',
                'content' => 'HR Copilot - Professional-Grade HR System Design Platform',
                'locale' => 'en',
                'order' => 0,
                'is_active' => true,
            ],
        ];

        foreach ($sections as $section) {
            LandingPageSection::updateOrCreate(
                [
                    'section_key' => $section['section_key'],
                    'locale' => $section['locale'],
                ],
                $section
            );
        }

        $this->command->info('Landing page sections seeded successfully!');
    }
}
