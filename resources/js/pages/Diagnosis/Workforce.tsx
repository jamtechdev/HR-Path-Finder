import { DiagnosisFieldShell } from '@/components/Diagnosis/DiagnosisFieldErrorsContext';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { tr } from '@/config/diagnosisTranslations';
import { loadAllTabDrafts } from '@/lib/diagnosisDraftStorage';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { Info, TrendingUp, Users } from 'lucide-react';
import { useEffect, useRef } from 'react';

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
    embedData?: Record<string, any>;
    embedSetData?: (key: string, value: any) => void;
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
    const data = useEmbed
        ? { ...internalForm.data, ...embedData }
        : internalForm.data;
    const setData = useEmbed
        ? (k: string, v: any) => embedSetData(k, v)
        : internalForm.setData;
    const errors = internalForm.errors;

    // 1. Load Drafts
    const wfDraftRef = useRef(false);
    useEffect(() => {
        if (wfDraftRef.current || !projectId || readOnly || embedMode) return;
        wfDraftRef.current = true;
        const p = loadAllTabDrafts(projectId).workforce;
        if (!p) return;

        Object.keys(internalForm.data).forEach((key) => {
            const k = key as keyof typeof internalForm.data;
            if (p[k] !== undefined) {
                internalForm.setData(k, p[k] as any);
            }
        });
    }, [projectId, readOnly, embedMode]);

    // 2. Sync present_headcount with FT + Contract
    useEffect(() => {
        if (readOnly || embedMode) return;
        const ft = Number(data.full_time_headcount) || 0;
        const ct = Number(data.contract_headcount) || 0;
        const sum = ft + ct;
        if (sum !== (Number(data.present_headcount) || 0)) {
            setData('present_headcount', sum);
        }
    }, [data.full_time_headcount, data.contract_headcount, data.present_headcount, readOnly, embedMode, setData]);

    // Derived Stats
    const ft = Number(data.full_time_headcount) || 0;
    const ct = Number(data.contract_headcount) || 0;
    const total = ft + ct;
    const male = Number(data.gender_male) || 0;
    const female = Number(data.gender_female) || 0;
    const other = Number(data.gender_other) || 0;
    const genderSum = male + female + other;

    const malePct = genderSum > 0 ? Math.round((male / genderSum) * 100) : 0;
    const femalePct =
        genderSum > 0 ? Math.round((female / genderSum) * 100) : 0;

    // Warning if headcount sum doesn't match gender sum (only if numbers are entered)
    const genderMismatch = total > 0 && genderSum > 0 && genderSum !== total;

    const adjustValue = (
        key: keyof typeof internalForm.data,
        delta: number,
    ) => {
        const current = Number(data[key]) || 0;
        setData(key as any, Math.max(0, current + delta));
    };

    const cardContent = (
        <div className="overflow-hidden rounded-[14px] border border-[#E2E6ED] bg-white shadow-[0_4px_20px_rgba(27,43,91,0.09)] dark:border-[#2a3a5c] dark:bg-[#1a2744]">
            {/* Hero strip */}
            <div className="flex flex-wrap items-center gap-4 bg-gradient-to-br from-[#1B2B5B] to-[#243877] px-7 py-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#2EC4A9]">
                    <Users className="h-[22px] w-[22px]" />
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-[15px] font-bold text-white">
                        {tr('workforceHeroTitle')}
                    </h2>
                    <p className="mt-0.5 text-[12px] text-white/55">
                        {tr('workforceHeroDesc')}
                    </p>
                </div>
                <div className="min-w-[80px] rounded-lg bg-white/10 px-4 py-2 text-center">
                    <div className="text-[22px] leading-none font-extrabold text-white">
                        {total}
                    </div>
                    <div className="mt-0.5 text-[10px] text-white/50">
                        {tr('totalEmployees')}
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Left: Headcount Breakdown */}
                    <DiagnosisFieldShell
                        fieldKey="present_headcount"
                        inertiaError={errors.present_headcount}
                    >
                        {({ borderCn, ErrorLine }) => (
                            <div>
                                <h3 className="mb-3 text-[13px] font-bold text-[#3A4356] dark:text-[#CBD0DA]">
                                    {tr('presentHeadcountTitle')}
                                </h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div
                                        className={cn(
                                            'rounded-xl border border-[#E2E6ED] bg-[#F8F9FB] p-4 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/30',
                                            borderCn,
                                        )}
                                    >
                                        <p className="mb-2 text-[12px] font-bold text-[#3A4356] dark:text-[#CBD0DA]">
                                            {tr('workforceFullTimeLabel')}
                                        </p>
                                        <div className="mb-2 flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={0}
                                                value={data.full_time_headcount}
                                                onChange={(e) =>
                                                    setData(
                                                        'full_time_headcount',
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                                disabled={readOnly}
                                                className="h-10 w-full rounded-lg border border-[#E2E6ED] bg-white text-center text-lg font-bold text-[#1B2B5B] dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]"
                                            />
                                            <span className="shrink-0 text-[13px] font-bold text-[#3A4356] dark:text-[#9AA3B2]">
                                                {tr('persons')}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {[-10, -1, 1, 10].map((d) => (
                                                <button
                                                    key={`ft-${d}`}
                                                    type="button"
                                                    onClick={() =>
                                                        adjustValue(
                                                            'full_time_headcount',
                                                            d,
                                                        )
                                                    }
                                                    disabled={readOnly}
                                                    className="h-7 rounded border bg-white px-2 text-xs font-semibold hover:bg-gray-50 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#CBD0DA] dark:hover:bg-[#2a3a5c]"
                                                >
                                                    - {d > 0 ? `+${d}` : d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-[#E2E6ED] bg-[#F8F9FB] p-4 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/30">
                                        <p className="mb-2 text-[12px] font-bold text-[#3A4356] dark:text-[#CBD0DA]">
                                            {tr('workforceContractLabel')}
                                        </p>
                                        <div className="mb-2 flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={0}
                                                value={data.contract_headcount}
                                                onChange={(e) =>
                                                    setData(
                                                        'contract_headcount',
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                                disabled={readOnly}
                                                className="h-10 w-full rounded-lg border border-[#E2E6ED] bg-white text-center text-lg font-bold text-[#1B2B5B] dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]"
                                            />
                                            <span className="shrink-0 text-[13px] font-bold text-[#3A4356] dark:text-[#9AA3B2]">
                                                {tr('persons')}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {[-10, -1, 1, 10].map((d) => (
                                                <button
                                                    key={`ct-${d}`}
                                                    type="button"
                                                    onClick={() =>
                                                        adjustValue(
                                                            'contract_headcount',
                                                            d,
                                                        )
                                                    }
                                                    disabled={readOnly}
                                                    className="h-7 rounded border bg-white px-2 text-xs font-semibold hover:bg-gray-50 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#CBD0DA] dark:hover:bg-[#2a3a5c]"
                                                >
                                                    {d > 0 ? `+${d}` : d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-[#1B2B5B] bg-[#1B2B5B]/[0.04] p-4 text-center dark:border-[#2EC4A9]/40 dark:bg-[#2EC4A9]/5">
                                        <p className="text-[10px] font-bold text-[#6B7585] uppercase dark:text-[#9AA3B2]">
                                            {tr('workforceTotalLabel')}
                                        </p>
                                        <p className="text-[28px] font-extrabold text-[#1B2B5B] dark:text-[#2EC4A9]">
                                            {total}
                                        </p>
                                        <p className="text-[10px] font-semibold text-[#9AA3B2] dark:text-[#6B7585]">
                                            {tr('persons')}
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-3 text-[12px] text-[#6B7585]">
                                    {tr('includeAllHint')}
                                </p>
                                {ErrorLine}
                            </div>
                        )}
                    </DiagnosisFieldShell>

                    {/* Right: Gender Composition */}
                    <div>
                        <h3 className="mb-3 text-[13px] font-bold text-[#3A4356] dark:text-[#CBD0DA]">
                            {tr('genderCompositionTitle')}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-[#E2E6ED] bg-[#F8F9FB] p-4 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/30">
                                <span className="text-[11px] font-bold text-[#1B2B5B] dark:text-[#CBD0DA]">
                                    MALE
                                </span>
                                <div className="mt-1 flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={data.gender_male}
                                        onChange={(e) =>
                                            setData(
                                                'gender_male',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        disabled={readOnly}
                                        className="h-8 w-full rounded-md border px-2 text-sm font-bold dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]"
                                    />
                                    <span className="text-xs text-[#9AA3B2]">
                                        {tr('persons')}
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-xl border-2 border-[#2EC4A9]/40 bg-[#E6F9F6]/50 p-4 dark:bg-[#2EC4A9]/5">
                                <span className="text-[11px] font-bold text-[#25A891]">
                                    FEMALE
                                </span>
                                <div className="mt-1 flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={data.gender_female}
                                        onChange={(e) =>
                                            setData(
                                                'gender_female',
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        disabled={readOnly}
                                        className="h-8 w-full rounded-md border px-2 text-sm font-bold dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]"
                                    />
                                    <span className="text-xs text-[#9AA3B2]">
                                        {tr('persons')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {genderSum > 0 && (
                            <div className="mt-4">
                                <div className="flex h-2.5 overflow-hidden rounded-full bg-[#E2E6ED] dark:bg-[#2a3a5c]">
                                    <div
                                        className="h-full bg-[#1B2B5B] transition-all"
                                        style={{ width: `${malePct}%` }}
                                    />
                                    <div
                                        className="h-full bg-[#2EC4A9] transition-all"
                                        style={{ width: `${femalePct}%` }}
                                    />
                                </div>
                                <div className="mt-2 flex justify-between text-[11px] font-bold text-[#6B7585] dark:text-[#9AA3B2]">
                                    <span>{malePct}% Male</span>
                                    <span>{femalePct}% Female</span>
                                </div>
                            </div>
                        )}

                        {genderMismatch && (
                            <div className="mt-3 flex gap-2 rounded border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-700">
                                <span>⚠️</span>
                                <span>{tr('genderMismatchWarn')}</span>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="border-[#E2E6ED] dark:border-[#2a3a5c]" />

                {/* Tenure and Age */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {[
                        {
                            key: 'average_tenure_active',
                            label: tr('avgTenureActiveLabel'),
                        },
                        {
                            key: 'average_tenure_leavers',
                            label: tr('avgTenureLeaversLabel'),
                        },
                        {
                            key: 'average_age',
                            label: tr('avgAgeLabel'),
                            max: 100,
                        },
                    ].map((f) => (
                        <div key={f.key}>
                            <label className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-[#3A4356] dark:text-[#CBD0DA]">
                                <Info className="h-3.5 w-3.5 text-[#9AA3B2]" />
                                {f.label}
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step={0.1}
                                    min={0}
                                    max={f.max}
                                    value={data[f.key as keyof typeof data]}
                                    onChange={(e) => {
                                        const val =
                                            parseFloat(e.target.value) || 0;
                                        setData(
                                            f.key as any,
                                            f.max ? Math.min(f.max, val) : val,
                                        );
                                    }}
                                    disabled={readOnly}
                                    className="h-10 flex-1 rounded-lg border px-3 text-sm font-bold text-[#1B2B5B] dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]"
                                />
                                <span className="text-[12px] font-medium text-[#9AA3B2]">
                                    {tr('unitYrShort')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Forecasting Section */}
                <div className="pt-4">
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-[11px] font-bold tracking-wider text-[#9AA3B2] uppercase">
                            {tr('forecastSectionLabel')}
                        </span>
                        <span className="h-px flex-1 bg-[#E2E6ED] dark:bg-[#2a3a5c]" />
                    </div>

                    <div className="overflow-hidden rounded-xl border border-[#E2E6ED] bg-[#F8F9FB] dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20">
                        <div className="flex items-center gap-3 border-b bg-white px-5 py-4 dark:border-[#2a3a5c] dark:bg-[#1a2744]">
                            <TrendingUp className="h-5 w-5 text-[#2EC4A9]" />
                            <div>
                                <h4 className="text-sm font-bold text-[#1B2B5B] dark:text-[#e2e8f0]">
                                    {tr('forecastCardTitle')} *
                                </h4>
                                <p className="text-[11px] text-[#9AA3B2]">
                                    {tr('forecastCardDesc')}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
                            {(
                                [
                                    'expected_headcount_1y',
                                    'expected_headcount_2y',
                                    'expected_headcount_3y',
                                ] as const
                            ).map((key, i) => (
                                <div
                                    key={key}
                                    className="rounded-lg border bg-white p-4 dark:border-[#2a3a5c] dark:bg-[#1a2744]"
                                >
                                    <p className="mb-2 text-[12px] font-semibold dark:text-[#CBD0DA]">
                                        {tr(`after${i + 1}y`)}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => adjustValue(key, -1)}
                                            className="rounded border p-1 dark:border-[#2a3a5c] dark:text-[#CBD0DA]"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={data[key]}
                                            onChange={(e) =>
                                                setData(
                                                    key,
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                            className="flex-1 border-none bg-transparent text-center text-sm font-bold w-full dark:text-[#e2e8f0]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => adjustValue(key, 1)}
                                            className="rounded border p-1 dark:border-[#2a3a5c] dark:text-[#CBD0DA]"
                                        >
                                            +
                                        </button>
                                        <span className="text-[11px] text-[#9AA3B2]">
                                            {tr('persons')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (embedMode) return <div className="w-full">{cardContent}</div>;

    return (
        <>
            <Head
                title={`${tr('workforcePageTitle')} - ${company?.name || project?.company?.name || 'Company'}`}
            />
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
                saveRoute={
                    projectId ? `/hr-manager/diagnosis/${projectId}` : undefined
                }
            >
                {cardContent}
            </FormLayout>
        </>
    );
}
