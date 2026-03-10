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
    { id: 'foundation', icon: '🧱', title: 'Foundation Building', keyword: 'Revenue structure unstable', desc: 'Actively building workforce and organization, but revenue structure is not yet stable.', detail: 'Your company is in the critical early phase of building its people and org infrastructure. The immediate priority is establishing core roles, compensation frameworks, and a culture foundation before rapid scaling.', hrIssues: ['No formal job leveling yet', 'Compensation set case-by-case', 'Culture is founder-driven', 'Onboarding is informal', 'Roles overlap frequently'] },
    { id: 'acceleration', icon: '🚀', title: 'Growth Acceleration', keyword: 'Compensation & roles emerging', desc: 'Revenue or customers are rapidly increasing, and issues related to organizational contribution, compensation, and roles emerge.', detail: "You're scaling fast — but without structured HR systems, growth creates chaos. The key challenge is formalizing roles, compensation bands, and performance accountability before the org outgrows informal norms.", hrIssues: ['Role clarity breaking down', 'Pay equity becoming a risk', 'High-performer retention pressure', 'Management layer needed', 'Performance gaps widening'] },
    { id: 'expansion', icon: '🌳', title: 'Stable Expansion', keyword: 'Roles & responsibilities clarifying', desc: 'Growth momentum has slowed, but the organization is expanding and roles/responsibilities are being clarified.', detail: 'Your organization is maturing. The priority shifts from hiring speed to talent optimization — defining career paths, formalizing performance management, and retaining key contributors through structured development.', hrIssues: ['Career path expectations rising', 'Middle management effectiveness', 'Succession planning needed', 'Engagement scores plateauing', 'Cross-functional friction'] },
    { id: 'optimization', icon: '⚙️', title: 'Profit Optimization', keyword: 'Efficiency & cost management', desc: 'Performance growth is stagnant or limited, focusing on operational efficiency and cost management rather than revenue expansion.', detail: 'Growth has plateaued and the focus is on doing more with less. HR strategy pivots to workforce productivity, talent redeployment, and ensuring compensation ROI.', hrIssues: ['Productivity measurement gaps', 'Over-staffing in some functions', 'Variable pay tied to efficiency', 'Reskilling vs. backfilling decisions', 'Low-performer management'] },
    { id: 'restructuring', icon: '🔄', title: 'Business Restructuring', keyword: 'Workforce & structure adjustment', desc: 'Market size is shrinking or competitiveness is weakening, reviewing business structure adjustment or workforce adjustment.', detail: 'The business model itself is under pressure. HR\'s role becomes critical in managing workforce transitions, preserving institutional knowledge, maintaining morale during uncertainty, and rebuilding capability.', hrIssues: ['Workforce reduction planning', 'Key talent retention at risk', 'Culture resilience under stress', 'Role consolidation required', 'Change management capability'] },
];

export const VISION_CHUNKS: VisionChunkConfig[] = [
    { icon: '🔭', label: 'Part 1 of 3', name: 'Growth Vision', nameKo: '성장 비전', desc: 'Define the timeline and scale of your company\'s growth ambition.', callout: { title: 'Your growth horizon shapes the entire HR roadmap.', body: 'These answers directly inform how we design your org structure and performance targets.' } },
    { icon: '🏆', label: 'Part 2 of 3', name: 'Competitive Identity', nameKo: '경쟁 정체성', desc: 'Clarify where you want to win and what you want to stand for.', callout: { title: 'Your competitive stance defines talent profiles and culture.', body: 'These answers shape the type of people and capabilities your organization needs to attract.' } },
    { icon: '📐', label: 'Part 3 of 3', name: 'Core Values & Metrics', nameKo: '핵심 가치 & 지표', desc: 'Translate your vision into measurable outcomes and irreplaceable value.', callout: { title: 'These answers anchor your HR strategy to what truly matters.', body: 'KPIs and core values defined here will be embedded into your performance and culture framework.' } },
];

export const VISION_CHUNK_SIZE = 3;
export const KEYWORD_PRESETS = ['Innovation', 'Trust', 'Speed', 'Expertise', 'Care', 'Integrity', 'Impact'];

/** Scenario metadata for Leadership step (by question order). */
export const LEADERSHIP_SCENARIOS: { scenario: string; icon: string; leftLabel: string; rightLabel: string }[] = [
    { scenario: 'Manager Resignation Wave', icon: '👤', leftLabel: 'System & Role First', rightLabel: 'Performance First' },
    { scenario: 'Repeated Team Errors', icon: '⚙️', leftLabel: 'System & Management', rightLabel: 'Individual Accountability' },
    { scenario: 'Endless Team Discussions', icon: '🗣️', leftLabel: 'Leader Decides', rightLabel: 'Consensus Priority' },
    { scenario: 'Role Confusion in the Field', icon: '🔀', leftLabel: 'Clarify Standards', rightLabel: 'Direct Intervention' },
    { scenario: 'High Performer, Low Compliance', icon: '⭐', leftLabel: 'Standards First', rightLabel: 'Performance Tolerance' },
];

/** Spectrum metadata for General Questions step (by question order). */
export const GENERAL_QUESTIONS_META: { icon: string; title: string; leftLabel: string; rightLabel: string }[] = [
    { icon: '👔', title: 'Manager Role Perception', leftLabel: 'Practical Expert', rightLabel: 'Organization / Member Coordinator' },
    { icon: '⚡', title: 'Source of Performance', leftLabel: 'Key Talents', rightLabel: 'Systems within the Organization' },
    { icon: '⚖️', title: 'Standards and Discretion', leftLabel: "Manager's Judgment and Discretion", rightLabel: 'Clear Standards and Processes' },
    { icon: '💼', title: 'Job Value', leftLabel: 'Differential Internal Job Values', rightLabel: 'All Jobs Equally Important' },
    { icon: '🏃', title: 'Decision-Making', leftLabel: 'Fast Speed, Individual Responsibility', rightLabel: 'Consensus First, Organizational Responsibility' },
    { icon: '📢', title: 'Sharing Management Information with Members', leftLabel: 'Necessary Scope, Selective Sharing', rightLabel: 'As Transparent Sharing as Possible' },
];

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
