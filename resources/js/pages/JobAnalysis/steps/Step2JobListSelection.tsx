import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Stethoscope, Settings, Link2, Search, ChevronLeft, ArrowRight, X, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JobSelection } from '../hooks/useJobAnalysisState';

const MIN_JOBS_REQUIRED = 3;

interface JobKeyword {
    id: number;
    name: string;
    job_family?: string;
    tags?: ('core' | 'pre_selected' | 'recommended')[];
}

interface DiagnosisContext {
    industry: string | null;
    sizeRange: string | null;
    jobClassificationStatus: string | null;
    hasFormalFramework: boolean;
}

interface Step2JobListSelectionProps {
    suggestedJobs: JobKeyword[];
    jobSelections: JobSelection;
    onSelectionsChange: (selections: JobSelection) => void;
    onContinue: () => void;
    onBack: () => void;
    industry?: string;
    sizeRange?: string;
    diagnosisContext?: DiagnosisContext | null;
}

const FAMILY_ICONS: Record<string, React.ReactNode> = {
    'Corporate & Management Support': <Building2 className="w-4 h-4" />,
    'Clinical & Medical': <Stethoscope className="w-4 h-4" />,
    'Operations & Technology': <Settings className="w-4 h-4" />,
    'Other': <Building2 className="w-4 h-4" />,
};

export default function Step2JobListSelection({
    suggestedJobs,
    jobSelections,
    onSelectionsChange,
    onContinue,
    onBack,
    industry,
    sizeRange,
    diagnosisContext,
}: Step2JobListSelectionProps) {
    const [selectedJobIds, setSelectedJobIds] = useState<number[]>(
        jobSelections.selected_job_keyword_ids || []
    );
    const [customJobs, setCustomJobs] = useState<string[]>(jobSelections.custom_jobs || []);
    const [customJobInput, setCustomJobInput] = useState('');
    const [groupedJobs] = useState(jobSelections.grouped_jobs || []);

    // Pre-select when no formal framework (only on initial load if no existing selections)
    const [didPreSelect, setDidPreSelect] = useState(false);
    useEffect(() => {
        if (
            didPreSelect ||
            !diagnosisContext?.hasFormalFramework ||
            suggestedJobs.length === 0 ||
            selectedJobIds.length > 0
        ) {
            return;
        }
        const preSelected = suggestedJobs
            .filter((j) => (j.tags || []).includes('pre_selected'))
            .map((j) => j.id);
        if (preSelected.length > 0) {
            setSelectedJobIds(preSelected);
            setDidPreSelect(true);
        }
    }, [diagnosisContext?.hasFormalFramework, suggestedJobs, didPreSelect, selectedJobIds.length]);

    useEffect(() => {
        onSelectionsChange({
            selected_job_keyword_ids: selectedJobIds,
            custom_jobs: customJobs,
            grouped_jobs: groupedJobs,
        });
    }, [selectedJobIds, customJobs, groupedJobs, onSelectionsChange]);

    const handleJobToggle = (jobId: number) => {
        if (selectedJobIds.includes(jobId)) {
            setSelectedJobIds(selectedJobIds.filter((id) => id !== jobId));
        } else {
            setSelectedJobIds([...selectedJobIds, jobId]);
        }
    };

    const handleAddCustomJob = () => {
        const name = customJobInput.trim();
        if (name && !customJobs.includes(name)) {
            setCustomJobs([...customJobs, name]);
            setCustomJobInput('');
        }
    };

    const handleRemoveToken = (type: 'job' | 'custom', idOrIndex: number | string) => {
        if (type === 'job') {
            setSelectedJobIds(selectedJobIds.filter((id) => id !== idOrIndex));
        } else {
            setCustomJobs(customJobs.filter((_, i) => i !== idOrIndex));
        }
    };

    // Group jobs by family
    const byFamily = suggestedJobs.reduce<Record<string, JobKeyword[]>>((acc, job) => {
        const family = job.job_family || 'Other';
        if (!acc[family]) acc[family] = [];
        acc[family].push(job);
        return acc;
    }, {});
    const baseFamilies = [
        'Corporate & Management Support',
        'Clinical & Medical',
        'Operations & Technology',
        'Other',
    ];
    const familyOrder = [
        ...baseFamilies.filter((f) => byFamily[f]?.length),
        ...Object.keys(byFamily).filter((f) => !baseFamilies.includes(f)),
    ];

    const totalConfirmed = selectedJobIds.length + customJobs.length;
    const hasEnough = totalConfirmed >= MIN_JOBS_REQUIRED;
    const confirmedNames: string[] = [
        ...selectedJobIds
            .map((id) => suggestedJobs.find((j) => j.id === id)?.name)
            .filter(Boolean) as string[],
        ...customJobs,
    ];

    const industryLabel = industry || 'your industry';
    const sizeLabel = sizeRange ? sizeRange.replace('-', ' - ') + ' employees' : 'your size';
    const frameworkLabel = diagnosisContext?.hasFormalFramework
        ? 'with a formal job classification framework'
        : 'without a formal job classification framework';

    return (
        <div className="min-h-full flex flex-col bg-[#f6f3eb] text-[#333]">
            <div
                className="max-w-[1300px] mx-auto w-full py-10 pb-32 grid gap-10 lg:grid-cols-[1fr_300px]"
                style={{ margin: '40px auto', padding: '0 20px', gap: 40 }}
            >
                <main className="min-w-0">
                    <div
                        className="text-[#b59461] font-bold text-[11px] mb-1"
                        style={{ marginBottom: 5 }}
                    >
                        STEP 2 OF 6 — JOB ANALYSIS
                    </div>
                    <h1 className="text-[#1a1a3d] font-bold m-0" style={{ fontSize: 28, marginBottom: 10 }}>
                        Job List Selection
                    </h1>
                    <p className="text-[#666] mb-4" style={{ marginBottom: 16 }}>
                        <strong>Purpose:</strong> To define the scope of jobs that exist within the company based on industry characteristics.
                        This stage is not intended to analyze individual jobs. Instead, it is the step where we confirm and finalize the range of jobs that will be designed and structured for the company.
                    </p>

                    {/* Info box */}
                    <div
                        className="flex gap-4 rounded-lg border mb-8"
                        style={{
                            background: '#ece9df',
                            padding: 20,
                            borderRadius: 8,
                            border: '1px solid #ddd',
                            marginBottom: 30,
                        }}
                    >
                        <div className="text-xl shrink-0">
                            <Link2 className="w-5 h-5 text-[#666]" />
                        </div>
                        <p className="text-[13px] leading-relaxed" style={{ lineHeight: 1.5 }}>
                            Based on your industry and organizational size, we suggest a list of job roles that typically exist in similar companies.
                            Please select and adjust only the jobs that are currently in operation at your company.
                            If your company has unique roles not included in the standard job list, please add them (e.g., R&D Planning, Global Operations, Platform Operations).
                            We&apos;ve pre-configured a list for a <strong>{industryLabel} company ({sizeLabel})</strong>{' '}
                            {frameworkLabel}.
                        </p>
                    </div>

                    {/* Job sections by family */}
                    {familyOrder.map((family) => {
                        const jobs = byFamily[family] || [];
                        const selectedInFamily = jobs.filter((j) => selectedJobIds.includes(j.id)).length;
                        return (
                            <div key={family}>
                                <div
                                    className="flex items-center gap-2 font-bold text-base flex-wrap"
                                    style={{ margin: '30px 0 15px' }}
                                >
                                    <span className="flex items-center gap-2">
                                        {FAMILY_ICONS[family] || <Building2 className="w-4 h-4" />}
                                        {family}
                                    </span>
                                    <span
                                        className="font-normal text-[11px] text-[#888] border border-[#ddd] px-2 py-0.5 rounded-[10px]"
                                        style={{ padding: '1px 8px' }}
                                    >
                                        {jobs.length} roles
                                    </span>
                                    {selectedInFamily > 0 && (
                                        <span className="text-[#5cb85c] text-[11px]">
                                            {selectedInFamily} selected
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="grid gap-3"
                                    style={{
                                        gridTemplateColumns: window.innerWidth < 640
                                        ? "1fr"
                                        : "repeat(3, 1fr)"
                                    }}
                                >
                                    {jobs.map((job) => {
                                        const isSelected = selectedJobIds.includes(job.id);
                                        const tags = job.tags || [];
                                        return (
                                            <button
                                                key={job.id}
                                                type="button"
                                                onClick={() => handleJobToggle(job.id)}
                                                className={cn(
                                                    'rounded-lg p-4 border text-left transition-all',
                                                    isSelected
                                                        ? 'border-2 border-[#5cb85c] bg-[#f0f7f0]'
                                                        : 'border border-white bg-white hover:border-[#e0ddd5]'
                                                )}
                                                style={{
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => handleJobToggle(job.id)}
                                                        className="border-[#cbd5e1] data-[state=checked]:bg-[#5cb85c] data-[state=checked]:border-[#5cb85c]"
                                                    />
                                                    <span className="font-bold flex-1">{job.name}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {tags.includes('pre_selected') && (
                                                        <span
                                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px]"
                                                            style={{
                                                                background: '#d4e9d5',
                                                                color: '#2e7d32',
                                                            }}
                                                        >
                                                            PRE-SELECTED
                                                        </span>
                                                    )}
                                                    {tags.includes('core') && (
                                                        <span
                                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px]"
                                                            style={{
                                                                background: '#dbdad3',
                                                                color: '#555',
                                                            }}
                                                        >
                                                            CORE
                                                        </span>
                                                    )}
                                                    {tags.includes('recommended') && (
                                                        <span
                                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px]"
                                                            style={{
                                                                background: '#f9f1c7',
                                                                color: '#856404',
                                                            }}
                                                        >
                                                            RECOMMENDED
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Add custom job */}
                    <div className="mt-12" style={{ marginTop: 50 }}>
                        <div
                            className="font-bold text-xs uppercase"
                            style={{ letterSpacing: 0.5 }}
                        >
                            ADD A CUSTOM JOB
                        </div>
                        <div className="flex gap-2 mt-2" style={{ marginTop: 10, gap: 10 }}>
                            <Input
                                value={customJobInput}
                                onChange={(e) => setCustomJobInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddCustomJob();
                                    }
                                }}
                                placeholder="e.g., R&D Planning, Global Operations"
                                className="flex-1 border-[#ccc] rounded-md"
                                style={{ padding: 12 }}
                            />
                            <Button
                                type="button"
                                onClick={handleAddCustomJob}
                                className="bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white font-bold rounded-md px-6"
                                style={{ padding: '0 25px' }}
                            >
                                + Add
                            </Button>
                        </div>
                    </div>

                    {/* Confirmed scope */}
                    <div
                        className="mt-8 rounded-lg border bg-white p-5"
                        style={{
                            marginTop: 30,
                            borderRadius: 8,
                            border: '1px solid #e0ddd5',
                            padding: 20,
                        }}
                    >
                        <div
                            className="flex justify-between items-center flex-wrap gap-2 mb-4"
                            style={{ marginBottom: 15 }}
                        >
                            <div className="font-bold flex items-center gap-2 flex-wrap">
                                <ClipboardList className="w-4 h-4 shrink-0" />
                                <span>Confirmed Job Scope for Analysis</span>
                                <span
                                    className="text-white text-[10px] font-medium px-2 py-0.5 rounded-[10px]"
                                    style={{ background: '#1a1a3d' }}
                                >
                                    {totalConfirmed}
                                </span>
                            </div>
                            <div className="text-[#999] text-[11px]">
                                Jobs selected above appear here
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedJobIds.map((jobId) => {
                                const name = suggestedJobs.find((j) => j.id === jobId)?.name;
                                if (!name) return null;
                                return (
                                    <span
                                        key={`job-${jobId}`}
                                        className="inline-flex items-center gap-1.5 bg-[#f0f7f0] border border-[#5cb85c] text-[#5cb85c] rounded-[20px] text-[13px] py-1 px-3"
                                    >
                                        {name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveToken('job', jobId)}
                                            className="hover:opacity-80"
                                            aria-label={`Remove ${name}`}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })}
                            {customJobs.map((name, index) => (
                                <span
                                    key={`custom-${index}`}
                                    className="inline-flex items-center gap-1.5 bg-[#f0f7f0] border border-[#5cb85c] text-[#5cb85c] rounded-[20px] text-[13px] py-1 px-3"
                                >
                                    {name}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveToken('custom', index)}
                                        className="hover:opacity-80"
                                        aria-label={`Remove ${name}`}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Sidebar - Diagnosis Context */}
                {diagnosisContext && (
                    <aside className="shrink-0">
                        <div
                            className="rounded-xl overflow-hidden bg-white"
                            style={{
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                borderRadius: 12,
                            }}
                        >
                            <div
                                className="text-white p-5"
                                style={{ background: '#151535', padding: 20 }}
                            >
                                <div className="font-bold mb-1 flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    Diagnosis Context
                                </div>
                                <div className="text-[11px] opacity-70">
                                    Based on your Step 1-2 responses
                                </div>
                            </div>
                            <div
                                className="border-b border-[#f0f0f0] px-5 py-4"
                                style={{ padding: '15px 20px' }}
                            >
                                <div className="text-[10px] text-[#999] uppercase mb-1">
                                    Industry
                                </div>
                                <div className="font-bold">{diagnosisContext.industry || '—'}</div>
                            </div>
                            <div
                                className="border-b border-[#f0f0f0] px-5 py-4"
                                style={{ padding: '15px 20px' }}
                            >
                                <div className="text-[10px] text-[#999] uppercase mb-1">
                                    Company Size
                                </div>
                                <div className="font-bold">
                                    {diagnosisContext.sizeRange
                                        ? `${diagnosisContext.sizeRange.replace('-', ' - ')} employees`
                                        : '—'}
                                </div>
                            </div>
                            <div
                                className="border-b border-[#f0f0f0] px-5 py-4"
                                style={{ padding: '15px 20px' }}
                            >
                                <div className="text-[10px] text-[#999] uppercase mb-1">
                                    Job Classification
                                </div>
                                <div
                                    className={cn(
                                        'font-bold',
                                        diagnosisContext.jobClassificationStatus !== 'yes' && 'text-[#d9534f]'
                                    )}
                                >
                                    {diagnosisContext.jobClassificationStatus === 'yes'
                                        ? 'In place'
                                        : diagnosisContext.jobClassificationStatus === 'no'
                                        ? 'Not in place'
                                        : diagnosisContext.jobClassificationStatus === 'not_sure'
                                        ? 'Not sure'
                                        : '—'}
                                </div>
                            </div>
                            <div
                                className="border-b border-[#f0f0f0] px-5 py-4"
                                style={{ padding: '15px 20px' }}
                            >
                                <div className="text-[10px] text-[#999] uppercase mb-1">
                                    Role Differentiation
                                </div>
                                <div className="font-bold text-[#5cb85c]">By skill level ✓</div>
                            </div>
                            <div
                                className="border-b border-[#f0f0f0] px-5 py-4"
                                style={{ padding: '15px 20px' }}
                            >
                                <div className="text-[10px] text-[#999] uppercase mb-1">
                                    Grade Authority
                                </div>
                                <div className="font-bold text-[#d9534f]">Not defined</div>
                            </div>
                            <div className="p-5 text-xs" style={{ lineHeight: 1.4, padding: 20 }}>
                                <strong className="text-[#c8963e]">Why this matters:</strong> Jobs
                                marked <strong>Core</strong> are based on your profile. Pre-selected
                                roles reflect standard essentials.
                            </div>
                        </div>
                    </aside>
                )}
            </div>

            {/* Sticky footer */}
            <footer
                className="sticky bottom-0 w-full bg-white border-t border-[#ddd] py-4 px-6 flex flex-wrap items-center justify-between gap-4 z-10 mt-auto"
                
            >
                <p className="text-[13px] text-[#666]">
                    Select at least <strong>{MIN_JOBS_REQUIRED} jobs</strong> — {totalConfirmed} selected
                    so far
                </p>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="border-[#ccc] rounded-md font-medium"
                        style={{ padding: '10px 25px' }}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back
                    </Button>
                    <Button
                        type="button"
                        onClick={onContinue}
                        disabled={!hasEnough}
                        className={cn(
                            'rounded-md font-bold',
                            hasEnough
                                ? 'bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white'
                                : 'bg-[#b8b8c0] text-white cursor-not-allowed'
                        )}
                        style={{ padding: '12px 30px' }}
                    >
                        Continue to Job Definition
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}
