import FormLayout from '@/components/Diagnosis/FormLayout';
import { useDiagnosisDraftHydrate } from '@/hooks/useDiagnosisDraftHydrate';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const CATEGORIES = [
    {
        id: 'retention',
        emoji: '🧲',
        color: '#e8622a',
        nameKey: 'diagnosis_hr_issues.retention.name',
        issueKeys: [
            'diagnosis_hr_issues.retention.issue1',
            'diagnosis_hr_issues.retention.issue2',
            'diagnosis_hr_issues.retention.issue3',
            'diagnosis_hr_issues.retention.issue4',
            'diagnosis_hr_issues.retention.issue5',
            'diagnosis_hr_issues.retention.issue6',
        ],
    },
    {
        id: 'org',
        emoji: '🏗️',
        color: '#2a7de8',
        nameKey: 'diagnosis_hr_issues.org.name',
        issueKeys: [
            'diagnosis_hr_issues.org.issue1',
            'diagnosis_hr_issues.org.issue2',
            'diagnosis_hr_issues.org.issue3',
            'diagnosis_hr_issues.org.issue4',
            'diagnosis_hr_issues.org.issue5',
            'diagnosis_hr_issues.org.issue6',
            'diagnosis_hr_issues.org.issue7',
            'diagnosis_hr_issues.org.issue8',
            'diagnosis_hr_issues.org.issue9',
            'diagnosis_hr_issues.org.issue10',
            'diagnosis_hr_issues.org.issue11',
            'diagnosis_hr_issues.org.issue12',
        ],
    },
    {
        id: 'culture',
        emoji: '🌱',
        color: '#2aab6e',
        nameKey: 'diagnosis_hr_issues.culture.name',
        issueKeys: [
            'diagnosis_hr_issues.culture.issue1',
            'diagnosis_hr_issues.culture.issue2',
            'diagnosis_hr_issues.culture.issue3',
            'diagnosis_hr_issues.culture.issue4',
            'diagnosis_hr_issues.culture.issue5',
            'diagnosis_hr_issues.culture.issue6',
            'diagnosis_hr_issues.culture.issue7',
        ],
    },
    {
        id: 'reward',
        emoji: '💰',
        color: '#c8a84b',
        nameKey: 'diagnosis_hr_issues.reward.name',
        issueKeys: [
            'diagnosis_hr_issues.reward.issue1',
            'diagnosis_hr_issues.reward.issue2',
            'diagnosis_hr_issues.reward.issue3',
            'diagnosis_hr_issues.reward.issue4',
            'diagnosis_hr_issues.reward.issue5',
            'diagnosis_hr_issues.reward.issue6',
            'diagnosis_hr_issues.reward.issue7',
            'diagnosis_hr_issues.reward.issue8',
        ],
    },
    {
        id: 'upskilling',
        emoji: '📈',
        color: '#7c3aed',
        nameKey: 'diagnosis_hr_issues.upskilling.name',
        issueKeys: [
            'diagnosis_hr_issues.upskilling.issue1',
            'diagnosis_hr_issues.upskilling.issue2',
            'diagnosis_hr_issues.upskilling.issue3',
            'diagnosis_hr_issues.upskilling.issue4',
        ],
    },
    {
        id: 'other',
        emoji: '📌',
        color: '#64748b',
        nameKey: 'diagnosis_hr_issues.other.name',
        issueKeys: ['diagnosis_hr_issues.other.issue1'],
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

function buildCheckedFromDiagnosis(
    diagnosis?: Diagnosis | null,
): Record<string, string[]> {
    const out: Record<string, string[]> = {};
    const list = diagnosis?.hr_issues ?? [];
    if (!list.length) return out;

    CATEGORIES.forEach((cat) => {
        const selected = list.filter((issue) => cat.issueKeys.includes(issue));
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
    const { t } = useTranslation();

    const [checked, setChecked] = useState<Record<string, string[]>>(() =>
        buildCheckedFromDiagnosis(diagnosis),
    );
    const [activeCatIdx, setActiveCatIdx] = useState(0);
    const [customIssue, setCustomIssue] = useState(
        diagnosis?.custom_hr_issues ?? '',
    );

    const activeCat = CATEGORIES[activeCatIdx];

    const internalForm = useForm({
        hr_issues: [] as string[],
        custom_hr_issues: '',
    });

    const useEmbed = embedMode && embedData != null && embedSetData;
    const data = useEmbed
        ? ({ ...internalForm.data, ...embedData } as typeof internalForm.data)
        : internalForm.data;
    const setData = useEmbed
        ? (k: string, v: unknown) => embedSetData(k, v)
        : internalForm.setData;

    // Hydrate from draft
    useDiagnosisDraftHydrate(
        projectId,
        'hr-issues',
        (patch) => {
            const ui = (patch.__draft_hr_issues as any) ?? null;
            if (ui && typeof ui === 'object') {
                if (ui.checked && typeof ui.checked === 'object')
                    setChecked(ui.checked);
                if (typeof ui.activeCatIdx === 'number')
                    setActiveCatIdx(ui.activeCatIdx);
                if (typeof ui.customIssue === 'string')
                    setCustomIssue(ui.customIssue);
            } else if (Array.isArray(patch.hr_issues)) {
                const out: Record<string, string[]> = {};
                CATEGORIES.forEach((cat) => {
                    const selected = (patch.hr_issues as string[]).filter(
                        (issue) => cat.issueKeys.includes(issue),
                    );
                    if (selected.length) out[cat.id] = selected;
                });
                if (Object.keys(out).length) setChecked(out);
                if (typeof patch.custom_hr_issues === 'string')
                    setCustomIssue(patch.custom_hr_issues);
            }
        },
        { enabled: !embedMode && !readOnly },
    );

    useEffect(() => {
        const flat = Object.entries(checked).flatMap(([, issues]) => issues);
        setData('hr_issues', flat);
        setData('custom_hr_issues', customIssue);
    }, [checked, customIssue, setData]);

    // Persist UI draft
    useEffect(() => {
        if (!projectId || embedMode || readOnly) return;
        (internalForm as any).setData('__draft_hr_issues', {
            checked,
            activeCatIdx,
            customIssue,
        });
    }, [projectId, embedMode, readOnly, checked, activeCatIdx, customIssue]);

    const toggleIssue = (catId: string, issueKey: string) => {
        setChecked((prev) => {
            const current = prev[catId] ?? [];
            const next = current.includes(issueKey)
                ? current.filter((i) => i !== issueKey)
                : [...current, issueKey];

            if (next.length === 0) {
                const { [catId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [catId]: next };
        });
    };

    const isChecked = (catId: string, issueKey: string) =>
        (checked[catId] ?? []).includes(issueKey);
    const catCheckedCount = (catId: string) => (checked[catId] ?? []).length;
    const totalChecked = Object.values(checked).flat().length;

    const goNext = () => {
        if (activeCatIdx < CATEGORIES.length - 1)
            setActiveCatIdx(activeCatIdx + 1);
    };
    const goPrev = () => {
        if (activeCatIdx > 0) setActiveCatIdx(activeCatIdx - 1);
    };

    const innerContent = (
        <div className="mx-auto max-w-[780px] space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    {t('diagnosis_hr_issues.title')}
                </h1>
                <p className="mt-1.5 text-sm text-slate-500">
                    {t('diagnosis_hr_issues.description')}
                </p>
            </div>

            {/* Category Tabs */}
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
                                border: isActive
                                    ? `2px solid ${cat.color}`
                                    : '1.5px solid #e2e8f0',
                                background: isActive
                                    ? `${cat.color}15`
                                    : '#fff',
                                color: isActive ? cat.color : '#64748b',
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all"
                        >
                            <span>{cat.emoji}</span>
                            <span>{t(cat.nameKey)}</span>
                            {count > 0 && (
                                <span
                                    style={{
                                        background: cat.color,
                                        color: '#fff',
                                    }}
                                    className="rounded-full px-1.5 py-0.5 text-[11px] font-bold"
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Main Card */}
            <div
                className="overflow-hidden rounded-2xl border-2 bg-white"
                style={{
                    borderColor: `${activeCat.color}30`,
                    boxShadow: `0 4px 20px ${activeCat.color}18`,
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between border-b px-6 py-5"
                    style={{
                        background: `linear-gradient(135deg, ${activeCat.color}12, ${activeCat.color}06)`,
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                            style={{ background: `${activeCat.color}20` }}
                        >
                            {activeCat.emoji}
                        </div>
                        <div>
                            <div className="text-base font-bold text-slate-800">
                                {t(activeCat.nameKey)}
                            </div>
                            <div className="mt-0.5 text-xs text-slate-500">
                                {t('diagnosis_hr_issues.totalItems', {
                                    count: activeCat.issueKeys.length,
                                })}
                                {catCheckedCount(activeCat.id) > 0 && (
                                    <span
                                        style={{ color: activeCat.color }}
                                        className="ml-1 font-semibold"
                                    >
                                        · {catCheckedCount(activeCat.id)}{' '}
                                        {t('diagnosis_hr_issues.selected')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-[13px] text-slate-500">
                        {activeCatIdx + 1} / {CATEGORIES.length}
                    </div>
                </div>

                {/* Issues List */}
                <div className="p-6">
                    {activeCat.issueKeys.map((issueKey) => {
                        const selected = isChecked(activeCat.id, issueKey);
                        return (
                            <button
                                key={issueKey}
                                type="button"
                                onClick={() =>
                                    toggleIssue(activeCat.id, issueKey)
                                }
                                className={cn(
                                    'mb-1.5 flex w-full cursor-pointer items-center gap-3 rounded-lg px-3.5 py-3 text-left transition-all',
                                    selected
                                        ? 'border-[1.5px]'
                                        : 'border-[1.5px] border-transparent bg-slate-50 hover:bg-slate-100',
                                )}
                                style={{
                                    background: selected
                                        ? `${activeCat.color}10`
                                        : undefined,
                                    borderColor: selected
                                        ? `${activeCat.color}50`
                                        : undefined,
                                }}
                            >
                                <div
                                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md transition-all"
                                    style={{
                                        border: selected
                                            ? 'none'
                                            : '1.5px solid #cbd5e1',
                                        background: selected
                                            ? activeCat.color
                                            : '#fff',
                                    }}
                                >
                                    {selected && (
                                        <Check
                                            className="h-3 w-3 text-white"
                                            strokeWidth={2.5}
                                        />
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        'text-sm',
                                        selected
                                            ? 'font-semibold text-slate-800'
                                            : 'text-slate-600',
                                    )}
                                >
                                    {t(issueKey)}
                                </span>
                            </button>
                        );
                    })}

                    {/* Custom Input for 'other' */}
                    {activeCat.id === 'other' && (
                        <div className="mt-4 border-t border-dashed border-slate-200 pt-4">
                            <div className="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                {t('diagnosis_hr_issues.directInput')}
                            </div>
                            <textarea
                                value={customIssue}
                                onChange={(e) => setCustomIssue(e.target.value)}
                                placeholder={t(
                                    'diagnosis_hr_issues.customPlaceholder',
                                )}
                                rows={3}
                                className="w-full resize-y rounded-lg border-[1.5px] border-slate-200 p-3 text-sm outline-none focus:border-slate-400"
                            />
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between border-t bg-slate-50 px-6 py-3.5">
                    <button
                        type="button"
                        onClick={goPrev}
                        disabled={activeCatIdx === 0}
                        className="rounded-lg border px-4 py-2 text-[13px] font-semibold hover:bg-white disabled:cursor-default disabled:text-slate-300"
                    >
                        {t('diagnosis_hr_issues.prevCategory')}
                    </button>

                    <div className="flex gap-1.5">
                        {CATEGORIES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveCatIdx(idx)}
                                className="rounded-full transition-all"
                                style={{
                                    width: idx === activeCatIdx ? 20 : 8,
                                    height: 8,
                                    background:
                                        idx === activeCatIdx
                                            ? activeCat.color
                                            : '#e2e8f0',
                                }}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={goNext}
                        disabled={activeCatIdx === CATEGORIES.length - 1}
                        style={{
                            background:
                                activeCatIdx === CATEGORIES.length - 1
                                    ? '#e2e8f0'
                                    : activeCat.color,
                            color:
                                activeCatIdx === CATEGORIES.length - 1
                                    ? '#94a3b8'
                                    : '#fff',
                        }}
                        className="rounded-lg px-4 py-2 text-[13px] font-semibold"
                    >
                        {t('diagnosis_hr_issues.nextCategory')}
                    </button>
                </div>
            </div>

            {/* Summary Bar */}
            {totalChecked > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
                    <span className="text-[13px] font-bold text-slate-800">
                        {t('diagnosis_hr_issues.totalSelected')} {totalChecked}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.filter(
                            (c) => catCheckedCount(c.id) > 0,
                        ).map((cat) => (
                            <span
                                key={cat.id}
                                style={{
                                    background: `${cat.color}15`,
                                    border: `1px solid ${cat.color}40`,
                                    color: cat.color,
                                }}
                                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            >
                                {cat.emoji} {t(cat.nameKey)}{' '}
                                {catCheckedCount(cat.id)}
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
            <Head
                title={`Key HR Issues - ${company?.name || project?.company?.name || 'Company'}`}
            />
            <FormLayout
                title={t('diagnosis_hr_issues.title')}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="job-structure"
                nextRoute="review"
                formData={data}
                saveRoute={
                    projectId ? `/hr-manager/diagnosis/${projectId}` : undefined
                }
            >
                {innerContent}
            </FormLayout>
        </>
    );
}
