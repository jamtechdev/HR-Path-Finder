import { DiagnosisFieldErrorMessage } from '@/components/Diagnosis/DiagnosisFieldErrorsContext';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { useDiagnosisDraftHydrate } from '@/hooks/useDiagnosisDraftHydrate';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { Info, Plus } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const DragHandleIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
        <circle cx="9" cy="5" r="1.3" fill="#9AA3B2" />
        <circle cx="15" cy="5" r="1.3" fill="#9AA3B2" />
        <circle cx="9" cy="12" r="1.3" fill="#9AA3B2" />
        <circle cx="15" cy="12" r="1.3" fill="#9AA3B2" />
        <circle cx="9" cy="19" r="1.3" fill="#9AA3B2" />
        <circle cx="15" cy="19" r="1.3" fill="#9AA3B2" />
    </svg>
);

interface Diagnosis {
    id: number;
    present_headcount?: number | null;
    job_grade_names?: string[];
    promotion_years?: Record<string, number | null>;
    job_grade_headcounts?: Record<string, number>;
    job_grade_expected_roles?: Record<string, string>;
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

interface JobGrade {
    id: string;
    name: string;
    years: number;
    noFixed: boolean;
    count: number;
    role: string;
}

const DEFAULT_GRADES: Array<{ name: string; years: number; role: string }> = [
    {
        name: '사원',
        years: 3,
        role: '주어진 업무를 성실히 수행하며, 기초적인 실무 기술을 습득하고 조직 적응에 집중함.',
    },
    {
        name: '대리',
        years: 4,
        role: '담당 업무에 대해 능숙적인 수행 능력을 갖추며, 실무의 효율성을 개선하고 사수로서 후배를 지도함.',
    },
    {
        name: '과장',
        years: 5,
        role: '단위 프로젝트나 파트를 책임지며, 문제 해결 능력을 바탕으로 실질적인 성과를 창출하고 유관 부서와 협업함.',
    },
    {
        name: '차장',
        years: 6,
        role: '팀의 중추적인 역할을 하며, 상위 전략을 실행 계획으로 구체화하고 주도적으로 변화와 혁신을 이끔.',
    },
    {
        name: '부장',
        years: 7,
        role: '조직의 전략적 방향성을 제시하며, 팀 전체의 성과를 관리하고 차세대 리더를 육성하는 매니지먼트에 집중함.',
    },
];

function buildGradesFromDiagnosis(diagnosis?: Diagnosis | null): JobGrade[] {
    if (!diagnosis?.job_grade_names?.length) {
        return DEFAULT_GRADES.map((g, i) => ({
            id: `g${i + 1}`,
            name: g.name,
            years: g.years,
            noFixed: false,
            count: 0,
            role: g.role,
        }));
    }

    const headcounts = diagnosis.job_grade_headcounts ?? {};
    const expectedRoles = diagnosis.job_grade_expected_roles ?? {};
    const promotionYears = diagnosis.promotion_years ?? {};

    return diagnosis.job_grade_names.map((name, index) => {
        const fromDefault =
            DEFAULT_GRADES.find((d) => d.name === name) ??
            DEFAULT_GRADES[index % DEFAULT_GRADES.length];
        const yearsVal = promotionYears[name];
        const noPeriod =
            yearsVal === null || yearsVal === undefined || yearsVal === '';

        const toInt = (v: unknown): number | null => {
            if (typeof v === 'number') return Number.isFinite(v) ? v : null;
            if (typeof v === 'string') {
                const parsed = parseInt(v, 10);
                return Number.isFinite(parsed) ? parsed : null;
            }
            return null;
        };

        return {
            id: `g${index}-${name}`,
            name,
            years: noPeriod
                ? fromDefault.years
                : (toInt(yearsVal) ?? fromDefault.years),
            noFixed: noPeriod,
            count: toInt(headcounts[name]) ?? 0,
            role: expectedRoles[name] ?? fromDefault.role,
        };
    });
}

const GRADE_GRID = '28px 44px 100px 180px 120px minmax(120px,3.5fr) 36px';

export default function JobGrades({
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

    const [grades, setGrades] = useState<JobGrade[]>(() =>
        buildGradesFromDiagnosis(diagnosis),
    );
    const [workforceTotal, setWorkforceTotal] = useState(
        diagnosis?.present_headcount ?? 100,
    );
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<{
        id: string;
        top: boolean;
    } | null>(null);
    const [hasInteracted, setHasInteracted] = useState(false);
    const idSeqRef = useRef(grades.length + 1);
    const dragSourceIdRef = useRef<string | null>(null);

    const internalForm = useForm({
        job_grade_names: [] as string[],
        promotion_years: {} as Record<string, number | null>,
        job_grade_headcounts: {} as Record<string, number>,
        job_grade_expected_roles: {} as Record<string, string>,
    });

    const useEmbed = embedMode && embedData != null && embedSetData;
    const { errors: jobGradesErrors } = internalForm;
    const rawJgErr = jobGradesErrors.job_grade_names;
    const inertiaJobGradeNamesErr =
        typeof rawJgErr === 'string'
            ? rawJgErr
            : Array.isArray(rawJgErr) && rawJgErr[0]
              ? String(rawJgErr[0])
              : undefined;

    // Hydrate from draft
    useDiagnosisDraftHydrate(
        projectId,
        'job-grades',
        (patch) => {
            const ui = (patch.__draft_job_grades as any) ?? null;
            if (!ui || typeof ui !== 'object') return;
            if (Array.isArray(ui.grades)) setGrades(ui.grades);
            if (typeof ui.workforceTotal === 'number')
                setWorkforceTotal(ui.workforceTotal);
        },
        { enabled: !embedMode && !readOnly },
    );

    useEffect(() => {
        const ph = diagnosis?.present_headcount;
        if (typeof ph === 'number' && ph > 0 && !embedMode) {
            setWorkforceTotal(ph);
        }
    }, [diagnosis?.present_headcount, embedMode]);

    // Sync form data
    useEffect(() => {
        const names = grades.map((g) => g.name).filter(Boolean);
        const years: Record<string, number | null> = {};
        const headcounts: Record<string, number> = {};
        const expectedRoles: Record<string, string> = {};

        grades.forEach((g) => {
            if (g.name) {
                years[g.name] = g.noFixed ? null : g.years;
                headcounts[g.name] = g.count;
                if (g.role?.trim()) expectedRoles[g.name] = g.role;
            }
        });

        const payload = {
            job_grade_names: names,
            promotion_years: years,
            job_grade_headcounts: headcounts,
            job_grade_expected_roles: expectedRoles,
        };

        if (useEmbed) {
            embedSetData('job_grade_names', payload.job_grade_names);
            embedSetData('promotion_years', payload.promotion_years);
            embedSetData('job_grade_headcounts', payload.job_grade_headcounts);
            embedSetData(
                'job_grade_expected_roles',
                payload.job_grade_expected_roles,
            );
            return;
        }

        internalForm.setData(payload);
    }, [grades, useEmbed, embedSetData]);

    // Save draft
    useEffect(() => {
        if (!projectId || embedMode || readOnly) return;
        (internalForm as any).setData('__draft_job_grades', {
            grades,
            workforceTotal,
        });
    }, [projectId, embedMode, readOnly, grades, workforceTotal]);

    const totalHc = grades.reduce((s, g) => s + (g.count || 0), 0);
    const ratioPct =
        workforceTotal > 0 && totalHc > 0
            ? Math.min(100, Math.round((totalHc / workforceTotal) * 100))
            : 0;
    const barPct =
        workforceTotal > 0
            ? Math.min(100, (totalHc / workforceTotal) * 100)
            : 0;

    const addGrade = useCallback(() => {
        setHasInteracted(true);
        const id = `g${idSeqRef.current++}`;
        setGrades((prev) => [
            ...prev,
            { id, name: '', years: 3, noFixed: false, count: 0, role: '' },
        ]);
    }, []);

    const removeGrade = useCallback((id: string) => {
        setHasInteracted(true);
        setGrades((prev) => prev.filter((g) => g.id !== id));
    }, []);

    const distributeHeadcountEvenly = useCallback(() => {
        setHasInteracted(true);
        setGrades((prev) => {
            if (prev.length === 0 || workforceTotal <= 0) return prev;
            const n = prev.length;
            const base = Math.floor(workforceTotal / n);
            let rem = workforceTotal - base * n;
            return prev.map((g) => {
                let c = base;
                if (rem > 0) {
                    c += 1;
                    rem -= 1;
                }
                return { ...g, count: c };
            });
        });
    }, [workforceTotal]);

    const updateGrade = useCallback(
        (id: string, updates: Partial<JobGrade>) => {
            setHasInteracted(true);
            setGrades((prev) =>
                prev.map((g) => {
                    if (g.id !== id) return g;
                    const next = { ...g, ...updates };
                    if (updates.noFixed !== undefined && next.noFixed)
                        next.years = 3;
                    return next;
                }),
            );
        },
        [],
    );

    // Drag & Drop handlers (kept same logic)
    const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
        dragSourceIdRef.current = id;
        setDraggingId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        const img = new Image();
        img.src =
            'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    }, []);

    const handleDragEnd = useCallback(() => {
        dragSourceIdRef.current = null;
        setDraggingId(null);
        setDropTarget(null);
    }, []);

    const handleDragOver = useCallback(
        (e: React.DragEvent, id: string) => {
            e.preventDefault();
            if (draggingId === id) return;
            const rect = (
                e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            setDropTarget({ id, top: e.clientY < rect.top + rect.height / 2 });
        },
        [draggingId],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent, targetId: string) => {
            e.preventDefault();
            e.stopPropagation();
            const srcId =
                e.dataTransfer.getData('text/plain') ||
                dragSourceIdRef.current ||
                draggingId;
            const rect = (
                e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            const insertBefore = rect
                ? e.clientY < rect.top + rect.height / 2
                : false;

            if (!srcId || srcId === targetId) {
                setDraggingId(null);
                setDropTarget(null);
                return;
            }

            setGrades((prev) => {
                const fromIndex = prev.findIndex((g) => g.id === srcId);
                const toIndex = prev.findIndex((g) => g.id === targetId);
                if (fromIndex === -1 || toIndex === -1) return prev;

                const insertIndex = insertBefore ? toIndex : toIndex + 1;
                const next = [...prev];
                const [removed] = next.splice(fromIndex, 1);
                const insertAt = Math.max(
                    0,
                    Math.min(
                        next.length,
                        insertIndex > fromIndex ? insertIndex - 1 : insertIndex,
                    ),
                );
                next.splice(insertAt, 0, removed);
                return next;
            });

            setDraggingId(null);
            setDropTarget(null);
        },
        [draggingId],
    );

    const isReadOnlyStatus = ['submitted', 'approved', 'locked'].includes(
        diagnosisStatus,
    );
    const isReadOnly = readOnly || isReadOnlyStatus;

    const headcountMismatch = workforceTotal > 0 && totalHc !== workforceTotal;

    const statusAlert = (() => {
        if (workforceTotal === 0 || totalHc === 0) {
            return {
                type: 'idle' as const,
                msg: t('diagnosis_job_grades.statusIdle'),
            };
        }
        if (totalHc < workforceTotal) {
            return {
                type: 'warn' as const,
                msg: `${totalHc} / ${workforceTotal} — ${t('diagnosis_job_grades.statusUnder')}`,
            };
        }
        if (totalHc > workforceTotal) {
            return {
                type: 'warn' as const,
                msg: `${totalHc} / ${workforceTotal} — ${t('diagnosis_job_grades.statusOver')}`,
            };
        }
        return {
            type: 'ok' as const,
            msg: `✓ ${totalHc}${t('diagnosis_job_grades.unit')} — ${t('diagnosis_job_grades.statusMatch')}`,
        };
    })();

    const innerContent = (
        <div className="space-y-5">
            <div className="mb-3 flex items-center gap-2">
                <span className="text-[11.5px] font-bold tracking-[0.7px] text-[#9AA3B2] uppercase">
                    {t('diagnosis_job_grades.sectionTitle')}
                </span>
                <span className="h-px flex-1 bg-[#E2E6ED]" />
            </div>

            <div className="overflow-hidden rounded-[14px] border border-[#E2E6ED] bg-white shadow-[0_4px_20px_rgba(27,43,91,0.09)]">
                {/* Hero Strip */}
                <div className="flex flex-col gap-3 bg-gradient-to-br from-[#1B2B5B] to-[#243877] px-7 py-5 sm:flex-row sm:items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#2EC4A9] sm:h-11 sm:w-11">
                        <svg
                            className="h-5 w-5 sm:h-[22px] sm:w-[22px]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                        >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M9 9h6M9 12h6M9 15h4" />
                        </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-base leading-tight font-bold text-white sm:text-[15px]">
                            {t('diagnosis_job_grades.title')}
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-white/55 sm:text-[12px]">
                            {t('diagnosis_job_grades.heroDesc')}
                        </p>
                    </div>
                    <div className="ml-auto flex items-stretch gap-2">
                        <div className="flex min-w-[64px] flex-col justify-center rounded-lg bg-white/10 px-3.5 py-1.5 text-center">
                            <div className="text-[22px] leading-none font-extrabold text-white">
                                {grades.length}
                            </div>
                            <div className="mt-0.5 text-[10px] text-white/50">
                                {t('diagnosis_job_grades.gradeCount')}
                            </div>
                        </div>
                        <div className="flex min-w-[64px] flex-col justify-center rounded-lg bg-white/10 px-3.5 py-1.5 text-center">
                            <div className="text-[22px] leading-none font-extrabold text-white">
                                {totalHc}
                            </div>
                            <div className="mt-0.5 text-[10px] text-white/50">
                                {t('diagnosis_job_grades.totalHeadcount')}
                            </div>
                        </div>
                        <div className="my-1 w-px bg-white/10" />
                        <div className="flex min-w-[80px] flex-col justify-center rounded-lg border border-[rgba(46,196,169,0.35)] bg-[rgba(46,196,169,0.18)] px-3.5 py-1.5 text-center">
                            <div className="text-[22px] leading-none font-extrabold text-[#2EC4A9]">
                                {workforceTotal > 0 && totalHc > 0
                                    ? `${ratioPct}%`
                                    : '—'}
                            </div>
                            <div className="mt-0.5 text-[10px] text-white/50">
                                {t('diagnosis_job_grades.ratio')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col flex-wrap gap-2.5 border-b border-[#F0F2F5] px-7 py-3.5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-[7px] rounded-lg bg-[#F0F2F5] px-3 py-1.5 text-[12px] text-[#6B7585]">
                        <svg
                            className="h-[13px] w-[13px] shrink-0 text-[#9AA3B2]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <circle cx="9" cy="7" r="4" />
                            <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                        </svg>
                        <span>{t('diagnosis_job_grades.workforceLabel')}</span>
                        <input
                            type="number"
                            min={1}
                            value={workforceTotal}
                            onChange={(e) => {
                                setHasInteracted(true);
                                setWorkforceTotal(
                                    parseInt(e.target.value, 10) || 0,
                                );
                            }}
                            className="h-[26px] w-16 rounded-[5px] border-[1.5px] border-[#E2E6ED] px-2 text-center text-[13px] font-bold text-[#1B2B5B] outline-none focus:border-[#2EC4A9]"
                        />
                        <span>{t('diagnosis_job_grades.unit')}</span>
                    </div>

                    <span className="text-[12px] text-[#9AA3B2]">
                        {t('diagnosis_job_grades.toolbarHint')}
                    </span>

                    <button
                        type="button"
                        onClick={distributeHeadcountEvenly}
                        disabled={
                            isReadOnly ||
                            workforceTotal <= 0 ||
                            grades.length === 0
                        }
                        className="rounded-lg border border-[#E2E6ED] bg-white px-[14px] py-[9px] text-[13px] font-bold text-[#1B2B5B] hover:bg-[#F8F9FB] disabled:pointer-events-none disabled:opacity-50"
                    >
                        {t('diagnosis_job_grades.distributeEvenly')}
                    </button>

                    <button
                        type="button"
                        onClick={addGrade}
                        disabled={isReadOnly}
                        className="ml-auto flex items-center gap-[7px] rounded-lg bg-[#1B2B5B] px-[18px] py-[9px] text-[13px] font-bold text-white shadow-[0_2px_6px_rgba(27,43,91,0.18)] transition-all hover:-translate-y-px hover:bg-[#243570] disabled:pointer-events-none disabled:opacity-50"
                    >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                        {t('diagnosis_job_grades.addGrade')}
                    </button>
                </div>

                <div className="px-7 pt-1">
                    <DiagnosisFieldErrorMessage
                        fieldKey="job_grade_names"
                        inertiaError={inertiaJobGradeNamesErr}
                    />
                </div>
                
                 <div className='overflow-x-auto'>       
                {/* Table Header */}
                <div
                    className="grid items-center gap-x-3 border-b border-[#E2E6ED] bg-[#F8F9FB] px-7 py-[9px] text-[11px] font-bold tracking-[0.4px] text-[#9AA3B2] uppercase"
                    style={{ gridTemplateColumns: GRADE_GRID }}
                >
                    <div />
                    <div />
                    <div>
                        {t('diagnosis_job_grades.gradeName')}{' '}
                        <span className="mt-0.5 block text-[10px] font-normal text-[#CBD0DA]">
                            GRADE NAME
                        </span>
                    </div>
                    <div>
                        {t('diagnosis_job_grades.promotionPeriod')}{' '}
                        <span className="mt-0.5 block text-[10px] font-normal text-[#CBD0DA]">
                            PROMOTION PERIOD
                        </span>
                    </div>
                    <div>
                        {t('diagnosis_job_grades.headcount')}{' '}
                        <span className="mt-0.5 block text-[10px] font-normal text-[#CBD0DA]">
                            HEADCOUNT
                        </span>
                    </div>
                    <div>{t('diagnosis_job_grades.expectedRole')}</div>
                    <div />
                </div>

                {/* Grade Rows */}
                <div className="divide-y divide-[#F0F2F5]">
                    {grades.map((g, index) => (
                        <div
                            key={g.id}
                            onDragOver={(e) => handleDragOver(e, g.id)}
                            onDragLeave={() => setDropTarget(null)}
                            onDrop={(e) => handleDrop(e, g.id)}
                            className={cn(
                                'grid items-start gap-x-3 border-b border-transparent px-7 py-3.5 transition-colors last:border-b-0 hover:bg-[#F8F9FB]',
                                draggingId === g.id &&
                                    'bg-[#F0F2F5] opacity-35',
                                dropTarget?.id === g.id &&
                                    dropTarget.top &&
                                    '!border-t-[2.5px] !border-t-[#2EC4A9]',
                                dropTarget?.id === g.id &&
                                    !dropTarget.top &&
                                    '!border-b-[2.5px] !border-b-[#2EC4A9]',
                            )}
                            style={{ gridTemplateColumns: GRADE_GRID }}
                        >
                            {/* Drag Handle */}
                            <div
                                draggable={!isReadOnly}
                                onDragStart={(e) => handleDragStart(e, g.id)}
                                onDragEnd={handleDragEnd}
                                className="flex h-9 w-5 shrink-0 cursor-grab touch-none items-center justify-center self-center text-[#CBD0DA] hover:text-[#6B7585] active:cursor-grabbing"
                            >
                                <DragHandleIcon />
                            </div>

                            {/* Row Number */}
                            <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center self-center rounded-lg text-[12px] font-extrabold text-white"
                                style={{
                                    background: `hsl(${220 - index * 18},55%,30%)`,
                                }}
                            >
                                {index + 1}
                            </div>

                            {/* Grade Name */}
                            <div>
                                <input
                                    type="text"
                                    value={g.name}
                                    onChange={(e) =>
                                        updateGrade(g.id, {
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder={t(
                                        'diagnosis_job_grades.gradeNamePlaceholder',
                                    )}
                                    disabled={isReadOnly}
                                    className="h-[38px] w-full rounded-lg border-[1.5px] border-[#E2E6ED] px-3 text-[15px] font-bold text-[#1B2B5B] outline-none placeholder:text-[#CBD0DA] focus:border-[#2EC4A9] focus:ring-[3px] focus:ring-[rgba(46,196,169,0.12)]"
                                />
                            </div>

                            {/* Promotion Period */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="number"
                                        min={1}
                                        max={30}
                                        value={g.noFixed ? '' : g.years}
                                        onChange={(e) =>
                                            updateGrade(g.id, {
                                                years:
                                                    parseInt(
                                                        e.target.value,
                                                        10,
                                                    ) || 1,
                                                noFixed: false,
                                            })
                                        }
                                        disabled={isReadOnly || g.noFixed}
                                        className="h-[34px] w-[52px] rounded-lg border-[1.5px] border-[#E2E6ED] px-2 text-center text-[14px] font-bold text-[#1B2B5B] outline-none focus:border-[#2EC4A9] disabled:bg-[#F0F2F5]"
                                    />
                                    <span className="text-[12px] font-medium text-[#9AA3B2]">
                                        {t('diagnosis_job_grades.years')}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        !isReadOnly &&
                                        updateGrade(g.id, {
                                            noFixed: !g.noFixed,
                                        })
                                    }
                                    disabled={isReadOnly}
                                    className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#6B7585]"
                                >
                                    <div
                                        className={cn(
                                            'relative h-[18px] w-8 rounded-[20px] transition-colors',
                                            g.noFixed
                                                ? 'bg-[#2EC4A9]'
                                                : 'bg-[#E2E6ED]',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'absolute top-[2px] h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
                                                g.noFixed
                                                    ? 'left-[18px]'
                                                    : 'left-[2px]',
                                            )}
                                        />
                                    </div>
                                    {t('diagnosis_job_grades.noFixedPeriod')}
                                </button>
                            </div>

                            {/* Headcount */}
                            <div className="flex w-full items-center overflow-hidden rounded-lg border-[1.5px] border-[#E2E6ED] bg-white">
                                <button
                                    type="button"
                                    onClick={() =>
                                        updateGrade(g.id, {
                                            count: Math.max(0, g.count - 1),
                                        })
                                    }
                                    disabled={isReadOnly}
                                    className="flex h-[34px] w-[28px] items-center justify-center bg-[#F8F9FB] text-[15px] font-bold text-[#6B7585] hover:bg-[#E6F9F6] hover:text-[#25A891]"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    min={0}
                                    value={g.count || ''}
                                    onChange={(e) => {
                                        const parsed =
                                            parseInt(e.target.value, 10) || 0;
                                        const nextTotalWithoutThis =
                                            totalHc - (g.count || 0);
                                        const maxForThis = Math.max(
                                            0,
                                            workforceTotal -
                                                nextTotalWithoutThis,
                                        );
                                        updateGrade(g.id, {
                                            count: Math.min(parsed, maxForThis),
                                        });
                                    }}
                                    disabled={isReadOnly}
                                    className="flex-1 border-0 bg-transparent text-center text-[14px] font-extrabold text-[#1B2B5B] w-full"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const nextTotalWithoutThis =
                                            totalHc - (g.count || 0);
                                        const maxForThis = Math.max(
                                            0,
                                            workforceTotal -
                                                nextTotalWithoutThis,
                                        );
                                        updateGrade(g.id, {
                                            count: Math.min(
                                                (g.count || 0) + 1,
                                                maxForThis,
                                            ),
                                        });
                                    }}
                                    disabled={isReadOnly || workforceTotal <= 0}
                                    className="flex h-[34px] w-[28px] items-center justify-center bg-[#F8F9FB] text-[15px] font-bold text-[#6B7585] hover:bg-[#E6F9F6] hover:text-[#25A891]"
                                >
                                    +
                                </button>
                                <span className="flex h-[34px] w-[28px] items-center justify-center border-l border-[#E2E6ED] bg-[#F8F9FB] text-[10px] font-semibold text-[#9AA3B2]">
                                    {t('diagnosis_job_grades.unit')}
                                </span>
                            </div>

                            {/* Expected Role */}
                            <div>
                                <textarea
                                    value={g.role}
                                    onChange={(e) =>
                                        updateGrade(g.id, {
                                            role: e.target.value,
                                        })
                                    }
                                    placeholder={t(
                                        'diagnosis_job_grades.rolePlaceholder',
                                    )}
                                    disabled={isReadOnly}
                                    rows={3}
                                    className="min-h-[72px] w-full resize-y rounded-lg border-[1.5px] border-[#E2E6ED] px-3 py-2.5 text-[12.5px] leading-relaxed text-[#3A4356] outline-none focus:border-[#2EC4A9]"
                                />
                            </div>

                            {/* Remove Button */}
                            <div className="flex items-center justify-center self-center">
                                <button
                                    type="button"
                                    onClick={() => removeGrade(g.id)}
                                    disabled={isReadOnly}
                                    className="h-7 w-7 rounded-full border border-[#E2E6ED] bg-white text-[#9AA3B2] hover:border-[#E05252] hover:bg-[#E05252] hover:text-white"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                </div>


                {/* Footer */}
                <div className="space-y-2.5 border-t border-[#F0F2F5] px-7 pt-4 pb-5">
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="shrink-0 text-[13px] font-bold text-[#3A4356]">
                            {t('diagnosis_job_grades.totalHeadcountLabel')}
                        </span>
                        <div className="h-2 min-w-[120px] flex-1 overflow-hidden rounded-[20px] bg-[#F0F2F5]">
                            <div
                                className="h-full rounded-[20px] transition-all duration-300"
                                style={{
                                    width: `${barPct}%`,
                                    background:
                                        totalHc > workforceTotal
                                            ? 'linear-gradient(90deg,#E05252,#f87171)'
                                            : totalHc < workforceTotal &&
                                                totalHc > 0
                                              ? 'linear-gradient(90deg,#F59E0B,#FCD34D)'
                                              : 'linear-gradient(90deg,#2EC4A9,#3DD6BD)',
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#1B2B5B]">
                            <span className="text-[20px] font-extrabold">
                                {totalHc}
                            </span>
                            <span className="text-[12px] font-normal text-[#9AA3B2]">
                                / {workforceTotal}
                                {t('diagnosis_job_grades.unit')}
                            </span>
                        </div>
                    </div>

                    <div
                        className={cn(
                            'flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[12.5px] font-semibold',
                            statusAlert.type === 'ok' &&
                                'border border-[#B2EDE5] bg-[#E6F9F6] text-[#25A891]',
                            statusAlert.type === 'warn' &&
                                'border border-[#FECACA] bg-[#FEF2F2] text-[#E05252]',
                            statusAlert.type === 'idle' &&
                                'border border-[#E2E6ED] bg-[#F0F2F5] text-[#6B7585]',
                        )}
                    >
                        <Info className="h-4 w-4 shrink-0" />
                        <span>{statusAlert.msg}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    if (embedMode) return <>{innerContent}</>;

    return (
        <>
            <Head
                title={`Job Grades - ${company?.name || project?.company?.name || 'Company'}`}
            />
            <FormLayout
                title={t('diagnosis_job_grades.title')}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="leaders"
                nextRoute="organizational-charts"
                formData={{
                    present_headcount:
                        workforceTotal > 0 ? workforceTotal : undefined,
                    job_grade_names: grades.map((g) => g.name).filter(Boolean),
                    promotion_years: grades.reduce(
                        (acc, g) => {
                            if (g.name)
                                acc[g.name] = g.noFixed ? null : g.years;
                            return acc;
                        },
                        {} as Record<string, number | null>,
                    ),
                    job_grade_headcounts: grades.reduce(
                        (acc, g) => {
                            if (g.name) acc[g.name] = g.count;
                            return acc;
                        },
                        {} as Record<string, number>,
                    ),
                    job_grade_expected_roles: grades.reduce(
                        (acc, g) => {
                            if (g.name && g.role?.trim()) acc[g.name] = g.role;
                            return acc;
                        },
                        {} as Record<string, string>,
                    ),
                }}
                saveRoute={
                    projectId ? `/hr-manager/diagnosis/${projectId}` : undefined
                }
                hidePageTitle
                liveValidationError={
                    hasInteracted && headcountMismatch
                        ? t('diagnosis_job_grades.validationMismatch', {
                              totalHc,
                              workforceTotal,
                          })
                        : null
                }
                validateBeforeNext={() => {
                    if (headcountMismatch) {
                        return t('diagnosis_job_grades.validationMismatch', {
                            totalHc,
                            workforceTotal,
                        });
                    }
                    return true;
                }}
            >
                {innerContent}
            </FormLayout>
        </>
    );
}
