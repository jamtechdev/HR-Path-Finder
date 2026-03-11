import React, { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, User, CheckSquare, Settings, ChevronLeft, ArrowRight, X } from 'lucide-react';
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
}: Step3JobDefinitionProps) {
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
            <div className="min-h-full flex flex-col bg-[#f6f3eb] items-center justify-center p-8">
                <p className="text-[#666]">No jobs selected. Please go back to Job List Selection.</p>
                <Button variant="outline" onClick={onBack} className="mt-4">
                    ← Back
                </Button>
            </div>
        );
    }

    const spec = currentDef.job_specification!;
    const levels = currentDef.competency_levels || [];
    const csfs = currentDef.csfs || [];

    return (
        <div className="min-h-full flex flex-col bg-[#f6f3eb] text-[#333]">
            <div className="max-w-[1100px] mx-auto w-full py-10 pb-28 px-5" style={{ padding: '0 20px' }}>
                <div className="text-[#b59461] font-bold text-[11px] mb-1">● STEP 3 OF 6 — JOB ANALYSIS</div>
                <h1 className="text-[#1a1a3d] font-bold m-0 mb-2" style={{ fontSize: 28 }}>
                    Job Definition
                </h1>
                <p className="text-[#666] mb-6 text-sm max-w-[800px] leading-relaxed">
                    For each selected role, a Job Definition Document is created and finalized, including: Job Description, Job Specification, Job Competency Levels, and Critical Success Factors (CSFs).
                    The job standards defined at this stage serve as the foundation for the subsequent design of the performance management system and the compensation system.
                </p>

                {/* Job selector */}
                <div className="mb-6">
                    <div className="font-bold text-sm mb-3">SELECT JOB TO DEFINE</div>
                    <div className="flex flex-wrap gap-2">
                        {allJobs.map((job) => {
                            const def = localDefinitions[job.key];
                            const done = def ? countSectionsComplete(def) : 0;
                            const active = activeJobKey === job.key;
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
                                            : 'bg-[#e0ddd5]/50 text-[#666] border border-[#e0ddd5]'
                                    )}
                                >
                                    {job.name} {done}/4
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 border-b border-[#e0ddd5] pb-0">
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
                            description: 'Description',
                            specification: 'Specification',
                            competency: 'Competency',
                            csfs: 'CSFs',
                        };
                        return (
                            <button
                                key={tabId}
                                type="button"
                                onClick={() => setActiveTab(tabId)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg border border-b-0 border-[#e0ddd5] -mb-px',
                                    isActive && 'bg-[#1a1a3d] text-white border-[#1a1a3d]',
                                    !isActive && complete && 'bg-[#d4e9d5] text-[#2e7d32]',
                                    !isActive && !complete && 'bg-white text-[#666]'
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {labels[tabId]}
                                {complete && <span className="text-green-600">✓</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <div className="bg-white rounded-lg border border-[#e0ddd5] p-6 shadow-sm">
                    {activeTab === 'description' && (
                        <>
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#1a1a3d]">JOB DESCRIPTION</span>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#e0ddd5] text-[#666]">
                                        STANDARD
                                    </span>
                                </div>
                                <Button variant="outline" size="sm" className="border-[#e0ddd5] text-xs">
                                    View Original Draft
                                </Button>
                            </div>
                            <Textarea
                                value={currentDef.job_description || ''}
                                onChange={(e) => updateDef({ job_description: e.target.value })}
                                placeholder="Enter job description..."
                                className="min-h-[200px] border-[#e0ddd5]"
                            />
                            <div className="mt-4 flex justify-end">
                                <Button
                                    onClick={goNextTab}
                                    className="bg-[#b59461] hover:bg-[#9a7d4d] text-white"
                                >
                                    Next: Specification →
                                </Button>
                            </div>
                        </>
                    )}

                    {activeTab === 'specification' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    {
                                        key: 'education' as const,
                                        label: 'EDUCATION',
                                        data: spec.education,
                                    },
                                    {
                                        key: 'experience' as const,
                                        label: 'EXPERIENCE',
                                        data: spec.experience,
                                    },
                                    {
                                        key: 'skills' as const,
                                        label: 'SKILLS',
                                        data: spec.skills,
                                    },
                                    {
                                        key: 'communication' as const,
                                        label: 'COMMUNICATION',
                                        data: spec.communication,
                                    },
                                ].map(({ key, label, data }) => (
                                    <div
                                        key={key}
                                        className="border border-[#e0ddd5] rounded-lg p-4 bg-[#fafaf9]"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-sm">{label}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-[#e0ddd5]">
                                                    STANDARD
                                                </span>
                                                <Button variant="outline" size="sm" className="text-xs h-7">
                                                    View Original
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs text-[#666]">
                                                    REQUIRED <span className="text-red-500">*</span>
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
                                                    className="mt-1 border-[#e0ddd5]"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-[#666]">PREFERRED</Label>
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
                                                    className="mt-1 border-[#e0ddd5]"
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
                                    Next: Competency →
                                </Button>
                            </div>
                        </>
                    )}

                    {activeTab === 'competency' && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-bold text-[#1a1a3d]">Competency Levels</span>
                                <Button
                                    onClick={handleAddLevel}
                                    className="bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white text-sm"
                                >
                                    + Add Level
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {levels.map((level, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 border border-[#e0ddd5] rounded-lg bg-white"
                                    >
                                        <span className="bg-[#1a1a3d] text-white text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
                                            {level.level}
                                        </span>
                                        <Input
                                            value={level.description}
                                            onChange={(e) =>
                                                handleUpdateLevel(index, 'description', e.target.value)
                                            }
                                            placeholder="e.g. Junior: Handles basic tasks..."
                                            className="flex-1 border-[#e0ddd5]"
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
                                    Next: CSFs →
                                </Button>
                            </div>
                        </>
                    )}

                    {activeTab === 'csfs' && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-bold text-[#1a1a3d]">
                                    Critical Success Factors (CSFs)
                                </span>
                                <Button
                                    onClick={handleAddCSF}
                                    className="bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white text-sm"
                                >
                                    + Add CSF
                                </Button>
                            </div>
                            <div className="bg-[#f1f5f9] border border-[#e0ddd5] rounded-lg p-4 mb-6 text-sm text-[#666]">
                                <strong className="text-[#333]">Category guide:</strong> Strategic – goals &
                                direction. Process – how work gets done. Operational – day-to-day execution.
                                The category determines placement in the Finalization matrix.
                            </div>
                            <div className="space-y-6">
                                {csfs.map((csf, index) => (
                                    <div
                                        key={index}
                                        className="border border-[#e0ddd5] rounded-lg p-5 bg-white relative"
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
                                                <Label className="text-xs font-semibold text-[#666]">
                                                    CSF NAME <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    value={csf.name}
                                                    onChange={(e) =>
                                                        handleUpdateCSF(index, 'name', e.target.value)
                                                    }
                                                    className="mt-1 border-[#e0ddd5]"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs font-semibold text-[#666]">
                                                    DESCRIPTION
                                                </Label>
                                                <Textarea
                                                    value={csf.description}
                                                    onChange={(e) =>
                                                        handleUpdateCSF(index, 'description', e.target.value)
                                                    }
                                                    className="mt-1 min-h-[80px] border-[#e0ddd5]"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs font-semibold text-[#666] block mb-2">
                                                    STRATEGIC IMPORTANCE
                                                </Label>
                                                <div className="flex gap-2">
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
                                                                    : 'bg-white border-[#e0ddd5] text-[#333]'
                                                            )}
                                                        >
                                                            {v.charAt(0).toUpperCase() + v.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-semibold text-[#666] block mb-2">
                                                    CSF CATEGORY <span className="text-red-500">*</span>
                                                </Label>
                                                <div className="flex gap-3">
                                                    {(
                                                        [
                                                            ['strategic', 'Strategic'],
                                                            ['process', 'Process'],
                                                            ['operational', 'Operational'],
                                                        ] as const
                                                    ).map(([v, label]) => (
                                                        <label
                                                            key={v}
                                                            className={cn(
                                                                'flex items-center gap-2 cursor-pointer px-3 py-2 rounded border',
                                                                (csf.category || 'strategic') === v
                                                                    ? 'border-[#1a1a3d] bg-[#1a1a3d]/5'
                                                                    : 'border-[#e0ddd5]'
                                                            )}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`csf-cat-${index}`}
                                                                checked={(csf.category || 'strategic') === v}
                                                                onChange={() =>
                                                                    handleUpdateCSF(index, 'category', v)
                                                                }
                                                                className="text-[#1a1a3d]"
                                                            />
                                                            {label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {csfs.length === 0 && (
                                    <p className="text-[#666] text-sm py-4">
                                        No CSFs yet. Click &quot;+ Add CSF&quot; to add one.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Sticky footer */}
            <footer
                className="sticky bottom-0 w-full bg-white border-t border-[#e0ddd5] py-4 px-6 flex flex-wrap items-center justify-between gap-4 z-10 mt-auto"
                style={{ padding: '15px 50px' }}
            >
                <p className="text-sm text-[#666]">
                    Defining <strong>{currentJob.name}</strong>
                </p>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="border-[#ccc] rounded-md"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                    </Button>
                    <Button type="button" variant="outline" className="border-[#ccc] rounded-md">
                        Save Job
                    </Button>
                    <Button
                        type="button"
                        onClick={onContinue}
                        className="bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white rounded-md font-bold"
                    >
                        Continue to Finalization
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}
