import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { both, tr } from '@/config/diagnosisTranslations';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDiagnosisDraftHydrate } from '@/hooks/useDiagnosisDraftHydrate';

const CATEGORIES = [
    {
        id: 'retention',
        label: 'Retention / 채용·유지',
        labelShort: '채용·유지',
        emoji: '🧲',
        color: '#e8622a',
        issues: [
            'Does not bring in high-caliber leadership/management',
            'Did not bring in right people for key roles',
            'Did not bring in enough people in same dimension',
            'High turnover in specific roles / teams',
            'High turnover with less than 1 year of employment',
            'High turnover with less than 3 or more years of employment',
        ],
    },
    {
        id: 'org',
        label: 'Org Structure / 조직 구조',
        labelShort: '조직 구조',
        emoji: '🏗️',
        color: '#2a7de8',
        issues: [
            'Roles not clearly defined',
            'Unclear responsibilities between two or more positions',
            'Org structure does not enable business to change',
            'Excessive span of control (too many direct reports)',
            'Org structure shifts rapidly',
            'Confusion of responsibility and accountability',
            'Unclear where to go between',
            'Slow handover to executives',
            'Excessive handover to executives',
            "Org structure doesn't form at all stages",
            'Grow all directions at all ages',
            'Slow decision-making',
        ],
    },
    {
        id: 'culture',
        label: 'Culture / 조직 문화',
        labelShort: '조직 문화',
        emoji: '🌱',
        color: '#2aab6e',
        issues: [
            'Top-down culture and low freedom of leadership style',
            'Lack of clear defined key success measures and competencies',
            'Unclear how employees are recognised and why',
            "Does not manage teams' leadership capability",
            'Chaos of local conflict',
            'Low or no feedback culture',
            'Lacking role models / conflict',
        ],
    },
    {
        id: 'reward',
        label: 'Reward / 보상 체계',
        labelShort: '보상 체계',
        emoji: '💰',
        color: '#c8a84b',
        issues: [
            'Pay too evolved that it is not in a system',
            'Same pay across levels that pushes talent out',
            'Pay not linked to performance or contribution',
            'Pay gap between line and new employees',
            'Lack of reward for high performers',
            'Excessive overload that is not rewarded',
            'No clear ownership of reward decisions',
            'Benefits not visible or valued',
        ],
    },
    {
        id: 'upskilling',
        label: 'Upskilling / 역량 개발',
        labelShort: '역량 개발',
        emoji: '📈',
        color: '#7c3aed',
        issues: [
            'Few employees at all levels have learning and development set',
            'Limited budget for learning and development',
            'Lack of leadership development programs',
            'Lack of steps or programs to become a manager',
        ],
    },
    {
        id: 'other',
        label: 'Other / 기타',
        labelShort: '기타',
        emoji: '📌',
        color: '#64748b',
        issues: ['Other issue'],
    },
];

interface Diagnosis {
    id: number;
    hr_issues?: string[];
    custom_hr_issues?: string;
}

interface Props {
    project: { id: number; company: { name: string } };
    company: { name: string };
    diagnosis?: Diagnosis;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
    embedMode?: boolean;
    readOnly?: boolean;
    embedData?: Record<string, unknown>;
    embedSetData?: (key: string, value: unknown) => void;
}

function buildCheckedFromDiagnosis(diagnosis?: Diagnosis | null): Record<string, string[]> {
    const out: Record<string, string[]> = {};
    const list = diagnosis?.hr_issues ?? [];
    if (!list.length) return out;
    CATEGORIES.forEach((cat) => {
        const selected = list.filter((issue) => cat.issues.includes(issue));
        if (selected.length) out[cat.id] = selected;
    });
    return out;
}

export default function HrIssues({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
    embedMode = false,
    readOnly = false,
    embedData,
    embedSetData,
}: Props) {
    const [checked, setChecked] = useState<Record<string, string[]>>(() =>
        buildCheckedFromDiagnosis(diagnosis)
    );
    const [activeCatIdx, setActiveCatIdx] = useState(0);
    const [customIssue, setCustomIssue] = useState(diagnosis?.custom_hr_issues ?? '');

    const activeCat = CATEGORIES[activeCatIdx];

    const internalForm = useForm({
        hr_issues: [] as string[],
        custom_hr_issues: '',
    });
    const useEmbed = embedMode && embedData != null && embedSetData;
    const data = useEmbed ? { ...internalForm.data, ...embedData } as typeof internalForm.data : internalForm.data;
    const setData = useEmbed ? (k: string, v: unknown) => embedSetData(k, v) : internalForm.setData;

    // Hydrate from draft so checkbox selections persist when navigating
    useDiagnosisDraftHydrate(
        projectId,
        'hr-issues',
        (patch) => {
            const ui = (patch.__draft_hr_issues as any) ?? null;
            if (ui && typeof ui === 'object') {
                if (ui.checked && typeof ui.checked === 'object') setChecked(ui.checked);
                if (typeof ui.activeCatIdx === 'number') setActiveCatIdx(ui.activeCatIdx);
                if (typeof ui.customIssue === 'string') setCustomIssue(ui.customIssue);
            } else {
                if (Array.isArray(patch.hr_issues)) {
                    // Best-effort: rebuild checked map from flat list
                    const out: Record<string, string[]> = {};
                    CATEGORIES.forEach((cat) => {
                        const selected = (patch.hr_issues as string[]).filter((issue) => cat.issues.includes(issue));
                        if (selected.length) out[cat.id] = selected;
                    });
                    if (Object.keys(out).length) setChecked(out);
                }
                if (typeof patch.custom_hr_issues === 'string') setCustomIssue(patch.custom_hr_issues);
            }
        },
        { enabled: !embedMode && !readOnly }
    );

    useEffect(() => {
        const flat = Object.entries(checked).flatMap(([, issues]) => issues);
        setData('hr_issues', flat);
        setData('custom_hr_issues', customIssue);
    }, [checked, customIssue]);

    // Persist UI-only draft keys so active category index also survives navigation
    useEffect(() => {
        if (!projectId || embedMode || readOnly) return;
        (internalForm as any).setData('__draft_hr_issues', { checked, activeCatIdx, customIssue });
    }, [projectId, embedMode, readOnly, checked, activeCatIdx, customIssue]);

    const toggleIssue = (catId: string, issue: string) => {
        setChecked((prev) => {
            const current = prev[catId] ?? [];
            const next = current.includes(issue)
                ? current.filter((i) => i !== issue)
                : [...current, issue];
            if (next.length === 0) {
                const { [catId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [catId]: next };
        });
    };

    const isChecked = (catId: string, issue: string) => (checked[catId] ?? []).includes(issue);
    const catCheckedCount = (catId: string) => (checked[catId] ?? []).length;
    const totalChecked = Object.values(checked).flat().length;

    const goNext = () => {
        if (activeCatIdx < CATEGORIES.length - 1) setActiveCatIdx(activeCatIdx + 1);
    };
    const goPrev = () => {
        if (activeCatIdx > 0) setActiveCatIdx(activeCatIdx - 1);
    };

    const desc = both('hrIssuesDesc');
    const prevCat = both('prevCategory');
    const nextCat = both('nextCategory');
    const totalSelectedLabel = both('totalSelectedIssues');
    const itemsSuffix = both('itemsSuffix');
    const selectedSuffix = both('selectedCount');
    const directInputLabel = both('directInput');
    const customPlaceholder = both('customIssuePlaceholder');

    const innerContent = (
                <div className="space-y-5 max-w-[780px] mx-auto">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{tr('hrIssuesTitle')}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">{desc.ko}</p>
                        <p className="text-xs text-muted-foreground/80 mt-0.5">{desc.en}</p>
                    </div>

                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat, idx) => {
                            const count = catCheckedCount(cat.id);
                            const isActive = idx === activeCatIdx;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setActiveCatIdx(idx)}
                                    style={{
                                        border: isActive ? `2px solid ${cat.color}` : '1.5px solid #e2e8f0',
                                        background: isActive ? `${cat.color}15` : '#fff',
                                        color: isActive ? cat.color : '#64748b',
                                    }}
                                    className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-[13px] font-medium transition-all dark:bg-slate-800 dark:border-slate-700"
                                >
                                    <span>{cat.emoji}</span>
                                    <span>{cat.labelShort}</span>
                                    {count > 0 && (
                                        <span
                                            style={{ background: cat.color, color: '#fff' }}
                                            className="rounded-full py-0.5 px-1.5 text-[11px] font-bold"
                                        >
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Main card */}
                    <div
                        className="rounded-2xl overflow-hidden border-2 bg-white dark:bg-slate-900"
                        style={{
                            borderColor: `${activeCat.color}30`,
                            boxShadow: `0 4px 20px ${activeCat.color}18`,
                        }}
                    >
                        {/* Card header */}
                        <div
                            className="px-6 py-5 flex items-center justify-between border-b dark:border-slate-700"
                            style={{
                                background: `linear-gradient(135deg, ${activeCat.color}12, ${activeCat.color}06)`,
                                borderColor: `${activeCat.color}20`,
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                    style={{ background: `${activeCat.color}20` }}
                                >
                                    {activeCat.emoji}
                                </div>
                                <div>
                                    <div className="text-base font-bold text-slate-800 dark:text-slate-100">{activeCat.label}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {both('totalItems').ko} {activeCat.issues.length}{itemsSuffix.ko}{' '}
                                        {catCheckedCount(activeCat.id) > 0 && (
                                            <span style={{ color: activeCat.color, fontWeight: 700 }}>
                                                · {catCheckedCount(activeCat.id)}{selectedSuffix.ko}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-[13px] text-slate-500 dark:text-slate-400">
                                {activeCatIdx + 1} / {CATEGORIES.length}
                            </div>
                        </div>

                        {/* Issues list */}
                        <div className="p-6">
                            {activeCat.issues.map((issue) => {
                                const selected = isChecked(activeCat.id, issue);
                                return (
                                    <button
                                        key={issue}
                                        type="button"
                                        onClick={() => toggleIssue(activeCat.id, issue)}
                                        className={cn(
                                            'w-full flex items-center gap-3 py-3 px-3.5 rounded-lg mb-1.5 cursor-pointer transition-all text-left',
                                            selected ? 'border-[1.5px]' : 'border-[1.5px] border-transparent bg-slate-50 dark:bg-slate-800 hover:bg-muted/50'
                                        )}
                                        style={{
                                            background: selected ? `${activeCat.color}10` : undefined,
                                            borderColor: selected ? `${activeCat.color}50` : undefined,
                                        }}
                                    >
                                        <div
                                            className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all"
                                            style={{
                                                border: selected ? 'none' : '1.5px solid #cbd5e1',
                                                background: selected ? activeCat.color : '#fff',
                                            }}
                                        >
                                            {selected && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                                        </div>
                                        <span
                                            className={cn(
                                                'text-sm',
                                                selected ? 'font-semibold text-slate-800 dark:text-slate-100' : 'font-normal text-slate-600 dark:text-slate-300'
                                            )}
                                        >
                                            {issue}
                                        </span>
                                    </button>
                                );
                            })}

                            {activeCat.id === 'other' && (
                                <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
                                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        {directInputLabel.ko}
                                    </div>
                                    <textarea
                                        value={customIssue}
                                        onChange={(e) => setCustomIssue(e.target.value)}
                                        placeholder={customPlaceholder.ko}
                                        rows={3}
                                        className="w-full border-[1.5px] border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-800 dark:text-slate-100 outline-none resize-y bg-slate-50 dark:bg-slate-800 font-[inherit] focus:border-slate-800 dark:focus:border-slate-100"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Card footer nav */}
                        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={goPrev}
                                disabled={activeCatIdx === 0}
                                className={cn(
                                    'border rounded-lg py-2 px-4 text-[13px] font-semibold transition-colors',
                                    activeCatIdx === 0
                                        ? 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-default'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900'
                                )}
                            >
                                {prevCat.ko}
                            </button>
                            <div className="flex gap-1.5">
                                {CATEGORIES.map((cat, idx) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setActiveCatIdx(idx)}
                                        className="rounded-full cursor-pointer transition-all"
                                        style={{
                                            width: idx === activeCatIdx ? 20 : 8,
                                            height: 8,
                                            borderRadius: 4,
                                            background:
                                                idx === activeCatIdx
                                                    ? activeCat.color
                                                    : catCheckedCount(cat.id) > 0
                                                    ? '#c8a84b'
                                                    : '#e2e8f0',
                                        }}
                                        aria-label={`Category ${idx + 1}`}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={goNext}
                                disabled={activeCatIdx === CATEGORIES.length - 1}
                                style={{
                                    background: activeCatIdx === CATEGORIES.length - 1 ? '#e2e8f0' : activeCat.color,
                                    color: activeCatIdx === CATEGORIES.length - 1 ? '#94a3b8' : '#fff',
                                }}
                                className={cn(
                                    'border-0 rounded-lg py-2 px-4 text-[13px] font-semibold',
                                    activeCatIdx === CATEGORIES.length - 1 ? 'cursor-default' : 'cursor-pointer'
                                )}
                            >
                                {nextCat.ko}
                            </button>
                        </div>
                    </div>

                    {/* Summary bar */}
                    {totalChecked > 0 && (
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
                            <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
                                {totalSelectedLabel.ko} {totalChecked}{both('issuesSuffix').ko}
                            </span>
                            <div className="flex gap-1.5 flex-wrap">
                                {CATEGORIES.filter((c) => catCheckedCount(c.id) > 0).map((cat) => (
                                    <span
                                        key={cat.id}
                                        style={{
                                            background: `${cat.color}15`,
                                            border: `1px solid ${cat.color}40`,
                                            color: cat.color,
                                        }}
                                        className="rounded-full py-0.5 px-2.5 text-xs font-semibold"
                                    >
                                        {cat.emoji} {cat.labelShort} {catCheckedCount(cat.id)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
    if (embedMode) return <>{innerContent}</>;
    return (
        <>
            <Head title={`Key HR/Organizational Issues - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title={tr('hrIssuesTitle')}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="job-structure"
                nextRoute="review"
                formData={data}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                {innerContent}
            </FormLayout>
        </>
    );
}
