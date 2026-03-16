import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Plus, GripVertical, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    { name: '사원', years: 3, role: '주어진 업무를 성실히 수행하며, 기초적인 실무 기술을 습득하고 조직 적응에 집중함.' },
    { name: '대리', years: 4, role: '담당 업무에 대해 능숙적인 수행 능력을 갖추며, 실무의 효율성을 개선하고 사수로서 후배를 지도함.' },
    { name: '과장', years: 5, role: '단위 프로젝트나 파트를 책임지며, 문제 해결 능력을 바탕으로 실질적인 성과를 창출하고 유관 부서와 협업함.' },
    { name: '차장', years: 6, role: '팀의 중추적인 역할을 하며, 상위 전략을 실행 계획으로 구체화하고 주도적으로 변화와 혁신을 이끔.' },
    { name: '부장', years: 7, role: '조직의 전략적 방향성을 제시하며, 팀 전체의 성과를 관리하고 차세대 리더를 육성하는 매니지먼트에 집중함.' },
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
        const fromDefault = DEFAULT_GRADES.find((d) => d.name === name) ?? DEFAULT_GRADES[index % DEFAULT_GRADES.length];
        const yearsVal = promotionYears[name];
        const noPeriod = yearsVal === null || yearsVal === undefined;
        return {
            id: `g${index}-${name}`,
            name,
            years: noPeriod ? fromDefault.years : (typeof yearsVal === 'number' ? yearsVal : fromDefault.years),
            noFixed: noPeriod,
            count: typeof headcounts[name] === 'number' ? headcounts[name] : 0,
            role: expectedRoles[name] ?? fromDefault.role,
        };
    });
}

const GRID_COLS = '28px 44px 100px 180px 100px minmax(120px,3.5fr) 36px';

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
    const [grades, setGrades] = useState<JobGrade[]>(() => buildGradesFromDiagnosis(diagnosis));
    const [workforceTotal, setWorkforceTotal] = useState(diagnosis?.present_headcount ?? 100);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<{ id: string; top: boolean } | null>(null);
    const idSeqRef = useRef(grades.length + 1);

    const internalForm = useForm({
        job_grade_names: [] as string[],
        promotion_years: {} as Record<string, number | null>,
        job_grade_headcounts: {} as Record<string, number>,
        job_grade_expected_roles: {} as Record<string, string>,
    });
    const useEmbed = embedMode && embedData != null && embedSetData;
    const data = useEmbed ? { ...internalForm.data, ...embedData } as typeof internalForm.data : internalForm.data;
    const setData = useEmbed ? (k: string, v: unknown) => embedSetData(k, v) : internalForm.setData;

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
        setData({
            job_grade_names: names,
            promotion_years: years,
            job_grade_headcounts: headcounts,
            job_grade_expected_roles: expectedRoles,
        });
    }, [grades]);

    const totalHc = grades.reduce((s, g) => s + (g.count || 0), 0);
    const ratioPct = workforceTotal > 0 && totalHc > 0 ? Math.min(100, Math.round((totalHc / workforceTotal) * 100)) : 0;
    const barPct = workforceTotal > 0 ? Math.min(100, (totalHc / workforceTotal) * 100) : 0;

    const addGrade = useCallback(() => {
        const id = `g${idSeqRef.current++}`;
        setGrades((prev) => [...prev, { id, name: '', years: 3, noFixed: false, count: 0, role: '' }]);
    }, []);

    const removeGrade = useCallback((id: string) => {
        setGrades((prev) => prev.filter((g) => g.id !== id));
    }, []);

    const updateGrade = useCallback((id: string, updates: Partial<JobGrade>) => {
        setGrades((prev) =>
            prev.map((g) => {
                if (g.id !== id) return g;
                const next = { ...g, ...updates };
                if (updates.noFixed !== undefined && next.noFixed) next.years = 3;
                return next;
            })
        );
    }, []);

    const handleDragStart = useCallback((_e: React.DragEvent, id: string) => {
        setDraggingId(id);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggingId(null);
        setDropTarget(null);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
        e.preventDefault();
        if (draggingId === id) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setDropTarget({ id, top: e.clientY < rect.top + rect.height / 2 });
    }, [draggingId]);

    const handleDrop = useCallback(
        (e: React.DragEvent, targetId: string) => {
            e.preventDefault();
            if (!draggingId || draggingId === targetId) return;
            setGrades((prev) => {
                const fromIndex = prev.findIndex((g) => g.id === draggingId);
                const toIndex = prev.findIndex((g) => g.id === targetId);
                if (fromIndex === -1 || toIndex === -1) return prev;
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const insertIndex = e.clientY < rect.top + rect.height / 2 ? toIndex : toIndex + 1;
                const next = [...prev];
                const [removed] = next.splice(fromIndex, 1);
                const insertAt = insertIndex > fromIndex ? insertIndex - 1 : insertIndex;
                next.splice(insertAt, 0, removed);
                return next;
            });
            setDraggingId(null);
            setDropTarget(null);
        },
        [draggingId]
    );

    const statusAlert = (() => {
        if (workforceTotal === 0 || totalHc === 0) {
            return { type: 'idle' as const, msg: '인원수를 입력하면 Workforce 인원과 비교됩니다' };
        }
        if (totalHc < workforceTotal) {
            return { type: 'warn' as const, msg: `${totalHc} / ${workforceTotal} — Total headcount is less than workforce. Adjust headcount per grade.` };
        }
        if (totalHc > workforceTotal) {
            return { type: 'warn' as const, msg: `${totalHc} / ${workforceTotal} — Total headcount exceeds workforce. Please reduce.` };
        }
        return { type: 'ok' as const, msg: `✓ ${totalHc}명 — 전체 인원과 일치합니다` };
    })();

    const isReadOnlyStatus = diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
    const isReadOnly = readOnly || isReadOnlyStatus;

    const innerContent = (
        <div className="space-y-5">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-[11.5px] font-bold text-[#9AA3B2] uppercase tracking-widest">직급 체계 설정</span>
                <span className="flex-1 h-px bg-[#E2E6ED]" />
            </div>
            <div className="rounded-[14px] border border-[#E2E6ED] bg-white overflow-hidden shadow-[0_4px_20px_rgba(27,43,91,0.09)]">
            {/* Hero strip */}
            <div className="bg-gradient-to-br from-[#1B2B5B] to-[#243877] px-4 sm:px-6 lg:px-7 py-3.5 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[#2EC4A9]">
                    <svg className="w-5 sm:w-[22px] h-5 sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M9 9h6M9 12h6M9 15h4" />
                    </svg>
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-[15px] font-bold text-white leading-tight">Grade Names, Promotion Duration & Expected Role</h2>
                    <p className="text-xs sm:text-[12px] text-white/55 mt-1 leading-relaxed">직급명과 승격 기간은 편집 가능하며, 기대역할 텍스트를 수정하면 저장됩니다</p>
                </div>
                <div className="ml-auto flex gap-2 items-stretch">
                    <div className="bg-white/10 rounded-lg py-1.5 px-3.5 text-center min-w-[64px] flex flex-col justify-center">
                        <div className="text-[22px] font-extrabold text-white leading-none">{grades.length}</div>
                        <div className="text-[10px] text-white/50 mt-0.5">직급 수</div>
                    </div>
                    <div className="bg-white/10 rounded-lg py-1.5 px-3.5 text-center min-w-[64px] flex flex-col justify-center">
                        <div className="text-[22px] font-extrabold text-white leading-none">{totalHc}</div>
                        <div className="text-[10px] text-white/50 mt-0.5">총 인원</div>
                    </div>
                    <div className="w-px bg-white/10 my-1" />
                    <div className="bg-[rgba(46,196,169,0.18)] border border-[rgba(46,196,169,0.35)] rounded-lg py-1.5 px-3.5 text-center min-w-[80px] flex flex-col justify-center">
                        <div className="text-[22px] font-extrabold text-[#2EC4A9] leading-none">
                            {workforceTotal > 0 && totalHc > 0 ? `${ratioPct}%` : '—'}
                        </div>
                        <div className="text-[10px] text-white/50 mt-0.5">인원 배분율</div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="py-3 px-4 sm:py-3.5 sm:px-7 border-b border-[#F0F2F5] flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap">
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto py-1.5 px-3 bg-[#F0F2F5] rounded-lg text-sm sm:text-[12px] text-[#6B7585]">
                    <svg className="w-3.5 h-3.5 text-[#9AA3B2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="9" cy="7" r="4" />
                        <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                    </svg>
                    <span>전체 재직 인원</span>
                    <input
                        type="number"
                        min={1}
                        value={workforceTotal}
                        onChange={(e) => setWorkforceTotal(parseInt(e.target.value, 10) || 0)}
                        className="w-full sm:w-16 h-9 sm:h-[26px] px-2.5 border-[1.5px] border-[#E2E6ED] rounded-md text-sm sm:text-[13px] font-bold text-[#1B2B5B] text-center outline-none focus:border-[#2EC4A9] min-h-[40px]"
                    />
                    <span>명</span>
                </div>
                <span className="text-[12px] text-[#9AA3B2]">
                    · 직급명 · 승격 기간 · 인원수 · <strong className="text-[#3A4356]">기대역할</strong> 모두 편집 가능
                </span>
                <button
                    type="button"
                    onClick={addGrade}
                    disabled={isReadOnly}
                    className="ml-auto flex items-center gap-2 py-2 px-4 bg-[#1B2B5B] text-white rounded-lg text-[13px] font-bold hover:bg-[#243570] hover:-translate-y-0.5 transition-all shadow-[0_2px_6px_rgba(27,43,91,0.18)] disabled:opacity-50 disabled:pointer-events-none"
                >
                    <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Add Grade
                </button>
            </div>

            {/* Table header */}
            <div
                className="grid gap-x-2 sm:gap-x-3 py-2 px-4 sm:px-7 bg-[#F8F9FB] border-b border-[#E2E6ED] items-center text-xs sm:text-[11px] font-bold text-[#9AA3B2] uppercase tracking-wider"
                style={{ gridTemplateColumns: '28px 44px 100px 80px sm:100px 120px sm:minmax(120px,3.5fr) 36px' }}
            >
                <div />
                <div />
                <div>직급명 <span className="block text-[10px] font-normal text-[#CBD0DA] mt-0.5">GRADE NAME</span></div>
                <div>승격 기간 <span className="block text-[10px] font-normal text-[#CBD0DA] mt-0.5">PROMOTION PERIOD</span></div>
                <div>인원 수 <span className="block text-[10px] font-normal text-[#CBD0DA] mt-0.5">HEADCOUNT</span></div>
                <div>기대역할</div>
                <div />
            </div>

            {/* Grade list */}
            <div className="divide-y divide-[#F0F2F5]">
                {grades.map((g, index) => (
                        <div
                            key={g.id}
                            draggable={!isReadOnly}
                            onDragStart={(e) => handleDragStart(e, g.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, g.id)}
                            onDragLeave={() => setDropTarget(null)}
                            onDrop={(e) => handleDrop(e, g.id)}
                            className={cn(
                                'grid gap-2 sm:gap-3 py-3 px-4 sm:py-3.5 sm:px-7 items-start transition-colors hover:bg-[#F8F9FB]',
                                draggingId === g.id && 'opacity-35 bg-[#F0F2F5]',
                                dropTarget?.id === g.id && dropTarget.top && 'border-t-[2.5px] border-t-[#2EC4A9]',
                                dropTarget?.id === g.id && !dropTarget.top && 'border-b-[2.5px] border-b-[#2EC4A9]'
                            )}
                            style={{ gridTemplateColumns: '28px 44px 100px 80px sm:100px 120px sm:minmax(120px,3.5fr) 36px' }}
                        >
                        <div className="flex items-center justify-center self-center cursor-grab text-[#CBD0DA] hover:text-[#6B7585]" title="드래그하여 순서 변경">
                            <GripVertical className="w-3 h-3" />
                        </div>
                        <div
                            className="w-7 h-7 rounded-lg bg-[#1B2B5B] text-white text-[12px] font-extrabold flex items-center justify-center self-center"
                            style={{ background: `hsl(${220 - index * 18},55%,30%)` }}
                        >
                            {index + 1}
                        </div>
                        <div>
                            <input
                                type="text"
                                value={g.name}
                                onChange={(e) => updateGrade(g.id, { name: e.target.value })}
                                placeholder="직급명 입력"
                                disabled={isReadOnly}
                                className="h-[38px] w-full px-3 border-[1.5px] border-[#E2E6ED] rounded-lg text-[15px] font-bold text-[#1B2B5B] outline-none focus:border-[#2EC4A9] focus:ring-[3px] focus:ring-[rgba(46,196,169,0.12)] placeholder:text-[#CBD0DA] placeholder:font-normal placeholder:text-[13px]"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="number"
                                    min={1}
                                    max={30}
                                    value={g.noFixed ? '' : g.years}
                                    onChange={(e) => updateGrade(g.id, { years: parseInt(e.target.value, 10) || 1, noFixed: false })}
                                    disabled={isReadOnly || g.noFixed}
                                    className="w-[52px] h-[34px] px-2 border-[1.5px] border-[#E2E6ED] rounded-lg text-[14px] font-bold text-[#1B2B5B] text-center outline-none focus:border-[#2EC4A9] focus:ring-[3px] focus:ring-[rgba(46,196,169,0.12)] disabled:bg-[#F0F2F5] disabled:text-[#9AA3B2] disabled:opacity-70"
                                />
                                <span className="text-[12px] text-[#9AA3B2] font-medium">years</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => !isReadOnly && updateGrade(g.id, { noFixed: !g.noFixed })}
                                disabled={isReadOnly}
                                className="flex items-center gap-1.5 cursor-pointer select-none text-[11.5px] text-[#6B7585] font-medium disabled:opacity-60 disabled:cursor-default"
                            >
                                <div
                                    className={cn(
                                        'w-8 h-[18px] rounded-[20px] relative transition-colors flex-shrink-0',
                                        g.noFixed ? 'bg-[#2EC4A9]' : 'bg-[#E2E6ED]'
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'absolute top-[2px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform',
                                            g.noFixed ? 'left-[18px]' : 'left-[2px]'
                                        )}
                                    />
                                </div>
                                <span>No fixed period</span>
                            </button>
                        </div>
                        <div className="flex items-center rounded-lg overflow-hidden border-[1.5px] border-[#E2E6ED] bg-white w-full">
                            <button
                                type="button"
                                onClick={() => updateGrade(g.id, { count: Math.max(0, g.count - 1) })}
                                disabled={isReadOnly}
                                className="w-[30px] h-[34px] flex items-center justify-center bg-[#F8F9FB] text-[#6B7585] font-bold text-[15px] hover:bg-[#E6F9F6] hover:text-[#25A891] disabled:opacity-50"
                            >
                                −
                            </button>
                            <input
                                type="number"
                                min={0}
                                value={g.count || ''}
                                onChange={(e) => updateGrade(g.id, { count: parseInt(e.target.value, 10) || 0 })}
                                disabled={isReadOnly}
                                className="flex-1 min-w-0 border-0 bg-transparent text-center text-[14px] font-extrabold text-[#1B2B5B] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="px-2 text-[11px] font-semibold text-[#9AA3B2] border-l border-[#E2E6ED] bg-[#F8F9FB] h-[34px] flex items-center">명</span>
                        </div>
                        <div>
                            <textarea
                                value={g.role}
                                onChange={(e) => updateGrade(g.id, { role: e.target.value })}
                                placeholder="이 직급의 기대역할 및 역량을 입력하세요…"
                                disabled={isReadOnly}
                                rows={3}
                                className="w-full min-h-[72px] max-h-[120px] py-2.5 px-3 border-[1.5px] border-[#E2E6ED] rounded-lg text-[12.5px] text-[#3A4356] leading-relaxed outline-none focus:border-[#2EC4A9] focus:ring-[3px] focus:ring-[rgba(46,196,169,0.12)] placeholder:text-[#CBD0DA] resize-y"
                            />
                        </div>
                        <div className="flex items-center justify-center self-center">
                            <button
                                type="button"
                                onClick={() => removeGrade(g.id)}
                                disabled={isReadOnly}
                                className="w-7 h-7 rounded-full border border-[#E2E6ED] bg-white text-[#9AA3B2] flex items-center justify-center text-sm hover:bg-[#E05252] hover:text-white hover:border-[#E05252] transition-colors disabled:opacity-50 disabled:pointer-events-none"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="py-4 px-7 border-t border-[#F0F2F5] space-y-2.5">
                <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-[13px] font-bold text-[#3A4356] shrink-0">Total headcount</span>
                    <div className="flex-1 min-w-[120px] h-2 bg-[#F0F2F5] rounded-[20px] overflow-hidden">
                        <div
                            className="h-full rounded-[20px] transition-all duration-300"
                            style={{
                                width: `${barPct}%`,
                                background:
                                    totalHc > workforceTotal
                                        ? 'linear-gradient(90deg,#E05252,#f87171)'
                                        : totalHc < workforceTotal && totalHc > 0
                                        ? 'linear-gradient(90deg,#F59E0B,#FCD34D)'
                                        : 'linear-gradient(90deg,#2EC4A9,#3DD6BD)',
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#1B2B5B]">
                        <span className="text-[20px] font-extrabold">{totalHc}</span>
                        <span className="text-[12px] font-normal text-[#9AA3B2]">/ {workforceTotal}명</span>
                    </div>
                </div>
                <div
                    className={cn(
                        'flex items-center gap-2.5 py-2.5 px-3.5 rounded-lg text-[12.5px] font-semibold',
                        statusAlert.type === 'ok' && 'bg-[#E6F9F6] border border-[#B2EDE5] text-[#25A891]',
                        statusAlert.type === 'warn' && 'bg-[#FEF2F2] border border-[#FECACA] text-[#E05252]',
                        statusAlert.type === 'idle' && 'bg-[#F0F2F5] border border-[#E2E6ED] text-[#6B7585]'
                    )}
                >
                    <Info className="w-4 h-4 shrink-0" />
                    <span>{statusAlert.msg}</span>
                </div>
            </div>
        </div>
        </div>
    );

    if (embedMode) return <>{innerContent}</>;
    return (
        <>
            <Head title={`Job Grades - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title="Job Grades"
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="leaders"
                nextRoute="organizational-charts"
                formData={{
                    job_grade_names: grades.map((g) => g.name).filter(Boolean),
                    promotion_years: grades.reduce((acc, g) => {
                        if (g.name) acc[g.name] = g.noFixed ? null : g.years;
                        return acc;
                    }, {} as Record<string, number | null>),
                    job_grade_headcounts: grades.reduce((acc, g) => {
                        if (g.name) acc[g.name] = g.count;
                        return acc;
                    }, {} as Record<string, number>),
                    job_grade_expected_roles: grades.reduce((acc, g) => {
                        if (g.name && g.role?.trim()) acc[g.name] = g.role;
                        return acc;
                    }, {} as Record<string, string>),
                }}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                {innerContent}
            </FormLayout>
        </>
    );
}
