import { Head, useForm } from '@inertiajs/react';
import { Info, TrendingUp, Users, Minus, Plus } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { DiagnosisFieldShell } from '@/components/Diagnosis/DiagnosisFieldErrorsContext';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { tr } from '@/config/diagnosisTranslations';
import { loadAllTabDrafts } from '@/lib/diagnosisDraftStorage';
import { cn } from '@/lib/utils';

interface Diagnosis {
    id: number;
    present_headcount?: number;
    full_time_headcount?: number;
    contract_headcount?: number;
    expected_headcount_1y?: number;
    expected_headcount_2y?: number;
    expected_headcount_3y?: number;
    average_tenure_active?: number;
    average_tenure_leavers?: number;
    average_age?: number;
    gender_male?: number;
    gender_female?: number;
    gender_other?: number;
    gender_ratio?: number;
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

export default function Workforce({
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
    const internalForm = useForm({
        present_headcount: diagnosis?.present_headcount ?? 0,
        full_time_headcount:
            diagnosis?.full_time_headcount ?? diagnosis?.present_headcount ?? 0,
        contract_headcount: diagnosis?.contract_headcount ?? 0,
        expected_headcount_1y: diagnosis?.expected_headcount_1y ?? 0,
        expected_headcount_2y: diagnosis?.expected_headcount_2y ?? 0,
        expected_headcount_3y: diagnosis?.expected_headcount_3y ?? 0,
        average_tenure_active: diagnosis?.average_tenure_active ?? 0,
        average_tenure_leavers: diagnosis?.average_tenure_leavers ?? 0,
        average_age: diagnosis?.average_age ?? 0,
        gender_male: diagnosis?.gender_male ?? 0,
        gender_female: diagnosis?.gender_female ?? 0,
        gender_other: diagnosis?.gender_other ?? 0,
    });
    const useEmbed = embedMode && embedData != null && embedSetData;
    const data = useEmbed ? { ...internalForm.data, ...embedData } as typeof internalForm.data : internalForm.data;
    const setData = useEmbed ? (k: string, v: unknown) => embedSetData(k, v) : internalForm.setData;
    const errors = internalForm.errors;

    const wfDraft = useRef(false);
    useEffect(() => {
        if (wfDraft.current || !projectId || readOnly || embedMode) return;
        wfDraft.current = true;
        const p = loadAllTabDrafts(projectId).workforce;
        if (!p) return;
        (Object.keys(internalForm.data) as Array<keyof typeof internalForm.data>).forEach((k) => {
            if (p[k as string] !== undefined) setData(k as string, p[k as string] as never);
        });
    }, [projectId, readOnly, embedMode, setData]);

    useEffect(() => {
        if (embedMode) return;
        const ft = Number(data.full_time_headcount) || 0;
        const ct = Number(data.contract_headcount) || 0;
        const sum = ft + ct;
        if (sum !== (Number(data.present_headcount) || 0)) {
            setData('present_headcount', sum);
        }
    }, [data.full_time_headcount, data.contract_headcount, data.present_headcount, embedMode, setData]);

    const ft = Number(data.full_time_headcount) || 0;
    const ct = Number(data.contract_headcount) || 0;
    const total = ft + ct;
    const male = data.gender_male || 0;
    const female = data.gender_female || 0;
    const genderSum = male + female + (data.gender_other || 0);
    const malePct = total > 0 && genderSum > 0 ? Math.round((male / genderSum) * 100) : 0;
    const femalePct = total > 0 && genderSum > 0 ? Math.round((female / genderSum) * 100) : 0;
    const genderMismatch = total > 0 && (male + female) !== total;

    const adjustFullTime = (delta: number) => {
        const next = Math.max(0, ft + delta);
        setData('full_time_headcount', next);
    };

    const adjustContract = (delta: number) => {
        const next = Math.max(0, ct + delta);
        setData('contract_headcount', next);
    };

    const adjustForecast = (key: 'expected_headcount_1y' | 'expected_headcount_2y' | 'expected_headcount_3y', delta: number) => {
        const next = Math.max(0, (data[key] || 0) + delta);
        setData(key, next);
    };

    const cardContent = (
        <div className="rounded-[14px] border border-[#E2E6ED] bg-white overflow-hidden shadow-[0_4px_20px_rgba(27,43,91,0.09)]">
            {/* Hero strip: Workforce Overview */}
            <div className="bg-gradient-to-br from-[#1B2B5B] to-[#243877] px-7 py-5 flex flex-wrap items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[#2EC4A9]">
                    <Users className="w-[22px] h-[22px]" />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-[15px] font-bold text-white">{tr('workforceHeroTitle')}</h2>
                    <p className="text-[12px] text-white/55 mt-0.5">
                        {tr('workforceHeroDesc')}
                    </p>
                </div>
                <div className="bg-white/10 rounded-lg py-2 px-4 text-center min-w-[80px]">
                    <div className="text-[22px] font-extrabold text-white leading-none">{total}</div>
                    <div className="text-[10px] text-white/50 mt-0.5">{tr('totalEmployees')}</div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* 전체 재직 인원 | 성별 구성 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: 전체 재직 인원 */}
                    <DiagnosisFieldShell fieldKey="present_headcount" inertiaError={errors.present_headcount}>
                        {({ borderCn, ErrorLine }) => (
                    <div>
                        <h3 className="text-[13px] font-bold text-[#3A4356] mb-3">{tr('presentHeadcountTitle')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
                            <div className={cn('rounded-xl border border-[#E2E6ED] bg-[#F8F9FB] p-4', borderCn)}>
                                <p className="text-[12px] font-bold text-[#3A4356] mb-2">{tr('workforceFullTimeLabel')}</p>
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="number"
                                        min={0}
                                        value={data.full_time_headcount ?? ''}
                                        onChange={(e) =>
                                            setData('full_time_headcount', parseInt(e.target.value, 10) || 0)
                                        }
                                        disabled={readOnly}
                                        className="w-full h-10 text-center text-lg font-bold text-[#1B2B5B] border border-[#E2E6ED] rounded-lg bg-white"
                                    />
                                    <span className="text-[13px] font-bold text-[#3A4356] shrink-0">{tr('persons')}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {([-10, -1, 1, 10] as const).map((d) => (
                                        <button
                                            key={`ft-${d}`}
                                            type="button"
                                            onClick={() => adjustFullTime(d)}
                                            disabled={readOnly}
                                            className="h-8 px-3 rounded-lg border border-[#E2E6ED] bg-white text-[#3A4356] font-semibold text-xs hover:bg-[#E2E6ED] disabled:opacity-50"
                                        >
                                            {d > 0 ? `+${d}` : d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-xl border border-[#E2E6ED] bg-[#F8F9FB] p-4">
                                <p className="text-[12px] font-bold text-[#3A4356] mb-2">{tr('workforceContractLabel')}</p>
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="number"
                                        min={0}
                                        value={data.contract_headcount ?? ''}
                                        onChange={(e) =>
                                            setData('contract_headcount', parseInt(e.target.value, 10) || 0)
                                        }
                                        disabled={readOnly}
                                        className="w-full h-10 text-center text-lg font-bold text-[#1B2B5B] border border-[#E2E6ED] rounded-lg bg-white"
                                    />
                                    <span className="text-[13px] font-bold text-[#3A4356] shrink-0">{tr('persons')}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {([-10, -1, 1, 10] as const).map((d) => (
                                        <button
                                            key={`ct-${d}`}
                                            type="button"
                                            onClick={() => adjustContract(d)}
                                            disabled={readOnly}
                                            className="h-8 px-3 rounded-lg border border-[#E2E6ED] bg-white text-[#3A4356] font-semibold text-xs hover:bg-[#E2E6ED] disabled:opacity-50"
                                        >
                                            {d > 0 ? `+${d}` : d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-xl border-2 border-[#1B2B5B] bg-[#1B2B5B]/[0.04] p-4 flex flex-col items-center justify-center text-center">
                                <p className="text-[12px] font-bold uppercase tracking-wide text-[#6B7585] mb-1">
                                    {tr('workforceTotalLabel')}
                                </p>
                                <p className="text-[32px] font-extrabold text-[#1B2B5B] leading-none">{total}</p>
                                <p className="text-[11px] font-semibold text-[#9AA3B2] mt-1">{tr('persons')}</p>
                            </div>
                        </div>
                        <p className="mt-4 text-[13px] font-bold text-[#3A4356] leading-snug text-center sm:text-left">
                            {tr('includeAllHint')}
                        </p>
                        {ErrorLine}
                    </div>
                        )}
                    </DiagnosisFieldShell>

                    {/* Right: 성별 구성 */}
                    <div>
                        <h3 className="text-[13px] font-bold text-[#3A4356] mb-3">{tr('genderCompositionTitle')}</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-[#E2E6ED] bg-[#F8F9FB] p-4">
                                <div className="w-10 h-10 rounded-full bg-[#1B2B5B]/10 flex items-center justify-center mb-2">
                                    <span className="text-[#1B2B5B] font-bold text-sm">M</span>
                                </div>
                                <p className="text-[12px] font-semibold text-[#3A4356]">{tr('maleWithEn')}</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <input
                                        type="number"
                                        min={0}
                                        value={data.gender_male ?? ''}
                                        onChange={(e) => setData('gender_male', parseInt(e.target.value, 10) || 0)}
                                        disabled={readOnly}
                                        className="w-14 h-8 text-center text-sm font-bold text-[#1B2B5B] border border-[#E2E6ED] rounded-md bg-white"
                                    />
                                    <span className="text-[12px] text-[#6B7585]">{tr('persons')}</span>
                                </div>
                            </div>
                            <div className="rounded-xl border-2 border-[#2EC4A9]/40 bg-[#E6F9F6]/50 p-4">
                                <div className="w-10 h-10 rounded-full bg-[#2EC4A9]/20 flex items-center justify-center mb-2">
                                    <span className="text-[#25A891] font-bold text-sm">F</span>
                                </div>
                                <p className="text-[12px] font-semibold text-[#3A4356]">{tr('femaleWithEn')}</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <input
                                        type="number"
                                        min={0}
                                        value={data.gender_female ?? ''}
                                        onChange={(e) => setData('gender_female', parseInt(e.target.value, 10) || 0)}
                                        disabled={readOnly}
                                        className="w-14 h-8 text-center text-sm font-bold text-[#1B2B5B] border border-[#E2E6ED] rounded-md bg-white"
                                    />
                                    <span className="text-[12px] text-[#6B7585]">{tr('persons')}</span>
                                </div>
                            </div>
                        </div>
                        {/* Ratio bar */}
                        {genderSum > 0 && (
                            <div className="mt-4">
                                <div className="flex h-3 rounded-full overflow-hidden bg-[#E2E6ED]">
                                    <div
                                        className="h-full bg-[#1B2B5B] transition-all duration-300"
                                        style={{ width: `${malePct}%` }}
                                    />
                                    <div
                                        className="h-full bg-[#2EC4A9] transition-all duration-300"
                                        style={{ width: `${femalePct}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1.5 text-[11px] font-semibold text-[#6B7585]">
                                    <span>{tr('ratioMale').replace('{{pct}}', String(malePct))}</span>
                                    <span>{tr('ratioFemale').replace('{{pct}}', String(femalePct))}</span>
                                </div>
                                <p className="text-[11px] text-[#9AA3B2] mt-0.5">
                                    {tr('ratioText').replace('{{m}}', String(malePct)).replace('{{f}}', String(femalePct))}
                                </p>
                            </div>
                        )}
                        {genderMismatch && (
                            <div className="mt-3 flex items-center gap-2 p-3 rounded-lg border border-[#E05252] bg-[#FEF2F2] text-[#E05252] text-[12px] font-semibold">
                                <span className="shrink-0">⚠</span>
                                <span>{tr('genderMismatchWarn')}</span>
                            </div>
                        )}
                        {(errors.gender_male || errors.gender_female) && (
                            <p className="mt-1 text-sm text-[#E05252]">
                                {errors.gender_male || errors.gender_female}
                            </p>
                        )}
                    </div>
                </div>

                {/* Average tenure & age */}
                <hr className="border-[#E2E6ED]" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-[#3A4356] mb-2">
                            <Info className="w-3.5 h-3.5 text-[#9AA3B2]" />
                            {tr('avgTenureActiveLabel')}
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                step={0.1}
                                min={0}
                                value={data.average_tenure_active ?? ''}
                                onChange={(e) => setData('average_tenure_active', parseFloat(e.target.value) || 0)}
                                disabled={readOnly}
                                className="flex-1 h-10 px-3 border border-[#E2E6ED] rounded-lg text-sm font-bold text-[#1B2B5B] focus:border-[#2EC4A9] outline-none"
                            />
                            <span className="text-[12px] text-[#9AA3B2] font-medium">{tr('unitYrShort')}</span>
                        </div>
                        {errors.average_tenure_active && (
                            <p className="mt-1 text-xs text-[#E05252]">{errors.average_tenure_active}</p>
                        )}
                    </div>
                    <div>
                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-[#3A4356] mb-2">
                            <Info className="w-3.5 h-3.5 text-[#9AA3B2]" />
                            {tr('avgTenureLeaversLabel')}
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                step={0.1}
                                min={0}
                                value={data.average_tenure_leavers ?? ''}
                                onChange={(e) => setData('average_tenure_leavers', parseFloat(e.target.value) || 0)}
                                disabled={readOnly}
                                className="flex-1 h-10 px-3 border border-[#E2E6ED] rounded-lg text-sm font-bold text-[#1B2B5B] focus:border-[#2EC4A9] outline-none"
                            />
                            <span className="text-[12px] text-[#9AA3B2] font-medium">{tr('unitYrShort')}</span>
                        </div>
                        {errors.average_tenure_leavers && (
                            <p className="mt-1 text-xs text-[#E05252]">{errors.average_tenure_leavers}</p>
                        )}
                    </div>
                    <div>
                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-[#3A4356] mb-2">
                            <Info className="w-3.5 h-3.5 text-[#9AA3B2]" />
                            {tr('avgAgeLabel')}
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                step={0.1}
                                min={0}
                                max={100}
                                value={data.average_age ?? ''}
                                onChange={(e) => {
                                    const v = parseFloat(e.target.value);
                                    setData('average_age', isNaN(v) ? 0 : Math.min(100, Math.max(0, v)));
                                }}
                                disabled={readOnly}
                                className="flex-1 h-10 px-3 border border-[#E2E6ED] rounded-lg text-sm font-bold text-[#1B2B5B] focus:border-[#2EC4A9] outline-none"
                            />
                            <span className="text-[12px] text-[#9AA3B2] font-medium">{tr('unitYrShort')}</span>
                        </div>
                        {errors.average_age && (
                            <p className="mt-1 text-xs text-[#E05252]">{errors.average_age}</p>
                        )}
                    </div>
                </div>

                {/* 예상 인력 규모 */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[11.5px] font-bold text-[#9AA3B2] uppercase tracking-wider">
                            {tr('forecastSectionLabel')}
                        </span>
                        <span className="flex-1 h-px bg-[#E2E6ED]" />
                    </div>

                    <div className="rounded-xl border border-[#E2E6ED] bg-[#F8F9FB] overflow-hidden">
                        <div className="px-5 py-4 flex items-center gap-3 border-b border-[#E2E6ED] bg-white">
                            <div className="w-10 h-10 rounded-lg bg-[#2EC4A9]/15 flex items-center justify-center text-[#2EC4A9]">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-[14px] font-bold text-[#1B2B5B]">
                                    {tr('forecastCardTitle')} <span className="text-[#E05252]">*</span>
                                </h4>
                                <p className="text-[11px] text-[#9AA3B2]">
                                    {tr('forecastCardDesc')}
                                </p>
                            </div>
                        </div>
                        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { key: 'expected_headcount_1y' as const, label: tr('after1y') },
                                { key: 'expected_headcount_2y' as const, label: tr('after2y') },
                                { key: 'expected_headcount_3y' as const, label: tr('after3y') },
                            ].map(({ key, label }) => (
                                <div
                                    key={key}
                                    className="rounded-lg border border-[#E2E6ED] bg-white p-4 relative"
                                >
                                    <p className="text-[12px] font-semibold text-[#3A4356] mb-2">{label}</p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => adjustForecast(key, -1)}
                                            disabled={readOnly}
                                            className="w-8 h-8 rounded-md border border-[#E2E6ED] bg-[#F8F9FB] flex items-center justify-center text-[#6B7585] hover:bg-[#E2E6ED] disabled:opacity-50"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <input
                                            type="number"
                                            min={0}
                                            value={data[key] ?? ''}
                                            onChange={(e) => setData(key, parseInt(e.target.value, 10) || 0)}
                                            disabled={readOnly}
                                            className="flex-1 h-9 text-center text-sm font-bold text-[#1B2B5B] border border-[#E2E6ED] rounded-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => adjustForecast(key, 1)}
                                            disabled={readOnly}
                                            className="w-8 h-8 rounded-md border border-[#E2E6ED] bg-[#F8F9FB] flex items-center justify-center text-[#6B7585] hover:bg-[#E2E6ED] disabled:opacity-50"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="text-[11px] text-[#9AA3B2] font-medium">{tr('persons')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {(errors.expected_headcount_1y || errors.expected_headcount_2y || errors.expected_headcount_3y) && (
                        <p className="mt-1 text-sm text-[#E05252]">
                            {errors.expected_headcount_1y || errors.expected_headcount_2y || errors.expected_headcount_3y}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    if (embedMode) return <>{cardContent}</>;
    return (
        <>
            <Head title={`${tr('workforcePageTitle')} - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title={tr('workforcePageTitle')}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="company-info"
                nextRoute="executives"
                formData={data}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                {cardContent}
            </FormLayout>
        </>
    );
}
