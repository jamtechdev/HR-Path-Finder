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
                'content' => '컨설팅급 HR 설계 플랫폼',
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
                'content' => '정밀한 HR 시스템을 설계하세요',
                'locale' => 'ko',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'section_key' => 'hero_description',
                'section_type' => 'textarea',
                'content' => '중소기업의 HR 프레임워크 구축 방식을 혁신합니다. 단계별 가이드 접근 방식으로 전문 컨설팅 업무를 현대적인 SaaS 플랫폼 안에서 재현합니다.',
                'locale' => 'ko',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'section_key' => 'hero_cta_primary',
                'section_type' => 'text',
                'content' => '무료 체험 시작하기',
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
                'content' => '100개 이상의 기업이 HR Copilot을 신뢰합니다',
                'locale' => 'ko',
                'order' => 6,
                'is_active' => true,
            ],

            // Everything You Need Section
            [
                'section_key' => 'everything_title',
                'section_type' => 'text',
                'content' => '완전한 HR 시스템 구축에 필요한 모든 것',
                'locale' => 'ko',
                'order' => 10,
                'is_active' => true,
            ],
            [
                'section_key' => 'everything_description',
                'section_type' => 'textarea',
                'content' => '우리 플랫폼은 컨설팅급 로직과 규칙 기반 권장사항으로 각 단계를 안내합니다.',
                'locale' => 'ko',
                'order' => 11,
                'is_active' => true,
            ],
            [
                'section_key' => 'everything_cards',
                'section_type' => 'json',
                'content' => json_encode([
                    [
                        'title' => '조직 설계',
                        'description' => '기능별, 팀 기반, 사업부별 또는 매트릭스 조직으로 회사를 구조화합니다.',
                    ],
                    [
                        'title' => '성과 관리 시스템',
                        'description' => 'KPI, MBO, OKR 또는 BSC 기반 성과 평가 프레임워크를 설계합니다.',
                    ],
                    [
                        'title' => '보상 체계',
                        'description' => '성과, 인센티브 및 역할 기반 차별화를 통해 경쟁력 있는 급여 구조를 구축합니다.',
                    ],
                    [
                        'title' => 'CEO 철학',
                        'description' => '구조화된 경영 철학 설문을 통해 리더십 스타일과 HR 시스템을 정렬합니다.',
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
                'content' => 'HR Path-Finder를 선택해야 하는 이유는?',
                'locale' => 'ko',
                'order' => 20,
                'is_active' => true,
            ],
            [
                'section_key' => 'why_description',
                'section_type' => 'textarea',
                'content' => '전문 HR 컨설팅의 구조화된 접근 방식을 재현하여 전담 HR 기획팀이 없는 회사도 접근할 수 있도록 합니다.',
                'locale' => 'ko',
                'order' => 21,
                'is_active' => true,
            ],
            [
                'section_key' => 'why_items',
                'section_type' => 'json',
                'content' => json_encode([
                    '순차적이고 컨설팅급 워크플로우',
                    '규칙 기반 권장사항 (AI 추측 없음)',
                    'CEO와 HR 매니저 협업',
                    '모든 결정에 대한 완전한 감사 추적',
                    '전문 HR 시스템 대시보드',
                    '내보내기 준비된 보고서 및 정책',
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
                        'description' => 'CEO, HR 매니저, 컨설턴트는 각각 특정 권한과 뷰를 가집니다.',
                    ],
                    [
                        'title' => '시각적 대시보드',
                        'description' => '전문적인 시각화로 전체 HR 시스템을 한눈에 볼 수 있습니다.',
                    ],
                    [
                        'title' => '논리적 검증',
                        'description' => '시스템이 호환되지 않는 선택을 차단하여 일관된 HR 설계를 보장합니다.',
                    ],
                    [
                        'title' => '협업 워크플로우',
                        'description' => 'CEO와 HR 매니저가 명확한 인수인계와 승인으로 함께 작업합니다.',
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
                'content' => 'HR Copilot',
                'locale' => 'ko',
                'order' => 50,
                'is_active' => true,
            ],
            [
                'section_key' => 'header_company_text',
                'section_type' => 'text',
                'content' => 'by BetterCompany',
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
