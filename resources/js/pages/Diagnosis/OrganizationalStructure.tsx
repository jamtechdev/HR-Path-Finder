import { Head, useForm } from '@inertiajs/react';
import { X, Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DiagnosisFieldErrorMessage } from '@/components/Diagnosis/DiagnosisFieldErrorsContext';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { OrgStructureDiagram } from '@/components/Diagnosis/OrgStructureDiagrams';
import { both, tr } from '@/config/diagnosisTranslations';
import { useDiagnosisDraftHydrate } from '@/hooks/useDiagnosisDraftHydrate';
import { cn } from '@/lib/utils';

interface Diagnosis {
    id: number;
    org_structure_types?: string[];
    org_structure_explanations?: Record<string, string>;
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

const STRUCTURE_OPTIONS: Array<{ id: string; nameKo: string; descKo: string }> = [
    { id: 'functional', nameKo: '기능 조직', descKo: '영업·기술·관리 등 기능 단위로 팀을 구성' },
    { id: 'divisional', nameKo: '사업부 조직', descKo: '제품·브랜드·지역별로 독립 사업부 운영' },
    { id: 'matrix', nameKo: '매트릭스 조직', descKo: '기능팀 소속이면서 프로젝트 리더에도 동시 보고' },
    { id: 'hq', nameKo: '본사-자회사 구조', descKo: '본사가 전략을, 자회사·지사가 현장 운영을 담당' },
    { id: 'tft', nameKo: 'TFT (태스크포스)', descKo: '특정 목표를 위해 여러 팀에서 인원을 차출, 완료 후 해산' },
    { id: 'flat', nameKo: '수평/플랫 조직', descKo: '위계 최소화, 구성원이 CEO에게 직접 보고' },
    { id: 'undefined', nameKo: '아직 명확하게 정의된 바 없음', descKo: '공식적인 조직 구조가 없거나 아직 정립되지 않은 상태' },
];

const NAME_MAP: Record<string, string> = Object.fromEntries(STRUCTURE_OPTIONS.map((o) => [o.id, o.nameKo]));

/** Normalize backend values to our UI ids */
function normalizeLoadedTypes(types: string[] | undefined): string[] {
    if (!types?.length) return [];
    return types.map((t) => {
        if (t === 'hq_subsidiary') return 'hq';
        if (t === 'no_defined') return 'undefined';
        return t;
    }).filter((id) => STRUCTURE_OPTIONS.some((o) => o.id === id));
}

export default function OrganizationalStructure({
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
    const [selectedIds, setSelectedIds] = useState<string[]>(() =>
        normalizeLoadedTypes(diagnosis?.org_structure_types)
    );
    const [customNote, setCustomNote] = useState(
        () => (diagnosis?.org_structure_explanations && typeof diagnosis.org_structure_explanations === 'object'
            ? (diagnosis.org_structure_explanations as Record<string, string>)['custom'] ?? ''
            : '')
    );

    const internalForm = useForm({
        org_structure_types: [] as string[],
        org_structure_explanations: {} as Record<string, string>,
    });
    const useEmbed = embedMode && embedData != null && embedSetData;
    const data = useEmbed ? { ...internalForm.data, ...embedData } as typeof internalForm.data : internalForm.data;
    const setData = useEmbed ? (k: string, v: unknown) => embedSetData(k, v) : internalForm.setData;
    const inertiaOrgStructureErr =
        typeof internalForm.errors.org_structure_types === 'string'
            ? internalForm.errors.org_structure_types
            : typeof (internalForm.errors as Record<string, string>).organizational_structure === 'string'
              ? (internalForm.errors as Record<string, string>).organizational_structure
              : undefined;

    // Hydrate from session draft so selections persist when navigating back/forward
    useDiagnosisDraftHydrate(
        projectId,
        'organizational-structure',
        (patch) => {
            if (Array.isArray(patch.org_structure_types)) setSelectedIds(patch.org_structure_types as string[]);
            const expl = patch.org_structure_explanations as any;
            if (expl && typeof expl === 'object' && typeof expl.custom === 'string') setCustomNote(expl.custom);
        },
        { enabled: !embedMode && !readOnly }
    );

    useEffect(() => {
        setData('org_structure_types', selectedIds);
        setData('org_structure_explanations', { custom: customNote });
    }, [selectedIds, customNote]);

    const toggle = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const removeFromSummary = (id: string) => {
        setSelectedIds((prev) => prev.filter((x) => x !== id));
    };

    const descEn = both('orgStructureDesc');
    const customTitle = both('customOrgTitle');
    const customSub = both('customOrgSub');
    const customPlaceholder = both('customOrgPlaceholder');
    const selectedLabel = both('selectedStructures');
    const noSelected = both('noStructureSelected');

    const innerContent = (
                <div className="space-y-6">
                    <div>
                        <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                            {descEn.ko}
                        </p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1">{descEn.en}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {STRUCTURE_OPTIONS.map((opt) => {
                            const selected = selectedIds.includes(opt.id);
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => !readOnly && toggle(opt.id)}
                                    disabled={readOnly}
                                    className={cn(
                                        'relative rounded-2xl border-2 p-7 pt-7 flex flex-col items-center gap-4 text-center transition-all duration-200 select-none cursor-pointer',
                                        'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg hover:-translate-y-0.5',
                                        selected && 'border-[#4ecdc4] bg-[rgba(78,205,196,0.12)] shadow-[0_0_0_1px_#4ecdc4]'
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'absolute top-3.5 right-3.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                                            selected ? 'border-[#4ecdc4] bg-[#4ecdc4] text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                        )}
                                    >
                                        {selected && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                                    </span>
                                    <OrgStructureDiagram id={opt.id} />
                                    <span className={cn('text-sm font-bold text-slate-800 dark:text-slate-100', selected && 'text-[#2ea89e]')}>
                                        {opt.nameKo}
                                    </span>
                                    <span className="text-xs text-muted-foreground leading-relaxed">
                                        {opt.descKo}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="rounded-[14px] border-[1.5px] border-border bg-white dark:bg-slate-900 p-5">
                        <div className="flex flex-col gap-1 mb-3">
                            <span className="text-[13.5px] font-bold text-slate-800 dark:text-slate-100">{customTitle.ko}</span>
                            <span className="text-[11.5px] text-muted-foreground leading-relaxed">{customSub.ko}</span>
                        </div>
                        <textarea
                            value={customNote}
                            onChange={(e) => setCustomNote(e.target.value)}
                            placeholder={customPlaceholder.ko}
                            rows={4}
                            className="w-full px-3.5 py-3 border-[1.5px] border-border rounded-lg text-[13px] font-[inherit] text-foreground bg-slate-50 dark:bg-slate-800 resize-y outline-none transition-colors focus:border-[#4ecdc4] focus:bg-white dark:focus:bg-slate-900 placeholder:text-muted-foreground leading-relaxed"
                        />
                    </div>

                    <div className="rounded-xl border-[1.5px] border-border bg-white dark:bg-slate-900 px-5 py-3.5 flex flex-wrap items-center gap-3">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                            {selectedLabel.ko}
                        </span>
                        <div className="flex flex-wrap gap-2 items-center">
                            {selectedIds.length === 0 ? (
                                <span className="text-xs text-muted-foreground/70 italic">{noSelected.ko}</span>
                            ) : (
                                selectedIds.map((id) => (
                                    <span
                                        key={id}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(78,205,196,0.12)] border border-[rgba(78,205,196,0.3)] text-xs font-semibold text-[#2ea89e]"
                                    >
                                        ✓ {NAME_MAP[id] ?? id}
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeFromSummary(id); }}
                                            className="opacity-60 hover:opacity-100 transition-opacity"
                                            aria-label="Remove"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                    <DiagnosisFieldErrorMessage
                        fieldKey="organizational_structure"
                        inertiaError={inertiaOrgStructureErr}
                    />
                </div>
    );
    if (embedMode) return <>{innerContent}</>;
    return (
        <>
            <Head title={`Organizational Structure - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title={tr('orgStructureTitle')}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="organizational-charts"
                nextRoute="job-structure"
                formData={{ org_structure_types: selectedIds, org_structure_explanations: { ...data.org_structure_explanations, custom: customNote } }}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                {innerContent}
            </FormLayout>
        </>
    );
}
