import { Plus, X, ChevronDown, ChevronRight, FolderTree, Folder, Briefcase, BarChart3, Coins, Users, Building2, GripVertical } from 'lucide-react';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { OrgChartMapping, JobDefinition, JobSelection } from '../hooks/useJobAnalysisState';

const MAX_DEPTH = 2; // 3 levels: 0, 1, 2

function normalizeMapping(u: OrgChartMapping & { parent_id?: number | string | null }, index: number): OrgChartMapping {
    const id = u.id != null ? String(u.id) : `unit-${index}`;
    const parentId = (u.parentId ?? (u as { parent_id?: number | string | null }).parent_id) != null
        ? String((u.parentId ?? (u as { parent_id?: number | string | null }).parent_id))
        : null;
    return {
        ...u,
        id,
        parentId: parentId || undefined,
        sort_order: u.sort_order ?? index,
    };
}

function buildTreeOrder(units: OrgChartMapping[]): OrgChartMapping[] {
    const byId = new Map<string, OrgChartMapping>();
    units.forEach((u) => byId.set(u.id, { ...u }));
    const depth = new Map<string, number>();
    function getDepth(id: string): number {
        if (depth.has(id)) return depth.get(id)!;
        const u = byId.get(id);
        const d = !u?.parentId ? 0 : 1 + getDepth(u.parentId);
        depth.set(id, d);
        return d;
    }
    units.forEach((u) => getDepth(u.id));
    return [...units].sort((a, b) => {
        const da = depth.get(a.id) ?? 0;
        const db = depth.get(b.id) ?? 0;
        if (da !== db) return da - db;
        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    }).map((u) => ({ ...u, depth: Math.min((depth.get(u.id) ?? 0), MAX_DEPTH) as 0 | 1 | 2 }));
}

interface Step5OrgChartMappingProps {
    jobDefinitions: Record<string, JobDefinition>;
    jobSelections?: JobSelection;
    orgMappings: OrgChartMapping[];
    onMappingsChange: (mappings: OrgChartMapping[]) => void;
    onContinue: (mappings?: OrgChartMapping[]) => void;
    onBack: () => void;
    fieldErrors?: FieldErrors;
}

export default function Step5OrgChartMapping({
    jobDefinitions,
    jobSelections,
    orgMappings,
    onMappingsChange,
    onContinue,
    onBack,
    fieldErrors = {},
}: Step5OrgChartMappingProps) {
    const { t } = useTranslation();
    const [orgUnits, setOrgUnits] = useState<OrgChartMapping[]>(() =>
        buildTreeOrder(orgMappings.map((u, i) => normalizeMapping(u as OrgChartMapping & { parent_id?: number | string | null }, i)))
    );

    const [draggedJobId, setDraggedJobId] = useState<number | null>(null);
    const [draggedUnitId, setDraggedUnitId] = useState<string | null>(null);
    const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set(orgMappings.map((u) => u.id)));
    const [validationError, setValidationError] = useState<string | null>(null);
    const [emptyUnitIds, setEmptyUnitIds] = useState<Set<string>>(new Set());
    const validationBannerRef = useRef<HTMLDivElement>(null);
    const scrollRAFRef = useRef<number | null>(null);
    const unitsPanelScrollRef = useRef<HTMLDivElement>(null);
    const EDGE_THRESHOLD = 80;
    const SCROLL_STEP = 14;

    const allJobIds = useMemo(() => {
        const selectedSet = new Set<number>([
            ...(jobSelections?.selected_job_keyword_ids ?? []),
            ...((jobSelections?.grouped_jobs ?? []).flatMap((g) => g.job_keyword_ids ?? [])),
        ]);
        const ids: number[] = [];
        Object.values(jobDefinitions).forEach((def) => {
            if (def.job_keyword_id && (selectedSet.size === 0 || selectedSet.has(def.job_keyword_id))) {
                ids.push(def.job_keyword_id);
            }
            if (def.grouped_job_keyword_ids) {
                def.grouped_job_keyword_ids.forEach((id) => {
                    if (selectedSet.size === 0 || selectedSet.has(id)) ids.push(id);
                });
            }
        });
        return [...new Set(ids)];
    }, [jobDefinitions, jobSelections]);

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

    // Auto-scroll when dragging a job near top/bottom of the units panel (or viewport)
    useEffect(() => {
        if (!draggedJobId) return;
        const onDragOver = (e: DragEvent) => {
            const y = e.clientY;
            const panelEl = unitsPanelScrollRef.current;
            let scrollTarget: { el: HTMLElement; down: boolean } | null = null;

            if (panelEl) {
                const rect = panelEl.getBoundingClientRect();
                const canScrollDown = panelEl.scrollHeight > panelEl.clientHeight;
                const canScrollUp = panelEl.scrollTop > 0;
                if (y >= rect.bottom - EDGE_THRESHOLD && canScrollDown)
                    scrollTarget = { el: panelEl, down: true };
                else if (y <= rect.top + EDGE_THRESHOLD && canScrollUp)
                    scrollTarget = { el: panelEl, down: false };
            }
            if (!scrollTarget) {
                const viewHeight = window.innerHeight;
                if (y >= viewHeight - EDGE_THRESHOLD) scrollTarget = { el: document.documentElement, down: true };
                else if (y <= EDGE_THRESHOLD) scrollTarget = { el: document.documentElement, down: false };
            }

            if (scrollTarget) {
                e.preventDefault();
                if (scrollRAFRef.current != null) return;
                const run = () => {
                    if (scrollTarget) {
                        if (scrollTarget.el === document.documentElement) {
                            window.scrollBy(0, scrollTarget.down ? SCROLL_STEP : -SCROLL_STEP);
                        } else {
                            scrollTarget.el.scrollTop += scrollTarget.down ? SCROLL_STEP : -SCROLL_STEP;
                        }
                    }
                    scrollRAFRef.current = requestAnimationFrame(run);
                };
                scrollRAFRef.current = requestAnimationFrame(run);
            } else {
                if (scrollRAFRef.current != null) {
                    cancelAnimationFrame(scrollRAFRef.current);
                    scrollRAFRef.current = null;
                }
            }
        };
        const onDragEnd = () => {
            if (scrollRAFRef.current != null) {
                cancelAnimationFrame(scrollRAFRef.current);
                scrollRAFRef.current = null;
            }
        };
        document.addEventListener('dragover', onDragOver, false);
        document.addEventListener('dragend', onDragEnd, false);
        document.addEventListener('drop', onDragEnd, false);
        return () => {
            document.removeEventListener('dragover', onDragOver, false);
            document.removeEventListener('dragend', onDragEnd, false);
            document.removeEventListener('drop', onDragEnd, false);
            if (scrollRAFRef.current != null) {
                cancelAnimationFrame(scrollRAFRef.current);
            }
        };
    }, [draggedJobId]);

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
        const roots = orgUnits.filter((u) => !u.parentId);
        const sort_order = roots.length;
        setOrgUnits([
            ...orgUnits,
            {
                id,
                parentId: null,
                sort_order,
                depth: 0,
                org_unit_name: '',
                job_keyword_ids: [],
                job_specialists: [],
            },
        ]);
        setExpandedUnits((prev) => new Set(prev).add(id));
    };

    const handleAddSubUnit = (afterUnitId: string) => {
        const parent = orgUnits.find((u) => u.id === afterUnitId);
        if (!parent) return;
        const depth = (parent.depth ?? 0) + 1;
        if (depth > MAX_DEPTH) return;
        const id = `unit-${Date.now()}`;
        const siblings = orgUnits.filter((u) => u.parentId === parent.id || (u.parentId === undefined && parent.id === undefined));
        const sort_order = siblings.length;
        const newUnit: OrgChartMapping = {
            id,
            parentId: parent.id,
            sort_order,
            depth: depth as 0 | 1 | 2,
            org_unit_name: '',
            job_keyword_ids: [],
            job_specialists: [],
        };
        const insertIndex = orgUnits.findIndex((u) => u.id === afterUnitId) + 1;
        const next = [...orgUnits.slice(0, insertIndex), newUnit, ...orgUnits.slice(insertIndex)];
        setOrgUnits(buildTreeOrder(next));
        setExpandedUnits((prev) => new Set(prev).add(id).add(parent.id));
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

    const handleUnitDragStart = (e: React.DragEvent, unitId: string) => {
        e.stopPropagation();
        setDraggedUnitId(unitId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', `unit:${unitId}`);
    };

    const handleUnitDragEnd = (e: React.DragEvent) => {
        e.stopPropagation();
        setDraggedUnitId(null);
    };

    const handleUnitDragOver = (e: React.DragEvent, dropTargetId: string) => {
        if (!draggedUnitId || draggedUnitId === dropTargetId) return;
        const dragged = orgUnits.find((u) => u.id === draggedUnitId);
        const target = orgUnits.find((u) => u.id === dropTargetId);
        if (!dragged || !target || (dragged.parentId ?? null) !== (target.parentId ?? null)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleUnitDrop = (e: React.DragEvent, dropTargetId: string) => {
        e.preventDefault();
        if (!draggedUnitId || draggedUnitId === dropTargetId) {
            setDraggedUnitId(null);
            return;
        }
        const dragged = orgUnits.find((u) => u.id === draggedUnitId);
        const target = orgUnits.find((u) => u.id === dropTargetId);
        if (!dragged || !target || (dragged.parentId ?? null) !== (target.parentId ?? null)) {
            setDraggedUnitId(null);
            return;
        }
        const parentId = dragged.parentId ?? null;
        const siblings = orgUnits.filter((u) => (u.parentId ?? null) === parentId);
        const fromIdx = siblings.findIndex((u) => u.id === draggedUnitId);
        const toIdx = siblings.findIndex((u) => u.id === dropTargetId);
        if (fromIdx === -1 || toIdx === -1) {
            setDraggedUnitId(null);
            return;
        }
        const reordered = [...siblings];
        const [removed] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, removed);
        reordered.forEach((u, i) => {
            (u as OrgChartMapping).sort_order = i;
        });
        const byId = new Map(orgUnits.map((u) => [u.id, u]));
        reordered.forEach((u) => byId.set(u.id, { ...u, sort_order: (u as OrgChartMapping).sort_order }));
        const next = orgUnits.map((u) => byId.get(u.id) ?? u);
        setOrgUnits(buildTreeOrder(next));
        setDraggedUnitId(null);
    };

    const getJobName = (jobId: number): string => {
        const def = Object.values(jobDefinitions).find(
            (d) => d.job_keyword_id === jobId || d.grouped_job_keyword_ids?.includes(jobId)
        );
        return def?.job_name ?? t('job_analysis_pages.common.job_fallback', { id: jobId });
    };

    const getInitials = (name: string) => {
        return name
            .split(/\s+/)
            .map((s) => s[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const jobNameMatchesFinance = (name: string) => {
        const n = name.toLowerCase();
        return (
            n.includes('accounting') ||
            n.includes('finance') ||
            name.includes(t('job_analysis_pages.step5.finance_kw')) ||
            name.includes(t('job_analysis_pages.step5.accounting_kw'))
        );
    };

    const getJobIcon = (jobId: number) => {
        const name = getJobName(jobId);
        const nl = name.toLowerCase();
        if (jobNameMatchesFinance(name)) return <BarChart3 className="w-3.5 h-3.5 text-white shrink-0" />;
        if (nl.includes('treasury') || name.includes(t('job_analysis_pages.step5.treasury_kw'))) return <Coins className="w-3.5 h-3.5 text-white shrink-0" />;
        if (nl.includes('hr') || name.includes(t('job_analysis_pages.step5.hr_kw'))) return <Users className="w-3.5 h-3.5 text-white shrink-0" />;
        if (nl.includes('clinical') || name.includes(t('job_analysis_pages.step5.clinical_kw'))) return <Building2 className="w-3.5 h-3.5 text-white shrink-0" />;
        return <Briefcase className="w-3.5 h-3.5 text-white shrink-0" />;
    };

    const JobIconForList = ({ jobId }: { jobId: number }) => {
        const name = getJobName(jobId);
        const nl = name.toLowerCase();
        if (jobNameMatchesFinance(name)) return <BarChart3 className="h-4 w-4 shrink-0 text-[#6b7280] dark:text-slate-300" />;
        if (nl.includes('treasury') || name.includes(t('job_analysis_pages.step5.treasury_kw'))) return <Coins className="h-4 w-4 shrink-0 text-[#6b7280] dark:text-slate-300" />;
        if (nl.includes('hr') || name.includes(t('job_analysis_pages.step5.hr_kw'))) return <Users className="h-4 w-4 shrink-0 text-[#6b7280] dark:text-slate-300" />;
        if (nl.includes('clinical') || name.includes(t('job_analysis_pages.step5.clinical_kw'))) return <Building2 className="h-4 w-4 shrink-0 text-[#6b7280] dark:text-slate-300" />;
        return <Briefcase className="h-4 w-4 shrink-0 text-[#6b7280] dark:text-slate-300" />;
    };

    return (
        <div className="min-h-full flex flex-col bg-[#f9f7f2] text-[#121431] dark:bg-slate-950 dark:text-slate-100">
            <div className="flex-1 min-h-0 max-w-[1200px] mx-auto w-full py-10 px-5 pb-8" style={{ padding: '0 20px' }}>
                <div className="mb-2 text-[11px] font-bold tracking-[1.2px] text-[#b88a44] dark:text-amber-300">
                    {t('job_analysis_pages.step5.stage')}
                </div>
                <h1 className="m-0 mb-3 text-3xl font-bold text-[#121431] dark:text-slate-100">
                    {t('job_analysis_pages.step5.title')}
                </h1>
                <p className="mb-6 max-w-[900px] text-[15px] leading-relaxed text-[#6b7280] dark:text-slate-300">
                    {t('job_analysis_pages.step5.intro')}
                </p>

                {validationError && (
                    <div
                        ref={validationBannerRef}
                        className="rounded-lg px-5 py-4 mb-6 text-white text-left"
                        style={{ background: '#dc2626' }}
                        role="alert"
                    >
                        <p className="font-bold text-[15px] m-0 mb-1">{t('job_analysis_pages.step5.validation_title')}</p>
                        <p className="text-[14px] m-0 font-normal opacity-95">{validationError}</p>
                        <p className="text-[13px] m-0 mt-2 opacity-90">{t('job_analysis_pages.step5.validation_hint')}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                    {/* Left: Organizational Units — white card container */}
                    <div
                        className="flex max-h-[min(70vh,600px)] flex-col rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxHeight: 'min(70vh, 600px)' }}
                    >
                        <div className="flex items-center justify-between flex-wrap flex-wrap gap-3 mb-5 shrink-0">
                            <div className="flex items-center gap-2">
                                <FolderTree className="w-5 h-5 text-[#48b082]" aria-hidden />
                                <span className="text-[12px] font-bold uppercase tracking-wider text-[#121431] dark:text-slate-100">
                                    {t('job_analysis_pages.step5.org_units')}
                                </span>
                                <span className="text-[13px] text-[#9ca3af] dark:text-slate-400">
                                    {t('job_analysis_pages.step5.units_count', { count: orgUnits.length })}
                                </span>
                            </div>
                            <Button
                                onClick={handleAddOrgUnit}
                                className="rounded-lg bg-[#121431] hover:bg-[#1e2a4a] text-white text-[13px] font-semibold px-4 py-2 shadow-sm"
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                {t('job_analysis_pages.step5.add_unit')}
                            </Button>
                        </div>

                        <div
                            ref={unitsPanelScrollRef}
                            className="space-y-3 overflow-y-auto overflow-x-hidden pr-1 min-h-0 flex-1"
                        >
                            {orgUnits.length === 0 && (
                                <div className="rounded-xl border-2 border-dashed border-[#e5e7eb] bg-[#faf9f7] p-8 text-center text-[13px] text-[#6b7280] dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                                    {t('job_analysis_pages.step5.empty_units')}
                                </div>
                            )}
                            {buildTreeOrder(orgUnits).map((unit, index) => {
                                const isExpanded = expandedUnits.has(unit.id);
                                const jobCount = unit.job_keyword_ids.length;
                                const depth = unit.depth ?? 0;
                                const isChild = depth > 0;
                                const canDropUnit = draggedUnitId && draggedUnitId !== unit.id && (() => {
                                    const a = orgUnits.find((u) => u.id === draggedUnitId);
                                    return a && (a.parentId ?? null) === (unit.parentId ?? null);
                                })();
                                return (
                                    <div
                                        key={unit.id}
                                        className={cn(
                                            'rounded-xl border overflow-hidden transition-shadow',
                                            'border-[#e5e7eb] dark:border-slate-700',
                                            isChild && 'relative border-l-2 border-[#e5e7eb] bg-[#f0f7ff] dark:border-l-sky-700 dark:bg-slate-800/60',
                                            !isChild && 'bg-[#f5f3ef] dark:bg-slate-900',
                                            depth === 1 && 'pl-4',
                                            depth === 2 && 'pl-4',
                                            canDropUnit && 'ring-2 ring-[#121431] ring-offset-2'
                                        )}
                                        style={{
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                            marginLeft: isChild ? 32 : 0,
                                            borderLeftColor: isChild ? '#93c5fd' : undefined,
                                            borderLeftWidth: isChild ? 3 : undefined,
                                        }}
                                        onDragOver={(e) => handleUnitDragOver(e, unit.id)}
                                        onDrop={(e) => handleUnitDrop(e, unit.id)}
                                    >
                                        <div
                                            className="cursor-pointer hover:bg-[#efece8] dark:hover:bg-slate-800/60 flex items-center gap-2 px-4 py-3.5"
                                            onClick={() => toggleUnit(unit.id)}
                                        >
                                            <div
                                                draggable
                                                onDragStart={(e) => handleUnitDragStart(e, unit.id)}
                                                onDragEnd={handleUnitDragEnd}
                                                className="shrink-0 cursor-grab rounded p-1 hover:bg-[#e5e7eb]/60 active:cursor-grabbing dark:hover:bg-slate-700/60"
                                                title={t('job_analysis_pages.step5.drag_reorder')}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <GripVertical className="h-4 w-4 text-[#64748b] dark:text-slate-400" />
                                            </div>
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4 shrink-0 text-[#64748b] dark:text-slate-400" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 shrink-0 text-[#64748b] dark:text-slate-400" />
                                            )}
                                            <Folder className="h-4 w-4 shrink-0 text-[#1e40af] dark:text-sky-300" />
                                            <Input
                                                value={unit.org_unit_name ?? ''}
                                                onChange={(e) =>
                                                    handleUpdateOrgUnit(unit.id, { org_unit_name: e.target.value })
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder={t('job_analysis_pages.step5.unit_name_placeholder')}
                                                className={cn(
                                                    'h-auto min-w-0 flex-1 rounded bg-transparent py-0 text-[14px] font-semibold text-[#121431] transition-colors focus-visible:ring-0 dark:text-slate-100',
                                                    emptyUnitIds.has(unit.id) || fieldErrors[`unit-${unit.id}`]
                                                        ? 'border-2 border-red-500 shadow-none'
                                                        : 'border-0 shadow-none'
                                                )}
                                            />
                                            <span className="shrink-0 text-[13px] text-[#9ca3af] dark:text-slate-400">
                                                {t('job_analysis_pages.step5.jobs_count', { count: jobCount })}
                                            </span>
                                        </div>
                                        <div className="px-4 pb-1">
                                            <FieldErrorMessage fieldKey={`unit-${unit.id}`} errors={fieldErrors} />
                                        </div>

                                        {isExpanded && (
                                            <div className="space-y-4 border-t border-[#e5e7eb] px-4 pb-4 pt-0 dark:border-slate-700">
                                                {/* Remove unit button + Unit head */}
                                                <div className="flex items-center gap-3 rounded-lg bg-[#faf9f7] p-3 pt-3 dark:bg-slate-800/60">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="h-10 border-red-200 text-red-600 hover:bg-red-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveUnit(unit.id);
                                                        }}
                                                    >
                                                        {t('job_analysis_pages.step5.delete')}
                                                    </Button>
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
                                                            placeholder={t('job_analysis_pages.step5.placeholder_name')}
                                                            className="h-9 rounded-lg border-[#e5e7eb] bg-white text-[13px] font-semibold dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                                                        />
                                                        <Input
                                                            value={unit.org_head_title || ''}
                                                            onChange={(e) =>
                                                                handleUpdateOrgUnit(unit.id, { org_head_title: e.target.value })
                                                            }
                                                            placeholder={t('job_analysis_pages.step5.placeholder_title')}
                                                            className="h-9 rounded-lg border-[#e5e7eb] bg-white text-[13px] text-[#6b7280] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                                        />
                                                        <Input
                                                            value={unit.org_head_rank || ''}
                                                            onChange={(e) =>
                                                                handleUpdateOrgUnit(unit.id, { org_head_rank: e.target.value })
                                                            }
                                                            placeholder={t('job_analysis_pages.step5.placeholder_rank')}
                                                            className="h-9 rounded-lg border-[#e5e7eb] bg-white text-[13px] text-[#6b7280] sm:col-span-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                                        />
                                                        <div className="flex items-center gap-2 sm:col-span-2">
                                                            <input
                                                                type="checkbox"
                                                                id={`kpi-reviewer-${unit.id}`}
                                                                checked={!!unit.is_kpi_reviewer}
                                                                onChange={(e) =>
                                                                    handleUpdateOrgUnit(unit.id, {
                                                                        is_kpi_reviewer: e.target.checked,
                                                                        ...(e.target.checked ? {} : { org_head_email: '' }),
                                                                    })
                                                                }
                                                                className="h-4 w-4 rounded border-[#e5e7eb] text-[#121431] focus:ring-[#121431]"
                                                            />
                                                            <label htmlFor={`kpi-reviewer-${unit.id}`} className="text-[13px] font-medium text-[#121431] dark:text-slate-200">
                                                                {t('job_analysis_pages.step5.kpi_reviewer')}
                                                            </label>
                                                        </div>
                                                        {unit.is_kpi_reviewer && (
                                                            <Input
                                                                value={unit.org_head_email || ''}
                                                                onChange={(e) =>
                                                                    handleUpdateOrgUnit(unit.id, { org_head_email: e.target.value })
                                                                }
                                                                placeholder={t('job_analysis_pages.step5.placeholder_email')}
                                                                type="email"
                                                                className="h-9 rounded-lg border-[#e5e7eb] bg-white text-[13px] text-[#6b7280] sm:col-span-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Drop zone — dotted rectangle */}
                                                <div
                                                    className={cn(
                                                        'min-h-[64px] rounded-lg p-4 transition-colors flex flex-wrap items-center gap-2',
                                                        draggedJobId
                                                            ? 'border-2 border-dashed border-[#121431] bg-[#121431]/5 dark:border-slate-500 dark:bg-slate-800/70'
                                                            : 'border-2 border-dashed border-[#d1d5db] bg-[#fafafa] dark:border-slate-600 dark:bg-slate-800/50'
                                                    )}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, unit.id)}
                                                >
                                                    {jobCount === 0 ? (
                                                        <p className="w-full py-0 text-center text-[13px] text-[#9ca3af] dark:text-slate-400">
                                                            {t('job_analysis_pages.step5.drop_jobs')}
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
                                                                    aria-label={t('job_analysis_pages.step5.remove_job_aria', { name: getJobName(jobId) })}
                                                                >
                                                                    <X className="w-3 h-3 text-white" />
                                                                </button>
                                                            </span>
                                                        ))
                                                    )}
                                                </div>

                                                {(unit.depth ?? 0) < MAX_DEPTH && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddSubUnit(unit.id);
                                                        }}
                                                        className="flex items-center gap-1.5 text-[13px] font-medium text-[#6b7280] hover:text-[#121431] hover:underline dark:text-slate-400 dark:hover:text-slate-100"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        {t('job_analysis_pages.step5.add_sub_unit')}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Finalized Jobs + Progress */}
                    <div className="space-y-4 sticky top-4 self-start">
                        <div
                            className="rounded-xl border border-[#e5e7eb] bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
                        >
                            <div className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#121431] dark:text-slate-100">
                                <Briefcase className="h-4 w-4 text-[#121431] dark:text-slate-100" />
                                {t('job_analysis_pages.step5.finalized_jobs')}
                            </div>
                            {allJobIds.length === 0 ? (
                                <p className="py-4 text-center text-[13px] text-[#6b7280] dark:text-slate-300">
                                    {t('job_analysis_pages.step5.no_finalized_jobs')}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {allJobIds.map((jobId) => (
                                        <div
                                            key={jobId}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, jobId)}
                                            onDragEnd={handleDragEnd}
                                            className="flex cursor-move items-center gap-2 rounded-lg border border-[#e5e7eb] bg-[#faf9f7] p-2.5 text-[13px] font-medium text-[#121431] hover:border-[#121431]/30 hover:bg-[#121431]/5 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-800"
                                        >
                                            <JobIconForList jobId={jobId} />
                                            {getJobName(jobId)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* FINALIZED JOBS progress — slightly darker beige card */}
                        <div className="rounded-xl border border-[#e5e7eb] bg-[#f5f3ef] p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
                                <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#121431] dark:text-slate-100">
                                    <Briefcase className="h-4 w-4 text-[#121431] dark:text-slate-100" />
                                    {t('job_analysis_pages.step5.finalized_jobs_progress')}
                                </span>
                                <span className="text-[13px] font-medium" style={{ color: '#48b082' }}>
                                    {t('job_analysis_pages.step5.mapped_progress', { mapped: mappedCount, total: totalJobs })}
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[#e5e7eb] dark:bg-slate-700">
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
                                            <span className={cn('flex-1', mapped ? 'font-medium text-[#121431] dark:text-slate-100' : 'text-[#6b7280] dark:text-slate-400')}>
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
                className="sticky bottom-0 z-10 flex w-full flex-wrap items-center justify-between gap-4 border-t border-[#e0ddd5] bg-white px-6 py-[18px] md:px-[60px] dark:border-slate-700 dark:bg-slate-900"
                style={{
                    boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
                }}
            >
                <p className="text-[13px] font-medium text-[#94a3b8] dark:text-slate-400">
                    {t('job_analysis_pages.step5.footer_units', { count: orgUnits.length })}
                    {' · '}
                    {t('job_analysis_pages.step5.footer_mapped', { mapped: mappedCount, total: totalJobs })}
                </p>
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="rounded-lg border-[#e0ddd5] px-8 py-6 font-bold dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    >
                        {t('job_analysis_pages.step5.back')}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            const empty = orgUnits.filter((u) => !String(u.org_unit_name ?? '').trim());
                            if (empty.length > 0) {
                                setEmptyUnitIds(new Set(empty.map((u) => u.id)));
                                setValidationError(t('job_analysis_pages.step5.validation_unit_names'));
                                setExpandedUnits((prev) => new Set([...prev, ...empty.map((u) => u.id)]));
                                return;
                            }
                            setEmptyUnitIds(new Set());
                            setValidationError(null);
                            onContinue(orgUnits);
                        }}
                        className="bg-[#1a1a3d] hover:bg-[#2d2d5c] text-white font-bold px-9 py-6 rounded-lg"
                    >
                        {t('job_analysis_pages.step5.continue_review')}
                    </Button>
                </div>
            </footer>
        </div>
    );
}
