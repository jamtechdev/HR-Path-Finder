<?php

namespace Database\Seeders;

use App\Models\JobDefinitionTemplate;
use App\Models\JobKeyword;
use Illuminate\Database\Seeder;

class JobDefinitionTemplateSeeder extends Seeder
{
    /**
     * Baseline job definition templates (Korean), aligned with MVP job-description standard.
     * Lookups use stable {@see JobKeyword::$slug} so display names can stay Korean.
     */
    public function run(): void
    {
        $bySlug = JobKeyword::whereNotNull('slug')->pluck('id', 'slug');

        $templates = [];

        $push = function (string $slug, array $body) use (&$templates, $bySlug): void {
            $id = $bySlug[$slug] ?? null;
            if (!$id) {
                $this->command->warn("Job keyword slug missing: {$slug}");
                return;
            }
            $templates[] = array_merge([
                'job_keyword_id' => $id,
                'industry_category' => null,
                'company_size_range' => null,
                'is_active' => true,
            ], $body);
        };

        $push('accounting', [
            'job_description' => '회계 전반(재무기록, 매입·매출 채권, 급여, 결산 보고)을 관리·감독합니다. 회계기준 및 관련 법규를 준수하고, 월·분기·연간 재무제표를 작성합니다.',
            'job_specification' => [
                'education' => [
                    'required' => '회계·재무 또는 관련 분야 학사 학위',
                    'preferred' => 'CPA 등 공인회계 자격',
                ],
                'experience' => [
                    'required' => '회계 실무 3년 이상',
                    'preferred' => '회계 실무 5년 이상, ERP 경험',
                ],
                'skills' => [
                    'required' => '회계 프로그램, Excel, 재무 분석',
                    'preferred' => 'IFRS, 세법, 감사 경험',
                ],
                'communication' => [
                    'required' => '명확한 문서·구두 커뮤니케이션',
                    'preferred' => '비재무 담당자에게 재무 내용 설명 능력',
                ],
            ],
            'competency_levels' => [
                ['level' => 'LV1', 'description' => '초급: 기본 장부·전표 입력, 월마감 지원'],
                ['level' => 'LV2', 'description' => '중급: 결산 사이클 수행, 재무제표·조정분개'],
                ['level' => 'LV3', 'description' => '고급: 회계 운영 총괄, 분석·내부통제·준수 관리'],
            ],
            'csfs' => [
                ['name' => '재무기록 정확성', 'description' => '오류 허용 수준을 최소화한 정확한 장부 유지', 'strategic_importance' => 'high', 'category' => 'operational'],
                ['name' => '보고 적시성', 'description' => '일정에 맞는 재무 보고', 'strategic_importance' => 'high', 'category' => 'process'],
                ['name' => '규정 준수', 'description' => '법·기준 준수', 'strategic_importance' => 'high', 'category' => 'strategic'],
                ['name' => '재무 분석', 'description' => '의사결정을 지원하는 인사이트 제공', 'strategic_importance' => 'medium', 'category' => 'strategic'],
            ],
        ]);

        $push('finance', [
            'job_description' => '재무계획·예산·자금조달·재무 분석을 수행하고 경영진 의사결정을 지원합니다. 재무 건전성과 자본 효율을 관리합니다.',
            'job_specification' => [
                'education' => [
                    'required' => '경영·재무·회계 관련 학사',
                    'preferred' => 'MBA 또는 재무 관련 석사',
                ],
                'experience' => [
                    'required' => '재무·FP&A 또는 유사 분야 3년 이상',
                    'preferred' => '대기업·금융권 재무 분석 경험',
                ],
                'skills' => [
                    'required' => '재무 모델링, Excel, 예산·실적 관리',
                    'preferred' => 'IR, 세무·재무 전략 협업',
                ],
                'communication' => [
                    'required' => '경영진·부서 간 협업 커뮤니케이션',
                    'preferred' => '지표 기반 스토리텔링, 발표',
                ],
            ],
            'competency_levels' => [
                ['level' => 'LV1', 'description' => '초급: 실적 집계·리포트 지원, 기본 분석'],
                ['level' => 'LV2', 'description' => '중급: 예산·예측 운영, 과제 단위 재무 분석'],
                ['level' => 'LV3', 'description' => '고급: 자금·전략 재무 설계, 투자·구조 결정 지원'],
            ],
            'csfs' => [
                ['name' => '예산·예측 정확도', 'description' => '신뢰할 수 있는 재무 전망', 'strategic_importance' => 'high', 'category' => 'strategic'],
                ['name' => '자금 안정성', 'description' => '유동성·리스크 관리', 'strategic_importance' => 'high', 'category' => 'operational'],
                ['name' => '경영 지원', 'description' => '데이터 기반 의사결정 지원', 'strategic_importance' => 'medium', 'category' => 'process'],
            ],
        ]);

        $push('hr', [
            'job_description' => '채용, 노사·직원 관계, 성과·보상, HR 정책 등 인사 기능을 수행합니다. 조직 문화와 직원 경험을 지원합니다.',
            'job_specification' => [
                'education' => [
                    'required' => '인사·경영 또는 관련 분야 학사',
                    'preferred' => '인사 석사 또는 SHRM/PHR 등 자격',
                ],
                'experience' => [
                    'required' => 'HR 실무 3년 이상',
                    'preferred' => 'HRIS, 노무, 조직개발 경험',
                ],
                'skills' => [
                    'required' => '채용, 평가, 노동법 기초',
                    'preferred' => 'HR 분석, 변화관리, 갈등 조정',
                ],
                'communication' => [
                    'required' => '대인 관계·커뮤니케이션 역량',
                    'preferred' => '민감 이슈 대응, 협상·발표',
                ],
            ],
            'competency_levels' => [
                ['level' => 'LV1', 'description' => '코디네이터: 행정·채용 지원, 인사 기록 관리'],
                ['level' => 'LV2', 'description' => '스페셜리스트: 모듈별(채용·보상 등) 운영'],
                ['level' => 'LV3', 'description' => '매니저: HR 전략·제도 설계, 팀 리드'],
            ],
            'csfs' => [
                ['name' => '채용 성과', 'description' => '적시 적격 채용', 'strategic_importance' => 'high', 'category' => 'process'],
                ['name' => '노사 관계', 'description' => '건전한 직원 관계 유지', 'strategic_importance' => 'high', 'category' => 'operational'],
                ['name' => 'HR 컴플라이언스', 'description' => '노동 관련 법규 준수', 'strategic_importance' => 'high', 'category' => 'strategic'],
                ['name' => '조직 개발', 'description' => '성장과 역량 강화 지원', 'strategic_importance' => 'medium', 'category' => 'strategic'],
            ],
        ]);

        $push('it', [
            'job_description' => 'IT 인프라·시스템·보안을 관리하고 사용자 지원과 프로젝트를 수행합니다. 가용성과 보안을 확보합니다.',
            'job_specification' => [
                'education' => [
                    'required' => '컴퓨터공학·정보기술 관련 학사',
                    'preferred' => '석사 또는 CISSP/PMP 등 자격',
                ],
                'experience' => [
                    'required' => 'IT 실무 3년 이상',
                    'preferred' => '클라우드·보안·프로젝트 관리',
                ],
                'skills' => [
                    'required' => '시스템·네트워크 운영, 장애 대응',
                    'preferred' => '클라우드, DB, 보안 설계',
                ],
                'communication' => [
                    'required' => '비전문가에게 기술 설명',
                    'preferred' => '벤더·프로젝트 이해관계자 관리',
                ],
            ],
            'competency_levels' => [
                ['level' => 'LV1', 'description' => '지원: 헬프데스크, 기본 장애 처리'],
                ['level' => 'LV2', 'description' => '전문가: 시스템 단위 운영·구축'],
                ['level' => 'LV3', 'description' => '매니저: IT 전략·운영 총괄'],
            ],
            'csfs' => [
                ['name' => '가동률', 'description' => '서비스 가용성 확보', 'strategic_importance' => 'high', 'category' => 'operational'],
                ['name' => '보안', 'description' => '정보 보호·위협 대응', 'strategic_importance' => 'high', 'category' => 'strategic'],
                ['name' => '사용자 지원', 'description' => '신속한 기술 지원', 'strategic_importance' => 'medium', 'category' => 'process'],
                ['name' => '혁신', 'description' => '업무 효율을 높이는 기술 도입', 'strategic_importance' => 'medium', 'category' => 'strategic'],
            ],
        ]);

        $push('business_planning', [
            'job_description' => '사업·전략 계획을 수립하고 시장·재무 분석과 실적 모니터링을 수행합니다. 경영진 의사결정을 지원합니다.',
            'job_specification' => [
                'education' => [
                    'required' => '경영·경제·통계 등 학사',
                    'preferred' => 'MBA 또는 경영 석사',
                ],
                'experience' => [
                    'required' => '기획·전략·컨설팅 3년 이상',
                    'preferred' => '전략 수립·재무 모델링 경험',
                ],
                'skills' => [
                    'required' => '전략 사고, 데이터·재무 분석, 발표',
                    'preferred' => '시장 조사, 과제 관리, 시나리오 플래닝',
                ],
                'communication' => [
                    'required' => '보고·프레젠테이션 역량',
                    'preferred' => '임원 보고·이해관계자 조율',
                ],
            ],
            'competency_levels' => [
                ['level' => 'LV1', 'description' => '애널리스트: 분석·리포트 지원'],
                ['level' => 'LV2', 'description' => '플래너: 사업계획·전략 분석 주도'],
                ['level' => 'LV3', 'description' => '시니어: 중장기 전략·과제 리드'],
            ],
            'csfs' => [
                ['name' => '전략 수립', 'description' => '실행 가능한 계획', 'strategic_importance' => 'high', 'category' => 'strategic'],
                ['name' => '데이터 분석', 'description' => '정확한 인사이트', 'strategic_importance' => 'high', 'category' => 'process'],
                ['name' => '실행 지원', 'description' => '계획 이행 지원', 'strategic_importance' => 'medium', 'category' => 'process'],
                ['name' => '의사결정 지원', 'description' => '경영진 판단 근거 제공', 'strategic_importance' => 'high', 'category' => 'strategic'],
            ],
        ]);

        $push('process_engineering', [
            'job_description' => '정해진 프로세스 업무를 지도하에 수행. 문서화 기준과 부문 간 업무 흐름을 학습. 엔드투엔드 프로세스 설계를 주도하고 비효율을 진단·개선하며, 전사 혁신 프로그램을 리드하고 경영진과 직접 소통해 변화를 추진합니다.',
            'job_specification' => [
                'education' => [
                    'required' => '공학, 경영학 또는 관련 분야 학사 이상',
                    'preferred' => '운영관리 중심의 석사 또는 MBA',
                ],
                'experience' => [
                    'required' => '프로세스 개선 또는 운영 프로젝트 수행 경험',
                    'preferred' => '기업 내 부문 간 프로그램 관리 경험',
                ],
                'skills' => [
                    'required' => '프로세스 매핑, 데이터 분석, 이해관계자 커뮤니케이션',
                    'preferred' => '린 / 식스시그마, ERP 시스템, 변화관리',
                ],
                'communication' => [
                    'required' => '부문 간 협업 환경에서의 명확한 구두·문서 커뮤니케이션',
                    'preferred' => '',
                ],
            ],
            'competency_levels' => [
                ['level' => 'LV1', 'description' => '주니어 엔지니어: 정해진 프로세스 업무를 지도하에 수행. 문서화 기준과 부문 간 업무 흐름을 학습.'],
                ['level' => 'LV2', 'description' => '프로세스 엔지니어: 엔드투엔드 프로세스 설계를 주도. 비효율을 자체 진단하고 개선 과제를 독립적으로 제안.'],
                ['level' => 'LV3', 'description' => '시니어 프로세스 엔지니어: 전사 혁신 프로그램을 리드. 후배 육성 및 경영진과 직접 소통하며 변화를 주도.'],
            ],
            'csfs' => [
                ['name' => '비즈니스 정렬', 'description' => '프로세스 의사결정을 비즈니스 성과와 연결. 비용, 속도, 리스크의 언어로 소통.', 'strategic_importance' => 'high', 'category' => 'strategic'],
                ['name' => '구조적 문제해결', 'description' => '체계적 프레임워크로 근본 원인을 진단하고 개선 레버를 우선순위화.', 'strategic_importance' => 'high', 'category' => 'process'],
                ['name' => '실행 규율', 'description' => '과제를 완수까지 추진. 일정, 의존관계, 이해관계자 동의를 일관성 있게 관리.', 'strategic_importance' => 'high', 'category' => 'operational'],
                ['name' => '변화 주도력', 'description' => '조직 저항을 관리하며 변화를 이끄는 영향력. 경영진 설득과 현장 실행을 연결.', 'strategic_importance' => 'medium', 'category' => 'strategic'],
                ['name' => '데이터 기반 판단', 'description' => '정성적 관찰과 정량 데이터를 결합해 근거 있는 개선 방향을 도출.', 'strategic_importance' => 'medium', 'category' => 'process'],
                ['name' => '협업 조율 능력', 'description' => '복수 부문의 이해관계를 조율하며 공동 목표를 향해 팀을 정렬시키는 역량.', 'strategic_importance' => 'medium', 'category' => 'operational'],
            ],
        ]);

        $push('cs', [
            'job_description' => '고객 문의·불만·기술 지원을 처리하고 서비스 품질 지표를 관리합니다. 고객 경험과 재구매·만족도를 높입니다.',
            'job_specification' => [
                'education' => [
                    'required' => '학사(학과 무관) 또는 동등 경력',
                    'preferred' => 'CS·서비스 관련 교육 이수',
                ],
                'experience' => [
                    'required' => '콜센터·CS·서비스 운영 2년 이상',
                    'preferred' => 'B2B 지원·에스컬레이션 처리',
                ],
                'skills' => [
                    'required' => '듣기·문제해결, CRM/티켓 도구',
                    'preferred' => '제품 지식, 다채널 응대',
                ],
                'communication' => [
                    'required' => '명확하고 정중한 소통',
                    'preferred' => '갈등 완화·기대치 관리',
                ],
            ],
            'competency_levels' => [
                ['level' => 'LV1', 'description' => '상담원: 표준 응대·티켓 처리'],
                ['level' => 'LV2', 'description' => '스페셜리스트: 난이도 높은 이슈·품질 개선'],
                ['level' => 'LV3', 'description' => '리드: 운영 지표·교육·프로세스 개선'],
            ],
            'csfs' => [
                ['name' => '응대 품질', 'description' => '정확·신속한 해결', 'strategic_importance' => 'high', 'category' => 'operational'],
                ['name' => '고객 만족', 'description' => 'NPS·CSAT 개선', 'strategic_importance' => 'high', 'category' => 'strategic'],
                ['name' => '프로세스 준수', 'description' => 'SLA·정책 준수', 'strategic_importance' => 'medium', 'category' => 'process'],
            ],
        ]);

        foreach ($templates as $template) {
            JobDefinitionTemplate::updateOrCreate(
                [
                    'job_keyword_id' => $template['job_keyword_id'],
                    'industry_category' => $template['industry_category'],
                    'company_size_range' => $template['company_size_range'],
                ],
                $template
            );
        }

        $this->command->info('Job Definition Templates seeded successfully!');
        $this->command->info('Total templates: ' . JobDefinitionTemplate::count());
    }
}
