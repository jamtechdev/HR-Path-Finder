import { FileText, User, CheckSquare, Settings, ChevronLeft, ArrowRight, X } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { JobDefinition, JobSelection } from '../hooks/useJobAnalysisState';

interface JobKeyword {
    id: number;
    name: string;
}

interface Template {
    job_description?: string;
    job_specification?: {
        education: { required: string; preferred: string };
        experience: { required: string; preferred: string };
        skills: { required: string; preferred: string };
        communication: { required: string; preferred: string };
    };
    competency_levels?: Array<{ level: string; description: string }>;
    csfs?: Array<{ name: string; description: string; strategic_importance?: string; category?: string }>;
}

interface Step3JobDefinitionProps {
    jobSelections: JobSelection;
    suggestedJobs: JobKeyword[];
    templates: Record<number | string, Template>;
    jobDefinitions: Record<string, JobDefinition>;
    onDefinitionsChange: (definitions: Record<string, JobDefinition>) => void;
    onContinue: () => void;
    onBack: () => void;
    fieldErrors?: FieldErrors;
}

const TAB_ORDER = ['description', 'specification', 'competency', 'csfs'] as const;
type TabId = (typeof TAB_ORDER)[number];

function countSectionsComplete(def: JobDefinition): number {
    let n = 0;
    if ((def.job_description || '').trim()) n++;
    const spec = def.job_specification;
    if (
        spec?.education?.required?.trim() &&
        spec?.experience?.required?.trim() &&
        spec?.skills?.required?.trim() &&
        spec?.communication?.required?.trim()
    )
        n++;
    const levels = def.competency_levels || [];
    if (levels.length > 0 && levels.some((l) => (l.description || '').trim())) n++;
    const csfs = def.csfs || [];
    if (csfs.length > 0 && csfs.some((c) => (c.name || '').trim())) n++;
    return n;
}

export default function Step3JobDefinition({
    jobSelections,
    suggestedJobs,
    templates,
    jobDefinitions,
    onDefinitionsChange,
    onContinue,
    onBack,
    fieldErrors = {},
}: Step3JobDefinitionProps) {
    const { t } = useTranslation();
    const [activeJobKey, setActiveJobKey] = useState<string>('');
    const [activeTab, setActiveTab] = useState<TabId>('description');
    const [localDefinitions, setLocalDefinitions] = useState<Record<string, JobDefinition>>(jobDefinitions);

    const allJobs = useMemo(() => {
        const jobs: Array<{
            key: string;
            name: string;
            job_keyword_id?: number;
            grouped_job_keyword_ids?: number[];
        }> = [];
        const added = new Set<number>();
        jobSelections.selected_job_keyword_ids.forEach((jobId) => {
            if (added.has(jobId)) return;
            const job = suggestedJobs.find((j) => j.id === jobId);
            if (job) {
                jobs.push({ key: `job-${jobId}`, name: job.name, job_keyword_id: jobId });
                added.add(jobId);
            }
        });
        jobSelections.custom_jobs.forEach((name, i) => {
            jobs.push({ key: `custom-${i}-${name}`, name });
        });
        jobSelections.grouped_jobs.forEach((group, i) => {
            const sorted = [...group.job_keyword_ids].sort((a, b) => a - b).join('-');
            jobs.push({
                key: `group-${sorted}-${i}`,
                name: group.name,
                grouped_job_keyword_ids: group.job_keyword_ids,
            });
        });
        return jobs;
    }, [jobSelections, suggestedJobs]);

    useEffect(() => {
        if (!activeJobKey && allJobs.length > 0) setActiveJobKey(allJobs[0].key);
    }, [activeJobKey, allJobs]);

    useEffect(() => {
        const next: Record<string, JobDefinition> = { ...localDefinitions };
        const validJobKeys = new Set(allJobs.map((job) => job.key));

        // Remove stale definitions that no longer belong to current HR selections.
        Object.keys(next).forEach((key) => {
            if (!validJobKeys.has(key)) {
                delete next[key];
            }
        });

        allJobs.forEach((job) => {
            if (!next[job.key]) {
                const t = templates[job.job_keyword_id ?? job.key] || {};
                next[job.key] = {
                    job_keyword_id: job.job_keyword_id,
                    job_name: job.name,
                    grouped_job_keyword_ids: job.grouped_job_keyword_ids,
                    job_description: t.job_description ?? '',
                    job_specification: t.job_specification ?? {
                        education: { required: '', preferred: '' },
                        experience: { required: '', preferred: '' },
                        skills: { required: '', preferred: '' },
                        communication: { required: '', preferred: '' },
                    },
                    competency_levels: t.competency_levels ?? [
                        { level: 'LV1', description: '' },
                        { level: 'LV2', description: '' },
                        { level: 'LV3', description: '' },
                    ],
                    csfs: (t.csfs || []).map((c) => ({
                        name: c.name || '',
                        description: c.description || '',
                        strategic_importance: (c.strategic_importance as 'high' | 'medium' | 'low') || 'medium',
                        category: (c.category as 'strategic' | 'process' | 'operational') || 'strategic',
                    })),
                };
            }
        });
        setLocalDefinitions(next);
        onDefinitionsChange(next);

        // Keep active selection in sync after HR changes selected jobs.
        if (activeJobKey && !validJobKeys.has(activeJobKey)) {
            setActiveJobKey(allJobs[0]?.key ?? '');
            setActiveTab('description');
        }
    }, [allJobs, templates]);

    const currentJob = allJobs.find((j) => j.key === activeJobKey);
    const currentDef = activeJobKey ? localDefinitions[activeJobKey] : null;

    const updateDef = (updates: Partial<JobDefinition>) => {
        if (!activeJobKey) return;
        const next = {
            ...localDefinitions,
            [activeJobKey]: { ...localDefinitions[activeJobKey], ...updates },
        };
        setLocalDefinitions(next);
        onDefinitionsChange(next);
    };

    const sectionCount = currentDef ? countSectionsComplete(currentDef) : 0;
    const isTabComplete = (tab: TabId): boolean => {
        if (!currentDef) return false;
        switch (tab) {
            case 'description':
                return !!(currentDef.job_description || '').trim();
            case 'specification': {
                const s = currentDef.job_specification;
                return !!(
                    s?.education?.required?.trim() &&
                    s?.experience?.required?.trim() &&
                    s?.skills?.required?.trim() &&
                    s?.communication?.required?.trim()
                );
            }
            case 'competency':
                return (
                    (currentDef.competency_levels?.length ?? 0) > 0 &&
                    (currentDef.competency_levels ?? []).some((l) => (l.description || '').trim())
                );
            case 'csfs':
                return (currentDef.csfs ?? []).some((c) => (c.name || '').trim());
            default:
                return false;
        }
    };

    const handleAddLevel = () => {
        if (!currentDef) return;
        const levels = currentDef.competency_levels || [];
        updateDef({
            competency_levels: [...levels, { level: `LV${levels.length + 1}`, description: '' }],
        });
    };
    const handleRemoveLevel = (index: number) => {
        if (!currentDef) return;
        const levels = (currentDef.competency_levels || []).filter((_, i) => i !== index);
        updateDef({ competency_levels: levels });
    };
    const handleUpdateLevel = (index: number, field: 'level' | 'description', value: string) => {
        if (!currentDef) return;
        const levels = [...(currentDef.competency_levels || [])];
        levels[index] = { ...levels[index], [field]: value };
        updateDef({ competency_levels: levels });
    };

    const handleAddCSF = () => {
        if (!currentDef) return;
        const csfs = currentDef.csfs || [];
        updateDef({
            csfs: [
                ...csfs,
                {
                    name: '',
                    description: '',
                    strategic_importance: 'medium',
                    category: 'strategic',
                },
            ],
        });
    };
    const handleRemoveCSF = (index: number) => {
        if (!currentDef) return;
        const csfs = (currentDef.csfs || []).filter((_, i) => i !== index);
        updateDef({ csfs });
    };
    const handleUpdateCSF = (index: number, field: string, value: unknown) => {
        if (!currentDef) return;
        const csfs = [...(currentDef.csfs || [])];
        csfs[index] = { ...csfs[index], [field]: value };
        updateDef({ csfs });
    };

    const goNextTab = () => {
        const idx = TAB_ORDER.indexOf(activeTab);
        if (idx < TAB_ORDER.length - 1) setActiveTab(TAB_ORDER[idx + 1]);
    };

    if (!currentJob || !currentDef) {
        return (
            <div className="min-h-full flex flex-col items-center justify-center bg-[#f6f3eb] p-8 dark:bg-slate-950">
                <p className="text-[#666]">{t('job_analysis_pages.step3.no_jobs')}</p>
                <Button variant="outline" onClick={onBack} className="mt-4">
                    ← {t('job_analysis_pages.step3.back_short')}
                </Button>
            </div>
        );
    }

    const spec = currentDef.job_specification!;
    const levels = currentDef.competency_levels || [];
    const csfs = currentDef.csfs || [];

    return (
        <div className="min-h-full flex flex-col bg-[#f6f3eb] text-slate-800 dark:bg-slate-950 dark:text-slate-100">
            <div className="max-w-[1100px] mx-auto w-full py-10 pb-28 px-5" style={{ padding: '0 20px' }}>
                <div className="mb-1 text-[11px] font-bold text-[#b59461] dark:text-amber-300">● {t('job_analysis_pages.step3.stage')}</div>
                <h1 className="m-0 mb-2 text-3xl font-bold text-[#1a1a3d] dark:text-slate-100">
                    {t('job_analysis_pages.step3.title')}
                </h1>
                <p className="mb-6 max-w-[800px] text-sm leading-relaxed text-[#475569] dark:text-slate-300">
                    {t('job_analysis_pages.step3.intro')}
                </p>

                {/* Job selector */}
                <div className="mb-6">
                    <div className="mb-3 text-sm font-bold text-[#0f172a] dark:text-slate-100">{t('job_analysis_pages.step3.select_job_label')}</div>
                    <FieldErrorMessage fieldKey="job-definition" errors={fieldErrors} className="mb-2" />
                    <div className="flex flex-wrap gap-2">
                        {allJobs.map((job) => {
                            const def = localDefinitions[job.key];
                            const done = def ? countSectionsComplete(def) : 0;
                            const active = activeJobKey === job.key;
                            const defErr = fieldErrors[`def-${job.key}`];
                            return (
                                <button
                                    key={job.key}
                                    type="button"
                                    onClick={() => {
                                        setActiveJobKey(job.key);
                                        setActiveTab('description');
                                    }}
                                    className={cn(
                                        'rounded-full px-5 py-2.5 text-sm font-medium',
                                        active
                                            ? 'bg-[#1a1a3d] text-white'
                                            : 'border border-[#e0ddd5] bg-[#e0ddd5]/50 text-[#666] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300',
                                        defErr && 'ring-2 ring-destructive border-destructive'
                                    )}
                                >
                                    {job.name} {done}{t('job_analysis_pages.step3.sections_suffix')}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex flex-wrap gap-1 border-b border-[#e0ddd5] pb-0 dark:border-slate-700">
                    {TAB_ORDER.map((tabId) => {
                        const isActive = activeTab === tabId;
                        const complete = isTabComplete(tabId);
                        const icons = {
                            description: FileText,
                            specification: User,
                            competency: CheckSquare,
                            csfs: Settings,
                        };
                        const Icon = icons[tabId];
                        const labels = {
                            description: t('job_analysis_pages.step3.tabs.description'),
                            specification: t('job_analysis_pages.step3.tabs.specification'),
                            competency: t('job_analysis_pages.step3.tabs.competency'),
                            csfs: t('job_analysis_pages.step3.tabs.csfs'),
                        };
                        return (
                            <button
                                key={tabId}
                                type="button"
                                onClick={() => setActiveTab(tabId)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg border border-b-0 border-[#e0ddd5] -mb-px',
                                    isActive && 'bg-[#1a1a3d] text-white border-[#1a1a3d]',
                                    !isActive && complete && 'bg-[#d4e9d5] text-[#2e7d32] dark:bg-emerald-900/30 dark:text-emerald-300',
                                    !isActive && !complete && 'bg-white text-[#666] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300'
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {labels[tabId]}
                                {complete && <span className="text-green-600 dark:text-emerald-300">✓</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <div className="rounded-lg border border-[#e0ddd5] bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    {activeTab === 'description' && (
                        <>
                            <div className="flex items-center justify-between flex-wrap flex-wrap gap-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#1a1a3d] dark:text-slate-100">{t('job_analysis_pages.step3.job_description_heading')}</span>
                                    <span className="rounded bg-[#e0ddd5] px-2 py-0.5 text-[10px] text-[#666] dark:bg-slate-700 dark:text-slate-300">
                                        {t('job_analysis_pages.step3.badge_standard')}
                                    </span>
                                </div>
                                <Button variant="outline" size="sm" className="border-[#e0ddd5] text-xs dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
                                    {t('job_analysis_pages.step3.view_original_draft')}
                                </Button>
                            </div>
                            <Textarea
                                value={currentDef.job_description || ''}
                                onChange={(e) => updateDef({ job_description: e.target.value })}
                                placeholder={t('job_analysis_pages.step3.placeholder_description')}
                                className={cn(
                                    'min-h-[200px] border-[#e0ddd5] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100',
                                    fieldErrors[`def-${activeJobKey}`] && 'border-destructive ring-1 ring-destructive/30'
                                )}
                            />
                            <FieldErrorMessage fieldKey={`def-${activeJobKey}`} errors={fieldErrors} />
                            <div className="mt-4 flex justify-end">
                                <Button
                                    onClick={goNextTab}
                                    className="bg-[#b59461] hover:bg-[#9a7d4d] text-white"
                                >
                                    {t('job_analysis_pages.common.save_continue')}
                                </Button>
                            </div>
                        </>
                    )}

                    {activeTab === 'specification' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(
                                    [
                                        { key: 'education' as const, data: spec.education },
                                        { key: 'experience' as const, data: spec.experience },
                                        { key: 'skills' as const, data: spec.skills },
                                        { key: 'communication' as const, data: spec.communication },
                                    ] as const
                                ).map(({ key, data }) => (
                                    <div
                                        key={key}
                                        className="rounded-lg border border-[#e0ddd5] bg-[#fafaf9] p-4 dark:border-slate-700 dark:bg-slate-800/60"
                                    >
                                        <div className="flex items-center justify-between flex-wrap mb-3">
                                            <span className="font-bold text-sm">
                                                {t(`job_analysis_pages.step3.spec_labels.${key}`)}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="rounded bg-[#e0ddd5] px-2 py-0.5 text-[10px] dark:bg-slate-700 dark:text-slate-300">
                                                    {t('job_analysis_pages.step3.badge_standard')}
                                                </span>
                                                <Button variant="outline" size="sm" className="h-7 text-xs dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
                                                    {t('job_analysis_pages.step3.view_original')}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs text-[#666] dark:text-slate-300">
                                                    {t('job_analysis_pages.step3.required')}{' '}
                                                    <span className="text-red-500">{t('job_analysis_pages.step3.required_mark')}</span>
                                                </Label>
                                                <Input
                                                    value={data.required}
                                                    onChange={(e) =>
                                                        updateDef({
                                                            job_specification: {
                                                                ...spec,
                                                                [key]: { ...data, required: e.target.value },
                                                            },
                                                        })
                                                    }
                                                    placeholder={t(`job_analysis_pages.step3.required_hint.${key}`)}
                                                    className="mt-1 border-[#e0ddd5] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-[#666] dark:text-slate-300">
                                                    {t('job_analysis_pages.step3.preferred')}
                                                </Label>
                                                <Input
                                                    value={data.preferred}
                                                    onChange={(e) =>
                                                        updateDef({
                                                            job_specification: {
                                                                ...spec,
                                                                [key]: { ...data, preferred: e.target.value },
                                                            },
                                                        })
                                                    }
                                                    placeholder={t(`job_analysis_pages.step3.preferred_hint.${key}`)}
                                                    className="mt-1 border-[#e0ddd5] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Button
                                    onClick={goNextTab}
                                    className="bg-[#b59461] hover:bg-[#9a7d4d] text-white"
                                >
                                    {t('job_analysis_pages.common.save_continue')}
                                </Button>
                            </div>
                        </>
                    )}

                    {activeTab === 'competency' && (
                        <>
                            <div className="flex items-center justify-between flex-wrap mb-4">
                                <span className="font-bold text-[#1a1a3d] dark:text-slate-100">
                                    {t('job_analysis_pages.step3.competency_heading')}
                                </span>
                                <Button
                                    onClick={handleAddLevel}
                                    className="bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white text-sm"
                                >
                                    {t('job_analysis_pages.step3.add_level')}
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {levels.map((level, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 rounded-lg border border-[#e0ddd5] bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <span className="bg-[#1a1a3d] text-white text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
                                            {level.level}
                                        </span>
                                        <Input
                                            value={level.description}
                                            onChange={(e) =>
                                                handleUpdateLevel(index, 'description', e.target.value)
                                            }
                                            placeholder={t('job_analysis_pages.step3.level_placeholder')}
                                            className="flex-1 border-[#e0ddd5] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveLevel(index)}
                                            className="text-red-500 hover:text-red-700 shrink-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Button
                                    onClick={goNextTab}
                                    className="bg-[#b59461] hover:bg-[#9a7d4d] text-white"
                                >
                                    {t('job_analysis_pages.common.save_continue')}
                                </Button>
                            </div>
                        </>
                    )}

                    {activeTab === 'csfs' && (
                        <>
                            <div className="flex items-center justify-between flex-wrap mb-4">
                                <span className="font-bold text-[#1a1a3d] dark:text-slate-100">
                                    {t('job_analysis_pages.step3.csfs_heading')}
                                </span>
                                <Button
                                    onClick={handleAddCSF}
                                    className="bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white text-sm"
                                >
                                    {t('job_analysis_pages.step3.add_csf')}
                                </Button>
                            </div>
                            <div className="mb-6 rounded-lg border border-[#e0ddd5] bg-[#f1f5f9] p-4 text-sm text-[#666] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                                {t('job_analysis_pages.step3.category_guide')}
                            </div>
                            <div className="space-y-6">
                                {csfs.map((csf, index) => (
                                    <div
                                        key={index}
                                        className="relative rounded-lg border border-[#e0ddd5] bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCSF(index)}
                                            className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="space-y-4 pr-8">
                                            <div>
                                                <Label className="text-xs font-semibold text-[#666] dark:text-slate-300">
                                                    {t('job_analysis_pages.step3.csf_name')}{' '}
                                                    <span className="text-red-500">{t('job_analysis_pages.step3.required_mark')}</span>
                                                </Label>
                                                <Input
                                                    value={csf.name}
                                                    onChange={(e) =>
                                                        handleUpdateCSF(index, 'name', e.target.value)
                                                    }
                                                    placeholder={t('job_analysis_pages.step3.csf_name_placeholder')}
                                                    className="mt-1 border-[#e0ddd5] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs font-semibold text-[#666] dark:text-slate-300">
                                                    {t('job_analysis_pages.step3.description')}
                                                </Label>
                                                <Textarea
                                                    value={csf.description}
                                                    onChange={(e) =>
                                                        handleUpdateCSF(index, 'description', e.target.value)
                                                    }
                                                    placeholder={t('job_analysis_pages.step3.csf_description_placeholder')}
                                                    className="mt-1 min-h-[80px] border-[#e0ddd5] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                                                />
                                            </div>
                                            <div>
                                                <Label className="mb-2 block text-xs font-semibold text-[#666] dark:text-slate-300">
                                                    {t('job_analysis_pages.step3.strategic_importance')}
                                                </Label>
                                                <div className="flex gap-2 flex-wrap">
                                                    {(['high', 'medium', 'low'] as const).map((v) => (
                                                        <button
                                                            key={v}
                                                            type="button"
                                                            onClick={() =>
                                                                handleUpdateCSF(index, 'strategic_importance', v)
                                                            }
                                                            className={cn(
                                                                'px-4 py-2 rounded-full text-sm font-medium border',
                                                                (csf.strategic_importance || 'medium') === v
                                                                    ? 'bg-red-600 text-white border-red-600'
                                                                    : 'bg-white border-[#e0ddd5] text-[#333] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'
                                                            )}
                                                        >
                                                            {t(`job_analysis_pages.step3.importance.${v}`)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="mb-2 block text-xs font-semibold text-[#666] dark:text-slate-300">
                                                    {t('job_analysis_pages.step3.csf_category')}{' '}
                                                    <span className="text-red-500">{t('job_analysis_pages.step3.required_mark')}</span>
                                                </Label>
                                                <div className="flex gap-3 flex-wrap">
                                                    {(['strategic', 'process', 'operational'] as const).map((v) => (
                                                        <label
                                                            key={v}
                                                            className={cn(
                                                                'flex items-center gap-2 cursor-pointer px-3 py-2 rounded border',
                                                                (csf.category || 'strategic') === v
                                                                    ? 'border-[#1a1a3d] bg-[#1a1a3d]/5 dark:border-slate-300 dark:bg-slate-800'
                                                                    : 'border-[#e0ddd5] dark:border-slate-600'
                                                            )}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`csf-cat-${index}`}
                                                                checked={(csf.category || 'strategic') === v}
                                                                onChange={() =>
                                                                    handleUpdateCSF(index, 'category', v)
                                                                }
                                                                className="text-[#1a1a3d] dark:text-slate-200"
                                                            />
                                                            {t(`job_analysis_pages.step3.category.${v}`)}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {csfs.length === 0 && (
                                    <p className="py-4 text-sm text-[#666] dark:text-slate-300">
                                        {t('job_analysis_pages.step3.csfs_empty')}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Sticky footer */}
            <footer
                className="sticky bottom-0 z-10 mt-auto flex w-full flex-wrap items-center justify-between gap-4 border-t border-[#e0ddd5] bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900"
            >
                <p className="text-sm text-[#666] dark:text-slate-300">
                    {t('job_analysis_pages.step3.footer_defining', { name: currentJob.name })}
                </p>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="rounded-md border-[#ccc] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        {t('job_analysis_pages.step3.back_short')}
                    </Button>
                    <Button
                        type="button"
                        onClick={onContinue}
                        className="bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white rounded-md font-bold"
                    >
                        {t('job_analysis_pages.common.save_continue')}
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}
