import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Minus, ChevronDown, ChevronRight, FolderTree, Folder, Briefcase, BarChart3, Coins, Users, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrgChartMapping, JobDefinition } from '../hooks/useJobAnalysisState';

interface Step5OrgChartMappingProps {
    jobDefinitions: Record<string, JobDefinition>;
    orgMappings: OrgChartMapping[];
    onMappingsChange: (mappings: OrgChartMapping[]) => void;
    onContinue: (mappings?: OrgChartMapping[]) => void;
    onBack: () => void;
}

export default function Step5OrgChartMapping({
    jobDefinitions,
    orgMappings,
    onMappingsChange,
    onContinue,
    onBack,
}: Step5OrgChartMappingProps) {
    const [orgUnits, setOrgUnits] = useState<OrgChartMapping[]>(orgMappings);
    const [draggedJobId, setDraggedJobId] = useState<number | null>(null);
    const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set(orgMappings.map((u) => u.id)));
    const [validationError, setValidationError] = useState<string | null>(null);
    const [emptyUnitIds, setEmptyUnitIds] = useState<Set<string>>(new Set());
    const validationBannerRef = useRef<HTMLDivElement>(null);

    const allJobIds = useMemo(() => {
        const ids: number[] = [];
        Object.values(jobDefinitions).forEach((def) => {
            if (def.job_keyword_id) ids.push(def.job_keyword_id);
            if (def.grouped_job_keyword_ids) ids.push(...def.grouped_job_keyword_ids);
        });
        return [...new Set(ids)];
    }, [jobDefinitions]);

    const mappedJobIds = useMemo(() => {
        const set = new Set<number>();
        orgUnits.forEach((u) => u.job_keyword_ids.forEach((id) => set.add(id)));
        return set;
    }, [orgUnits]);

    const mappedCount = mappedJobIds.size;
    const totalJobs = allJobIds.length;
    const progressPct = totalJobs > 0 ? Math.round((mappedCount / totalJobs) * 100) : 0;

    useEffect(() => {
        onMappingsChange(orgUnits);
    }, [orgUnits, onMappingsChange]);

    useEffect(() => {
        setValidationError(null);
        setEmptyUnitIds(new Set());
    }, [orgUnits]);

    useEffect(() => {
        if (validationError && validationBannerRef.current) {
            validationBannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [validationError]);

    const toggleUnit = (id: string) => {
        setExpandedUnits((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleAddOrgUnit = () => {
        const id = `unit-${Date.now()}`;
        setOrgUnits([
            ...orgUnits,
            {
                id,
                org_unit_name: '',
                job_keyword_ids: [],
                job_specialists: [],
            },
        ]);
        setExpandedUnits((prev) => new Set(prev).add(id));
    };

    const handleAddSubUnit = (afterUnitId: string) => {
        const index = orgUnits.findIndex((u) => u.id === afterUnitId);
        if (index === -1) return;
        const id = `unit-${Date.now()}`;
        const newUnit: OrgChartMapping = {
            id,
            org_unit_name: '',
            job_keyword_ids: [],
            job_specialists: [],
        };
        const next = [...orgUnits.slice(0, index + 1), newUnit, ...orgUnits.slice(index + 1)];
        setOrgUnits(next);
        setExpandedUnits((prev) => new Set(prev).add(id));
    };

    const handleRemoveUnit = (unitId: string) => {
        setOrgUnits(orgUnits.filter((u) => u.id !== unitId));
        setExpandedUnits((prev) => {
            const next = new Set(prev);
            next.delete(unitId);
            return next;
        });
    };

    const handleUpdateOrgUnit = (unitId: string, updates: Partial<OrgChartMapping>) => {
        setOrgUnits(orgUnits.map((u) => (u.id === unitId ? { ...u, ...updates } : u)));
    };

    const handleDragStart = (e: React.DragEvent, jobId: number) => {
        setDraggedJobId(jobId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(jobId));
        const el = e.currentTarget as HTMLElement;
        if (el) el.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const el = e.currentTarget as HTMLElement;
        if (el) el.style.opacity = '1';
        setDraggedJobId(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, unitId: string) => {
        e.preventDefault();
        const jobId = draggedJobId ?? (e.dataTransfer.getData('text/plain') ? parseInt(e.dataTransfer.getData('text/plain'), 10) : null);
        if (jobId == null || isNaN(jobId)) return;

        const unit = orgUnits.find((u) => u.id === unitId);
        if (unit && !unit.job_keyword_ids.includes(jobId)) {
            handleUpdateOrgUnit(unitId, {
                job_keyword_ids: [...unit.job_keyword_ids, jobId],
            });
        }
        setDraggedJobId(null);
    };

    const handleRemoveJobFromUnit = (unitId: string, jobId: number) => {
        const unit = orgUnits.find((u) => u.id === unitId);
        if (unit) {
            handleUpdateOrgUnit(unitId, {
                job_keyword_ids: unit.job_keyword_ids.filter((id) => id !== jobId),
                job_specialists: unit.job_specialists.filter((s) => s.job_keyword_id !== jobId),
            });
        }
    };

    const getJobName = (jobId: number): string => {
        const def = Object.values(jobDefinitions).find(
            (d) => d.job_keyword_id === jobId || d.grouped_job_keyword_ids?.includes(jobId)
        );
        return def?.job_name ?? `Job ${jobId}`;
    };

    const getInitials = (name: string) => {
        return name
            .split(/\s+/)
            .map((s) => s[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getJobIcon = (jobId: number) => {
        const name = getJobName(jobId).toLowerCase();
        if (name.includes('accounting') || name.includes('finance')) return <BarChart3 className="w-3.5 h-3.5 text-white shrink-0" />;
        if (name.includes('treasury')) return <Coins className="w-3.5 h-3.5 text-white shrink-0" />;
        if (name.includes('hr')) return <Users className="w-3.5 h-3.5 text-white shrink-0" />;
        if (name.includes('clinical')) return <Building2 className="w-3.5 h-3.5 text-white shrink-0" />;
        return <Briefcase className="w-3.5 h-3.5 text-white shrink-0" />;
    };

    const JobIconForList = ({ jobId }: { jobId: number }) => {
        const name = getJobName(jobId).toLowerCase();
        if (name.includes('accounting') || name.includes('finance')) return <BarChart3 className="w-4 h-4 text-[#6b7280] shrink-0" />;
        if (name.includes('treasury')) return <Coins className="w-4 h-4 text-[#6b7280] shrink-0" />;
        if (name.includes('hr')) return <Users className="w-4 h-4 text-[#6b7280] shrink-0" />;
        if (name.includes('clinical')) return <Building2 className="w-4 h-4 text-[#6b7280] shrink-0" />;
        return <Briefcase className="w-4 h-4 text-[#6b7280] shrink-0" />;
    };

    return (
        <div className="min-h-full flex flex-col bg-[#f9f7f2] text-[#121431] pb-28">
            <div className="max-w-[1200px] mx-auto w-full py-10 px-5" style={{ padding: '0 20px' }}>
                <div className="mb-2" style={{ color: '#b88a44', fontSize: 11, fontWeight: 700, letterSpacing: 1.2 }}>
                    STEP 5 OF 6 – ORG CHART MAPPING
                </div>
                <h1 className="m-0 mb-3" style={{ fontFamily: 'Playfair Display, serif', fontSize: 32 }}>
                    Organization Chart Mapping
                </h1>
                <p className="text-[#6b7280] text-[15px] mb-6 max-w-[900px] leading-relaxed">
                    The finalized Job Definition documents are mapped to your organizational structure, and the responsible owners for each organization unit and role are identified.
                    This stage is not intended to change the organizational structure or make HR or personnel decisions. Drag jobs from the right panel and drop them into the appropriate unit.
                </p>

                {validationError && (
                    <div
                        ref={validationBannerRef}
                        className="rounded-lg px-5 py-4 mb-6 text-white text-left"
                        style={{ background: '#dc2626' }}
                        role="alert"
                    >
                        <p className="font-bold text-[15px] m-0 mb-1">Validation</p>
                        <p className="text-[14px] m-0 font-normal opacity-95">{validationError}</p>
                        <p className="text-[13px] m-0 mt-2 opacity-90">Type the unit name in the box next to the folder icon at the top of each card (e.g. &quot;Division A&quot;, &quot;Finance Team&quot;), then click Continue again.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                    {/* Left: Organizational Units — white card container */}
                    <div
                        className="bg-white rounded-xl border border-[#e5e7eb] p-6"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                    >
                        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                            <div className="flex items-center gap-2">
                                <FolderTree className="w-5 h-5 text-[#48b082]" aria-hidden />
                                <span className="font-bold text-[12px] uppercase tracking-wider text-[#121431]">
                                    ORGANIZATIONAL UNITS
                                </span>
                                <span className="text-[13px] text-[#9ca3af]">{orgUnits.length} units</span>
                            </div>
                            <Button
                                onClick={handleAddOrgUnit}
                                className="rounded-lg bg-[#121431] hover:bg-[#1e2a4a] text-white text-[13px] font-semibold px-4 py-2 shadow-sm"
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                Add Unit
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {orgUnits.length === 0 && (
                                <div
                                    className="rounded-xl border-2 border-dashed p-8 text-center text-[#6b7280] text-[13px]"
                                    style={{ borderColor: '#e5e7eb', background: '#faf9f7' }}
                                >
                                    No organizational units yet. Click &quot;+ Add Unit&quot; to create one.
                                </div>
                            )}
                            {orgUnits.map((unit, index) => {
                                const isExpanded = expandedUnits.has(unit.id);
                                const jobCount = unit.job_keyword_ids.length;
                                const isChild = index > 0;
                                return (
                                    <div
                                        key={unit.id}
                                        className={cn(
                                            'rounded-xl border overflow-hidden transition-shadow',
                                            'border-[#e5e7eb]',
                                            isChild && 'relative ml-5 pl-4 border-l-2 border-[#e5e7eb]'
                                        )}
                                        style={{
                                            background: '#f5f3ef',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                        }}
                                    >
                                        <div
                                            className="flex items-center gap-2 px-4 py-3.5 cursor-pointer hover:bg-[#efece8]"
                                            onClick={() => toggleUnit(unit.id)}
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="w-4 h-4 text-[#64748b] shrink-0" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-[#64748b] shrink-0" />
                                            )}
                                            <Folder className="w-4 h-4 text-[#1e40af] shrink-0" />
                                            <Input
                                                value={unit.org_unit_name ?? ''}
                                                onChange={(e) =>
                                                    handleUpdateOrgUnit(unit.id, { org_unit_name: e.target.value })
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder="Unit name (e.g. Division A, Finance Team)"
                                                className={cn(
                                                    'flex-1 min-w-0 font-semibold text-[#121431] focus-visible:ring-0 h-auto py-0 text-[14px] bg-transparent rounded transition-colors',
                                                    emptyUnitIds.has(unit.id)
                                                        ? 'border-2 border-red-500 shadow-none'
                                                        : 'border-0 shadow-none'
                                                )}
                                            />
                                            <span className="text-[13px] text-[#9ca3af] shrink-0">{jobCount} jobs</span>
                                        </div>

                                        {isExpanded && (
                                            <div className="px-4 pb-4 pt-0 border-t border-[#e5e7eb] space-y-4">
                                                {/* Remove unit button + Unit head */}
                                                <div
                                                    className="flex items-center gap-3 pt-3 rounded-lg p-3"
                                                    style={{ background: '#faf9f7' }}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveUnit(unit.id);
                                                        }}
                                                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#121431]"
                                                        style={{ background: '#121431' }}
                                                        title="Remove this unit"
                                                        aria-label="Remove this unit"
                                                    >
                                                        <Minus className="w-5 h-5 text-white" strokeWidth={2.5} />
                                                    </button>
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
                                                        style={{ background: '#121431' }}
                                                    >
                                                        {unit.org_head_name ? getInitials(unit.org_head_name) : '—'}
                                                    </div>
                                                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        <Input
                                                            value={unit.org_head_name || ''}
                                                            onChange={(e) =>
                                                                handleUpdateOrgUnit(unit.id, { org_head_name: e.target.value })
                                                            }
                                                            placeholder="Name"
                                                            className="text-[13px] border-[#e5e7eb] rounded-lg font-semibold h-9 bg-white"
                                                        />
                                                        <Input
                                                            value={unit.org_head_title || ''}
                                                            onChange={(e) =>
                                                                handleUpdateOrgUnit(unit.id, { org_head_title: e.target.value })
                                                            }
                                                            placeholder="Title (e.g. Director, Team Lead)"
                                                            className="text-[13px] border-[#e5e7eb] rounded-lg text-[#6b7280] h-9 bg-white"
                                                        />
                                                        <Input
                                                            value={unit.org_head_rank || ''}
                                                            onChange={(e) =>
                                                                handleUpdateOrgUnit(unit.id, { org_head_rank: e.target.value })
                                                            }
                                                            placeholder="Rank"
                                                            className="text-[13px] border-[#e5e7eb] rounded-lg text-[#6b7280] h-9 bg-white sm:col-span-2"
                                                        />
                                                        <Input
                                                            value={unit.org_head_email || ''}
                                                            onChange={(e) =>
                                                                handleUpdateOrgUnit(unit.id, { org_head_email: e.target.value })
                                                            }
                                                            placeholder="Email address"
                                                            type="email"
                                                            className="text-[13px] border-[#e5e7eb] rounded-lg text-[#6b7280] h-9 bg-white sm:col-span-2"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Drop zone — dotted rectangle */}
                                                <div
                                                    className={cn(
                                                        'min-h-[64px] rounded-lg p-4 transition-colors flex flex-wrap items-center gap-2',
                                                        draggedJobId ? 'border-2 border-dashed border-[#121431] bg-[#121431]/5' : 'border-2 border-dashed border-[#d1d5db] bg-[#fafafa]'
                                                    )}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, unit.id)}
                                                >
                                                    {jobCount === 0 ? (
                                                        <p className="text-[13px] text-[#9ca3af] w-full text-center py-0">
                                                            Drop jobs here
                                                        </p>
                                                    ) : (
                                                        unit.job_keyword_ids.map((jobId) => (
                                                            <span
                                                                key={jobId}
                                                                className="inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-1.5 py-1.5 text-[12px] font-medium text-white border border-[#334155]/40"
                                                                style={{ background: '#121431' }}
                                                            >
                                                                {getJobIcon(jobId)}
                                                                {getJobName(jobId)}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveJobFromUnit(unit.id, jobId);
                                                                    }}
                                                                    className="hover:opacity-80 rounded-full p-0.5"
                                                                    aria-label={`Remove ${getJobName(jobId)}`}
                                                                >
                                                                    <X className="w-3 h-3 text-white" />
                                                                </button>
                                                            </span>
                                                        ))
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddSubUnit(unit.id);
                                                    }}
                                                    className="text-[13px] font-medium text-[#6b7280] hover:text-[#121431] hover:underline flex items-center gap-1.5"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Add Sub-Unit
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Finalized Jobs + Progress */}
                    <div className="space-y-4">
                        <div
                            className="bg-white rounded-xl border border-[#e5e7eb] p-4"
                            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                        >
                            <div className="font-bold text-[12px] uppercase tracking-wider text-[#121431] mb-3 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-[#121431]" />
                                Finalized Jobs
                            </div>
                            {allJobIds.length === 0 ? (
                                <p className="text-[13px] text-[#6b7280] text-center py-4">
                                    No finalized jobs. Complete Job Definition first.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {allJobIds.map((jobId) => (
                                        <div
                                            key={jobId}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, jobId)}
                                            onDragEnd={handleDragEnd}
                                            className="flex items-center gap-2 p-2.5 rounded-lg border border-[#e5e7eb] bg-[#faf9f7] cursor-move hover:border-[#121431]/30 hover:bg-[#121431]/5 text-[13px] font-medium text-[#121431]"
                                        >
                                            <JobIconForList jobId={jobId} />
                                            {getJobName(jobId)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* FINALIZED JOBS progress — slightly darker beige card */}
                        <div
                            className="rounded-xl border border-[#e5e7eb] p-4"
                            style={{ background: '#f5f3ef', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                        >
                            <div className="flex items-center justify-between gap-2 mb-2.5">
                                <span className="font-bold text-[12px] uppercase tracking-wider text-[#121431] flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-[#121431]" />
                                    FINALIZED JOBS
                                </span>
                                <span className="text-[13px] font-medium" style={{ color: '#48b082' }}>
                                    {mappedCount}/{totalJobs} mapped
                                </span>
                            </div>
                            <div className="h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{ width: `${progressPct}%`, background: '#48b082' }}
                                />
                            </div>
                            <div className="mt-3 space-y-2">
                                {allJobIds.map((jobId) => {
                                    const mapped = mappedJobIds.has(jobId);
                                    return (
                                        <div key={jobId} className="flex items-center gap-2 text-[13px]">
                                            <JobIconForList jobId={jobId} />
                                            <span className={cn('flex-1', mapped ? 'text-[#121431] font-medium' : 'text-[#6b7280]')}>
                                                {getJobName(jobId)}
                                            </span>
                                            {mapped && (
                                                <span className="text-[#48b082] font-bold text-[14px]" aria-hidden>✓</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer
                className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-between items-center z-[100]"
                style={{
                    borderColor: '#e5e7eb',
                    padding: '16px 24px',
                    boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
                }}
            >
                <p className="text-[14px] text-[#6b7280]">
                    Units: <strong className="text-[#121431]">{orgUnits.length}</strong>
                    {' · '}
                    Jobs mapped: <strong className="text-[#121431]">{mappedCount} / {totalJobs}</strong>
                </p>
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="rounded-lg border-[#e5e7eb] text-sm font-semibold px-5 py-2.5 hover:bg-[#f9fafb]"
                    >
                        ← Back
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            const empty = orgUnits.filter((u) => !String(u.org_unit_name ?? '').trim());
                            if (empty.length > 0) {
                                setEmptyUnitIds(new Set(empty.map((u) => u.id)));
                                setValidationError('Please enter a name for every organizational unit in the unit name field (top row of each card, next to the folder icon).');
                                setExpandedUnits((prev) => new Set([...prev, ...empty.map((u) => u.id)]));
                                return;
                            }
                            setEmptyUnitIds(new Set());
                            setValidationError(null);
                            onContinue(orgUnits);
                        }}
                        className="rounded-lg bg-[#121431] hover:bg-[#1e2a4a] text-white text-sm font-semibold px-5 py-2.5 shadow-sm"
                    >
                        Continue to Review & Submit →
                    </Button>
                </div>
            </footer>
        </div>
    );
}
