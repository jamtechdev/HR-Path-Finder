import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { both, tr } from '@/config/diagnosisTranslations';

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
    promotion_years: number | null;
    no_promotion_period: boolean;
    headcount: number;
    expected_role: string;
}

const DEFAULT_GRADES: Array<{ name: string; promotion_years: number; expected_role: string }> = [
    { name: '사원', promotion_years: 3, expected_role: '주어진 업무를 성실히 수행하며, 기초적인 실무 기술을 습득하고 조직 적응에 집중함.' },
    { name: '대리', promotion_years: 4, expected_role: '담당 업무에 대해 독립적인 수행 능력을 갖추며, 실무의 효율성을 개선하고 사수로서 후배를 지도함.' },
    { name: '과장', promotion_years: 5, expected_role: '단위 프로젝트나 파트를 책임지며, 문제 해결 능력을 바탕으로 실질적인 성과를 창출하고 유관 부서와 협업함.' },
    { name: '차장', promotion_years: 6, expected_role: '팀의 중추적인 역할을 하며, 상위 전략을 실행 계획으로 구체화하고 주도적으로 변화와 혁신을 이끔.' },
    { name: '부장', promotion_years: 7, expected_role: '조직의 전략적 방향성을 제시하며, 팀 전체의 성과를 관리하고 차세대 리더를 육성하는 매니지먼트에 집중함.' },
];

function buildGradesFromDiagnosis(diagnosis?: Diagnosis | null): JobGrade[] {
    if (!diagnosis?.job_grade_names?.length) {
        return DEFAULT_GRADES.map((g, i) => ({
            id: `grade-${i}`,
            name: g.name,
            promotion_years: g.promotion_years,
            no_promotion_period: false,
            headcount: 0,
            expected_role: g.expected_role,
        }));
    }
    const headcounts = diagnosis.job_grade_headcounts ?? {};
    const expectedRoles = diagnosis.job_grade_expected_roles ?? {};
    const promotionYears = diagnosis.promotion_years ?? {};
    return diagnosis.job_grade_names.map((name, index) => {
        const fromDefault = DEFAULT_GRADES.find((d) => d.name === name) ?? DEFAULT_GRADES[index % DEFAULT_GRADES.length];
        const years = promotionYears[name];
        const noPeriod = years === null || years === undefined;
        return {
            id: `grade-${index}-${name}`,
            name,
            promotion_years: noPeriod ? null : (typeof years === 'number' ? years : fromDefault.promotion_years),
            no_promotion_period: noPeriod,
            headcount: typeof headcounts[name] === 'number' ? headcounts[name] : 0,
            expected_role: expectedRoles[name] ?? (DEFAULT_GRADES.find((d) => d.name === name)?.expected_role ?? ''),
        };
    });
}

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
                years[g.name] = g.no_promotion_period ? null : g.promotion_years;
                headcounts[g.name] = g.headcount;
                if (g.expected_role?.trim()) expectedRoles[g.name] = g.expected_role;
            }
        });
        setData({
            job_grade_names: names,
            promotion_years: years,
            job_grade_headcounts: headcounts,
            job_grade_expected_roles: expectedRoles,
        });
    }, [grades]);

    const addGrade = () => {
        setGrades([
            ...grades,
            {
                id: `grade-${Date.now()}`,
                name: '',
                promotion_years: 1,
                no_promotion_period: false,
                headcount: 0,
                expected_role: '',
            },
        ]);
    };

    const removeGrade = (id: string) => {
        setGrades(grades.filter((g) => g.id !== id));
    };

    const updateGrade = (id: string, updates: Partial<JobGrade>) => {
        setGrades(
            grades.map((g) => {
                if (g.id !== id) return g;
                const updated = { ...g, ...updates };
                if (updated.no_promotion_period) updated.promotion_years = null;
                return updated;
            })
        );
    };

    const workforceTotal = diagnosis?.present_headcount ?? 0;
    const sumHeadcount = grades.reduce((s, g) => s + (g.headcount || 0), 0);
    const matchWorkforce = workforceTotal > 0 && sumHeadcount === workforceTotal;
    const diff = sumHeadcount - workforceTotal;

    const innerContent = (
                <div className="space-y-5">
                    <div>
                        <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                            {both('jobGradeDesc').en}
                        </p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1">{both('jobGradeDesc').ko}</p>
                    </div>
                    <div className="flex items-start gap-2.5 rounded-lg border border-[rgba(26,39,68,0.1)] border-l-[3px] border-l-[#1a2744] bg-[rgba(26,39,68,0.04)] p-3">
                        <span className="text-sm flex-shrink-0 mt-0.5" aria-hidden>ℹ</span>
                        <div>
                            <p className="text-xs text-[#5a6478] leading-relaxed">
                                <strong className="text-[#1a2744]">{both('expectedRoleDraft').en.split(':')[0]}:</strong>{both('expectedRoleDraft').en.split(':').slice(1).join(':').trim()}
                            </p>
                            <p className="text-[11px] text-muted-foreground/80 mt-1">{both('expectedRoleDraft').ko}</p>
                        </div>
                    </div>
                    <Card className="border rounded-[14px] overflow-hidden border-border">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--gray-100)] bg-white">
                            <div>
                                <h3 className="text-[13px] font-bold text-[#2d3340]">{both('gradeNamesCard').en}</h3>
                                <p className="text-[11.5px] text-muted-foreground mt-0.5">{both('gradeNamesSub').ko}</p>
                            </div>
                            <button
                                type="button"
                                onClick={addGrade}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border-[1.5px] border-[#4ecdc4] bg-[rgba(78,205,196,0.12)] text-[#2ea89e] text-xs font-semibold hover:bg-[rgba(78,205,196,0.2)] transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                {tr('addGrade')}
                            </button>
                        </div>
                        <div className="p-0">
                            {/* Table header */}
                            <div
                                className="grid gap-0 border-b border-border bg-[#f8f9fb] px-5 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground"
                                style={{ gridTemplateColumns: '140px 90px 120px 48px 1fr 32px' }}
                            >
                                <div>{both('gradeName').ko} <span className="text-[10px] font-normal text-muted-foreground/80">({both('gradeName').en})</span></div>
                                <div>{both('promotionPeriod').ko} <span className="text-[10px] font-normal text-muted-foreground/80">({both('promotionPeriod').en})</span></div>
                                <div>{both('noFixedPeriod').ko}</div>
                                <div>{both('headcount').ko} <span className="text-[10px] font-normal text-muted-foreground/80">({both('headcount').en})</span></div>
                                <div>{both('expectedRoleCompetencies').ko}</div>
                                <div />
                            </div>
                            {grades.map((grade) => (
                                <div
                                    key={grade.id}
                                    className="grid gap-0 px-5 py-3 border-b border-[var(--gray-100)] items-start hover:bg-muted/50 transition-colors"
                                    style={{ gridTemplateColumns: '140px 90px 120px 48px 1fr 32px' }}
                                >
                                    <div className="pr-3 pt-1">
                                        <input
                                            type="text"
                                            value={grade.name}
                                            onChange={(e) => updateGrade(grade.id, { name: e.target.value })}
                                            placeholder="직급명 입력"
                                            className="w-full border-0 border-b-2 border-dashed border-border bg-transparent text-[13px] font-semibold text-[#2d3340] outline-none px-1 py-0.5 rounded-t focus:border-[#4ecdc4] focus:bg-[rgba(78,205,196,0.05)]"
                                        />
                                    </div>
                                    <div className="pr-3 pt-1">
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="number"
                                                min={1}
                                                value={grade.no_promotion_period ? '' : (grade.promotion_years ?? '')}
                                                onChange={(e) => {
                                                    const v = parseInt(e.target.value, 10);
                                                    updateGrade(grade.id, { promotion_years: isNaN(v) ? null : v, no_promotion_period: false });
                                                }}
                                                disabled={grade.no_promotion_period}
                                                className="w-12 h-[34px] text-center border-[1.5px] border-border rounded-md text-[13px] font-bold text-[#1a2744] outline-none focus:border-[#4ecdc4] disabled:bg-muted disabled:text-muted-foreground"
                                            />
                                            <span className="text-[11px] text-muted-foreground">{tr('years')}</span>
                                        </div>
                                    </div>
                                    <div className="pr-4 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => updateGrade(grade.id, { no_promotion_period: !grade.no_promotion_period })}
                                            className={`flex items-center gap-1.5 cursor-pointer ${grade.no_promotion_period ? 'checked' : ''}`}
                                        >
                                            <span
                                                className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 transition-colors ${
                                                    grade.no_promotion_period
                                                        ? 'border-[#1a2744] bg-[#1a2744] text-white'
                                                        : 'border-muted-foreground/40 bg-white'
                                                }`}
                                            >
                                                {grade.no_promotion_period && <span className="text-[9px]">✓</span>}
                                            </span>
                                            <span className={`text-[11.5px] ${grade.no_promotion_period ? 'text-[#1a2744] font-semibold' : 'text-muted-foreground'}`}>
                                                {tr('noFixedPeriod')}
                                            </span>
                                        </button>
                                    </div>
                                    <div className="pr-3 pt-1">
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                min={0}
                                                value={grade.headcount || ''}
                                                onChange={(e) => {
                                                    const v = parseInt(e.target.value, 10);
                                                    updateGrade(grade.id, { headcount: isNaN(v) ? 0 : v });
                                                }}
                                                className="w-10 h-[34px] text-center border-[1.5px] border-border rounded-md text-[13px] font-bold text-[#1a2744] outline-none focus:border-[#4ecdc4]"
                                            />
                                            <span className="text-[11px] text-muted-foreground">{tr('persons')}</span>
                                        </div>
                                    </div>
                                    <div className="pr-3">
                                        <textarea
                                            value={grade.expected_role}
                                            onChange={(e) => updateGrade(grade.id, { expected_role: e.target.value })}
                                            placeholder={tr('expectedRolePlaceholder')}
                                            rows={3}
                                            className="w-full min-h-[60px] px-2.5 py-2 border-[1.5px] border-border rounded-lg text-xs text-[#2d3340] bg-white resize-y outline-none focus:border-[#4ecdc4] placeholder:italic placeholder:text-muted-foreground/80 leading-relaxed"
                                        />
                                    </div>
                                    <div className="flex justify-center pt-1.5">
                                        <button
                                            type="button"
                                            onClick={() => removeGrade(grade.id)}
                                            className="w-[26px] h-[26px] rounded-md border-0 bg-muted text-muted-foreground hover:bg-[#fde8e8] hover:text-[#e05252] flex items-center justify-center text-[11px] transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {/* Summary row */}
                            <div
                                className="grid gap-0 px-5 py-3 bg-[#f8f9fb] border-t-2 border-border items-center"
                                style={{ gridTemplateColumns: '140px 90px 120px 48px 1fr 32px' }}
                            >
                                <div className="text-xs font-bold text-[#5a6478] pr-3 col-span-3">{tr('totalHeadcount')}</div>
                                <div
                                    className={`text-[15px] font-extrabold pr-3 transition-colors ${matchWorkforce ? 'text-[#2aab6e]' : diff !== 0 ? 'text-[#e05252]' : 'text-foreground'}`}
                                >
                                    {sumHeadcount}{tr('persons')}
                                </div>
                            </div>
                            {/* Workforce check banner */}
                            {workforceTotal > 0 && (
                                <div
                                    className={`mx-5 mb-3.5 py-2.5 px-3.5 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                                        matchWorkforce
                                            ? 'bg-[rgba(42,171,110,0.08)] border border-[rgba(42,171,110,0.25)] text-[#1a7a4e]'
                                            : 'bg-[rgba(224,82,82,0.08)] border border-[rgba(224,82,82,0.25)] text-[#e05252]'
                                    }`}
                                >
                                    <span className="flex-shrink-0">{matchWorkforce ? '✅' : '⚠️'}</span>
                                    <span>
                                        {matchWorkforce ? (
                                            <>{tr('workforceMatch')}</>
                                        ) : diff > 0 ? (
                                            <><strong>{sumHeadcount}</strong> / <strong>{workforceTotal}</strong> — {tr('workforceOver')}</>
                                        ) : (
                                            <><strong>{sumHeadcount}</strong> / <strong>{workforceTotal}</strong> — {tr('workforceUnder')}</>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
    );
    if (embedMode) return <>{innerContent}</>;
    return (
        <>
            <Head title={`Job Grade System - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title={both('jobGradeSystem').en}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="leaders"
                nextRoute="organizational-charts"
                formData={{
                    job_grade_names: grades.map((g) => g.name),
                    promotion_years: grades.reduce((acc, g) => {
                        acc[g.name] = g.no_promotion_period ? null : g.promotion_years;
                        return acc;
                    }, {} as Record<string, number | null>),
                    job_grade_headcounts: grades.reduce((acc, g) => {
                        if (g.name) acc[g.name] = g.headcount;
                        return acc;
                    }, {} as Record<string, number>),
                    job_grade_expected_roles: grades.reduce((acc, g) => {
                        if (g.name && g.expected_role?.trim()) acc[g.name] = g.expected_role;
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
