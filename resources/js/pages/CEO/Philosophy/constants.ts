import type { StepConfig, GrowthStageConfig, VisionChunkConfig } from './types';

export const STEPS: StepConfig[] = [
    { id: 'intro', name: 'Welcome', nameKo: '시작', icon: '👋', desc: "Let's begin your management philosophy assessment." },
    { id: 'management', name: 'Management Philosophy', nameKo: '전략 & 의사결정', icon: '🎯', desc: '경영 전략 수립과 의사결정 방식에 대한 귀하의 철학을 파악합니다.', callout: { title: '전략 철학이 조직 방향성의 기반이 됩니다', body: '이 섹션의 응답은 조직 구조 및 의사결정 체계 설계에 직결됩니다.' } },
    { id: 'vision', name: 'Vision/Mission/Ideal Talent Type', nameKo: 'Vision/Mission', icon: '🌱', desc: 'Clarify the future direction of your company and the type of talent needed.' },
    { id: 'growth', name: 'Growth Stage', nameKo: '성장 단계', icon: '📈', desc: 'Identifies your company\'s current growth phase to align structure and people strategy.' },
    { id: 'leadership', name: 'Leadership', nameKo: '리더십', icon: '👥', desc: 'Examines leadership style and management practices.' },
    { id: 'general', name: 'General Questions', nameKo: '일반 문항', icon: '📋', desc: 'Gathers overall operational context.' },
    { id: 'issues', name: 'Organizational Issues', nameKo: '조직 이슈', icon: '⚠️', desc: 'Select issues you agree are relevant from your perspective as CEO.' },
    { id: 'concerns', name: "CEO's Concerns", nameKo: 'CEO 관심사', icon: '💡', desc: 'Captures key concerns and priorities as CEO.' },
];

export const GROWTH_STAGES: GrowthStageConfig[] = [
    {
        id: 'foundation',
        icon: '🧱',
        title: 'Foundation Building',
        titleKo: '기반 구축',
        keyword: 'Revenue structure unstable',
        keywordKo: '매출 구조 불안정',
        desc: 'Actively building workforce and organization, but revenue structure is not yet stable.',
        descKo: '인력과 조직을 구축 중이지만 아직 매출 구조가 안정화되지 않은 단계입니다.',
        detail: 'Your company is in the critical early phase of building its people and org infrastructure. The immediate priority is establishing core roles, compensation frameworks, and a culture foundation before rapid scaling.',
        detailKo: '인력/조직 인프라를 구축하는 초기 핵심 단계입니다. 급격한 확장 전에 핵심 역할, 보상 체계, 조직 문화 기반을 먼저 정립해야 합니다.',
        hrIssues: ['No formal job leveling yet', 'Compensation set case-by-case', 'Culture is founder-driven', 'Onboarding is informal', 'Roles overlap frequently'],
        hrIssuesKo: ['직무 레벨 체계 미정', '케이스별 보상 운영', '창업자 중심 문화', '온보딩 체계 부족', '역할 중복 빈번'],
    },
    {
        id: 'acceleration',
        icon: '🚀',
        title: 'Growth Acceleration',
        titleKo: '성장 가속',
        keyword: 'Compensation & roles emerging',
        keywordKo: '보상·역할 이슈 대두',
        desc: 'Revenue or customers are rapidly increasing, and issues related to organizational contribution, compensation, and roles emerge.',
        descKo: '매출 또는 고객이 빠르게 증가하며 조직 기여도, 보상, 역할 관련 이슈가 나타나는 단계입니다.',
        detail: "You're scaling fast — but without structured HR systems, growth creates chaos. The key challenge is formalizing roles, compensation bands, and performance accountability before the org outgrows informal norms.",
        detailKo: '빠르게 성장하는 시기이지만 HR 시스템이 구조화되지 않으면 혼선이 커집니다. 비공식 운영 한계를 넘기 전에 역할, 보상 밴드, 성과 책임 기준을 정립해야 합니다.',
        hrIssues: ['Role clarity breaking down', 'Pay equity becoming a risk', 'High-performer retention pressure', 'Management layer needed', 'Performance gaps widening'],
        hrIssuesKo: ['역할 명확성 저하', '보상 공정성 리스크', '핵심인재 유지 압박', '관리자층 필요', '성과 격차 확대'],
    },
    {
        id: 'expansion',
        icon: '🌳',
        title: 'Stable Expansion',
        titleKo: '안정 확장',
        keyword: 'Roles & responsibilities clarifying',
        keywordKo: '역할·책임 명확화',
        desc: 'Growth momentum has slowed, but the organization is expanding and roles/responsibilities are being clarified.',
        descKo: '성장 속도는 완화되었지만 조직은 확장 중이며 역할/책임을 정교화하는 단계입니다.',
        detail: 'Your organization is maturing. The priority shifts from hiring speed to talent optimization — defining career paths, formalizing performance management, and retaining key contributors through structured development.',
        detailKo: '조직이 성숙기로 진입한 단계입니다. 채용 속도보다 인재 최적화가 중요하며 경력경로, 성과관리, 핵심인재 유지 체계를 고도화해야 합니다.',
        hrIssues: ['Career path expectations rising', 'Middle management effectiveness', 'Succession planning needed', 'Engagement scores plateauing', 'Cross-functional friction'],
        hrIssuesKo: ['커리어 경로 기대 증가', '중간관리자 역량 과제', '승계 계획 필요', '몰입도 정체', '부서 간 마찰'],
    },
    {
        id: 'optimization',
        icon: '⚙️',
        title: 'Profit Optimization',
        titleKo: '수익 최적화',
        keyword: 'Efficiency & cost management',
        keywordKo: '효율·원가 관리',
        desc: 'Performance growth is stagnant or limited, focusing on operational efficiency and cost management rather than revenue expansion.',
        descKo: '성과 성장이 정체/제한되어 매출 확장보다 운영 효율과 원가 관리가 중요한 단계입니다.',
        detail: 'Growth has plateaued and the focus is on doing more with less. HR strategy pivots to workforce productivity, talent redeployment, and ensuring compensation ROI.',
        detailKo: '성장이 정체되어 적은 자원으로 더 높은 성과를 내야 하는 구간입니다. 인력 생산성, 인재 재배치, 보상 ROI 중심으로 HR 전략을 재정렬해야 합니다.',
        hrIssues: ['Productivity measurement gaps', 'Over-staffing in some functions', 'Variable pay tied to efficiency', 'Reskilling vs. backfilling decisions', 'Low-performer management'],
        hrIssuesKo: ['생산성 측정 공백', '기능별 인력 비효율', '성과연동 보상 설계', '재교육 vs 충원 의사결정', '저성과 관리'],
    },
    {
        id: 'restructuring',
        icon: '🔄',
        title: 'Business Restructuring',
        titleKo: '구조 재편',
        keyword: 'Workforce & structure adjustment',
        keywordKo: '인력·조직 재조정',
        desc: 'Market size is shrinking or competitiveness is weakening, reviewing business structure adjustment or workforce adjustment.',
        descKo: '시장 축소나 경쟁력 약화로 사업 구조 또는 인력 구조 재조정을 검토하는 단계입니다.',
        detail: 'The business model itself is under pressure. HR\'s role becomes critical in managing workforce transitions, preserving institutional knowledge, maintaining morale during uncertainty, and rebuilding capability.',
        detailKo: '사업모델 자체가 압박받는 시기입니다. 인력 전환 관리, 핵심 지식 유지, 불확실성 속 조직 사기 관리, 역량 재구축이 핵심 과제입니다.',
        hrIssues: ['Workforce reduction planning', 'Key talent retention at risk', 'Culture resilience under stress', 'Role consolidation required', 'Change management capability'],
        hrIssuesKo: ['인력 조정 계획', '핵심인재 이탈 리스크', '문화 회복 탄력성', '역할 통합 필요', '변화관리 역량'],
    },
];

export const VISION_CHUNKS: VisionChunkConfig[] = [
    { icon: '🔭', label: 'Part 1 of 3', name: 'Growth Vision', nameKo: '성장 비전', desc: 'Define the timeline and scale of your company\'s growth ambition.', callout: { title: 'Your growth horizon shapes the entire HR roadmap.', body: 'These answers directly inform how we design your org structure and performance targets.' } },
    { icon: '🏆', label: 'Part 2 of 3', name: 'Competitive Identity', nameKo: '경쟁 정체성', desc: 'Clarify where you want to win and what you want to stand for.', callout: { title: 'Your competitive stance defines talent profiles and culture.', body: 'These answers shape the type of people and capabilities your organization needs to attract.' } },
    { icon: '📐', label: 'Part 3 of 3', name: 'Core Values & Metrics', nameKo: '핵심 가치 & 지표', desc: 'Translate your vision into measurable outcomes and irreplaceable value.', callout: { title: 'These answers anchor your HR strategy to what truly matters.', body: 'KPIs and core values defined here will be embedded into your performance and culture framework.' } },
];

export const VISION_CHUNK_SIZE = 3;
export const KEYWORD_PRESETS = ['Innovation', 'Trust', 'Speed', 'Expertise', 'Care', 'Integrity', 'Impact'];

/** Category display names and icons for Organizational Issues step. */
export const ISSUE_CATEGORY_META: Record<string, { name: string; icon: string }> = {
    culture_leadership: { name: 'Culture / Leadership', icon: '🎭' },
    evaluation_compensation: { name: 'Evaluation / Compensation', icon: '📊' },
    organization: { name: 'Organization', icon: '🏛️' },
    organizations: { name: 'Organization', icon: '🏛️' },
    others: { name: 'Others', icon: '🔧' },
    recruitment_retention: { name: 'Recruitment / Retention', icon: '🔍' },
    upskilling: { name: 'Upskilling', icon: '📚' },
};
export const MAX_ORGANIZATIONAL_ISSUES = 5;
