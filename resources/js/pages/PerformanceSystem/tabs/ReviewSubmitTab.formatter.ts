const CYCLE_MAP: Record<string, string> = {
    annual: 'Annual',
    semi_annual: 'Semi-Annual',
    quarterly: 'Quarterly',
};
const METHOD_MAP: Record<string, string> = {
    absolute: 'Absolute Evaluation',
    relative: 'Relative Evaluation',
};
const ORG_EVALUATOR_MAP: Record<string, string> = {
    top_down: 'Top-down evaluation',
    ceo: 'CEO / Top Management',
    dept: 'Department Heads',
};
const IND_EVALUATOR_MAP: Record<string, string> = {
    self_evaluation: 'Self-evaluation',
    primary: 'Primary evaluator',
    secondary: 'Secondary evaluator',
    tertiary: 'Tertiary evaluator',
    peer_same_dept: 'Peer (same department)',
    peer_adjacent_dept: 'Peer (adjacent department)',
};
const ORG_USAGE_MAP: Record<string, string> = {
    linked_to_org_manager: 'Linked to organization manager evaluation',
    linked_to_individual: 'Linked to individual evaluation distribution',
    dist_adjust: 'Adjust Individual Grade Distribution by Org',
    bonus: 'Bonus Pool Multiplier',
    reference: 'Reference Only',
    dept_head_link: "Link to Dept Head's Individual Rating",
};
const IND_USAGE_MAP: Record<string, string> = {
    salary_adjustment: 'Salary adjustment',
    bonus_allocation: 'Bonus allocation',
    promotion: 'Promotion',
    position_assignment: 'Position assignment',
    training_selection: 'Training selection',
    differentiated_benefits: 'Differentiated benefits',
    other: 'Other',
};
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DIST_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

function normalizeEvalStructure(s: any): Record<string, any> {
    if (!s) return {};
    if (s.organizational_evaluation || s.individual_evaluation) {
        const org = s.organizational_evaluation || {};
        const ind = s.individual_evaluation || {};
        return {
            org_evaluation_cycle: org.evaluation_cycle,
            org_evaluation_timing: org.evaluation_timing,
            org_evaluator_type: org.evaluator_type,
            org_evaluation_method: org.evaluation_method,
            org_rating_scale: org.rating_scale,
            org_rating_distribution: org.rating_distribution,
            org_evaluation_group: org.evaluation_group,
            org_use_of_results: org.use_of_results,
            individual_evaluation_cycle: ind.evaluation_cycle,
            individual_evaluation_timing: ind.evaluation_timing,
            individual_evaluator_types: ind.evaluator_types,
            individual_evaluators: ind.evaluators,
            individual_evaluation_method: ind.evaluation_method,
            individual_rating_scale: ind.rating_scale,
            individual_rating_distribution: ind.rating_distribution,
            individual_evaluation_groups: ind.evaluation_groups,
            individual_use_of_results: ind.use_of_results,
            organization_leader_evaluation: ind.organization_leader_evaluation,
        };
    }
    return s;
}

export interface FormatEvalSummaryResult {
    orgConducted: boolean;
    orgCycle: string | null;
    orgTiming: string | null;
    orgEvaluator: string | null;
    orgMethod: string | null;
    orgUsage: string[];
    indCycle: string | null;
    indTiming: string | null;
    indEvaluators: string[];
    indMethod: string | null;
    indUsage: string[];
    distribution: { labels: string[]; pcts: number[]; colors: string[] } | null;
}

export function formatEvalSummary(evaluationStructure: any): FormatEvalSummaryResult {
    const s = normalizeEvalStructure(evaluationStructure);
    const orgConducted = !!(s.org_evaluation_cycle || s.org_evaluation_method || s.org_evaluator_type);
    const orgCycle = s.org_evaluation_cycle ? (CYCLE_MAP[s.org_evaluation_cycle] ?? s.org_evaluation_cycle) : null;
    const orgTiming = s.org_evaluation_timing
        ? s.org_evaluation_timing
              .split(',')
              .map((m: string) => MONTH_NAMES[parseInt(m.trim(), 10) - 1] ?? m)
              .join(', ')
        : null;
    const orgEvaluator = s.org_evaluator_type ? (ORG_EVALUATOR_MAP[s.org_evaluator_type] ?? s.org_evaluator_type) : null;
    const orgMethod = s.org_evaluation_method ? (METHOD_MAP[s.org_evaluation_method] ?? s.org_evaluation_method) : null;
    const orgUsageRaw = s.org_use_of_results;
    const orgUsage: string[] = Array.isArray(orgUsageRaw)
        ? orgUsageRaw.map((k: string) => ORG_USAGE_MAP[k] ?? k)
        : orgUsageRaw
          ? [ORG_USAGE_MAP[orgUsageRaw] ?? orgUsageRaw]
          : [];

    const indCycle = s.individual_evaluation_cycle ? (CYCLE_MAP[s.individual_evaluation_cycle] ?? s.individual_evaluation_cycle) : null;
    const indTiming = s.individual_evaluation_timing
        ? s.individual_evaluation_timing
              .split(',')
              .map((m: string) => MONTH_NAMES[parseInt(m.trim(), 10) - 1] ?? m)
              .join(', ')
        : null;
    const indEvalRaw = s.individual_evaluators;
    const indEvaluators: string[] = Array.isArray(indEvalRaw) ? indEvalRaw.map((k: string) => IND_EVALUATOR_MAP[k] ?? k) : [];
    const indMethod = s.individual_evaluation_method ? (METHOD_MAP[s.individual_evaluation_method] ?? s.individual_evaluation_method) : null;
    const indUsageRaw = s.individual_use_of_results;
    const indUsage: string[] = Array.isArray(indUsageRaw) ? indUsageRaw.map((k: string) => IND_USAGE_MAP[k] ?? k) : [];

    let distribution: FormatEvalSummaryResult['distribution'] = null;
    const scale = s.individual_rating_scale;
    const pcts = s.individual_rating_distribution;
    if (s.individual_evaluation_method === 'relative' && scale && Array.isArray(pcts) && pcts.length > 0) {
        const labels = scale === '5-level' ? ['S', 'A', 'B', 'C', 'D'] : scale === '4-level' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C'];
        const colors = DIST_COLORS.slice(0, labels.length);
        distribution = { labels, pcts: pcts.slice(0, labels.length), colors };
    }

    return {
        orgConducted,
        orgCycle,
        orgTiming,
        orgEvaluator,
        orgMethod,
        orgUsage,
        indCycle,
        indTiming,
        indEvaluators,
        indMethod,
        indUsage,
        distribution,
    };
}
