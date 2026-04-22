import { Head, useForm } from '@inertiajs/react';
import { X, Check } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { DiagnosisFieldErrorMessage } from '@/components/Diagnosis/DiagnosisFieldErrorsContext';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { OrgStructureDiagram } from '@/components/Diagnosis/OrgStructureDiagrams';
import { useTranslation } from 'react-i18next';
import { useDiagnosisDraftHydrate } from '@/hooks/useDiagnosisDraftHydrate';
import { cn } from '@/lib/utils';
import { translateStaticOnly } from '@/lib/translateStaticOnly';

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

// Dynamic Structure Options with translation keys
const STRUCTURE_OPTIONS = [
    { 
        id: 'functional', 
        nameKey: 'diagnosis_org_structure.functional.name',
        descKey: 'diagnosis_org_structure.functional.desc'
    },
    { 
        id: 'divisional', 
        nameKey: 'diagnosis_org_structure.divisional.name',
        descKey: 'diagnosis_org_structure.divisional.desc'
    },
    { 
        id: 'matrix', 
        nameKey: 'diagnosis_org_structure.matrix.name',
        descKey: 'diagnosis_org_structure.matrix.desc'
    },
    { 
        id: 'hq', 
        nameKey: 'diagnosis_org_structure.hq.name',
        descKey: 'diagnosis_org_structure.hq.desc'
    },
    { 
        id: 'tft', 
        nameKey: 'diagnosis_org_structure.tft.name',
        descKey: 'diagnosis_org_structure.tft.desc'
    },
    { 
        id: 'flat', 
        nameKey: 'diagnosis_org_structure.flat.name',
        descKey: 'diagnosis_org_structure.flat.desc'
    },
    { 
        id: 'undefined', 
        nameKey: 'diagnosis_org_structure.undefined.name',
        descKey: 'diagnosis_org_structure.undefined.desc'
    },
];

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
    const { t } = useTranslation();
    const tx = (key: string) =>
        translateStaticOnly(t, key, ['diagnosis_org_structure.']);

    const [selectedIds, setSelectedIds] = useState<string[]>(() =>
        normalizeLoadedTypes(diagnosis?.org_structure_types)
    );

    const [customNote, setCustomNote] = useState(() => {
        const expl = diagnosis?.org_structure_explanations;
        return expl && typeof expl === 'object' ? (expl as Record<string, string>)['custom'] ?? '' : '';
    });

    const internalForm = useForm({
        org_structure_types: [] as string[],
        org_structure_explanations: {} as Record<string, string>,
    });

    const useEmbed = embedMode && embedData != null && embedSetData;
    const data = useEmbed ? { ...internalForm.data, ...embedData } as typeof internalForm.data : internalForm.data;
    const setData = useEmbed ? (k: string, v: unknown) => embedSetData(k, v) : internalForm.setData;
    const lastSyncedPayloadRef = useRef('');

    const inertiaOrgStructureErr = 
        typeof internalForm.errors.org_structure_types === 'string' 
            ? internalForm.errors.org_structure_types 
            : undefined;

    // Hydrate from draft
    useDiagnosisDraftHydrate(
        projectId,
        'organizational-structure',
        (patch) => {
            if (Array.isArray(patch.org_structure_types)) setSelectedIds(patch.org_structure_types);
            const expl = patch.org_structure_explanations as any;
            if (expl && typeof expl === 'object' && typeof expl.custom === 'string') {
                setCustomNote(expl.custom);
            }
        },
        { enabled: !embedMode && !readOnly }
    );

    useEffect(() => {
        const payload = {
            org_structure_types: selectedIds,
            org_structure_explanations: { custom: customNote },
        };
        const sig = JSON.stringify(payload);
        if (lastSyncedPayloadRef.current === sig) return;
        lastSyncedPayloadRef.current = sig;
        setData('org_structure_types', payload.org_structure_types);
        setData('org_structure_explanations', payload.org_structure_explanations);
    }, [selectedIds, customNote, setData]);

    const toggle = (id: string) => {
        if (readOnly) return;
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const removeFromSummary = (id: string) => {
        setSelectedIds((prev) => prev.filter((x) => x !== id));
    };

    // Get translated name and description
    const getTranslatedOption = (option: typeof STRUCTURE_OPTIONS[0]) => ({
        id: option.id,
        name: tx(option.nameKey),
        desc: tx(option.descKey),
    });

    const innerContent = (
        <div className="space-y-6">
            <div>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                    {t('diagnosis_org_structure.description')}
                </p>
            </div>

            {/* Structure Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STRUCTURE_OPTIONS.map((opt) => {
                    const translated = getTranslatedOption(opt);
                    const isSelected = selectedIds.includes(opt.id);

                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggle(opt.id)}
                            disabled={readOnly}
                            className={cn(
                                'relative rounded-2xl border-2 p-7 pt-7 flex flex-col items-center gap-4 text-center transition-all duration-200 select-none cursor-pointer',
                                'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 dark:bg-[#1e3a5f] dark:border-[#2a3a5c] dark:hover:border-[#4a5a7c]',
                                isSelected && 'border-[#4ecdc4] bg-[rgba(78,205,196,0.12)] shadow-[0_0_0_1px_#4ecdc4] dark:bg-[#2EC4A9]/10'
                            )}
                        >
                            <span
                                className={cn(
                                    'absolute top-3.5 right-3.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center',
                                    isSelected 
                                        ? 'border-[#4ecdc4] bg-[#4ecdc4] text-white' 
                                        : 'border-slate-300 bg-white dark:border-[#4a5a7c] dark:bg-[#1e3a5f]'
                                )}
                            >
                                {isSelected && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                            </span>

                            <OrgStructureDiagram id={opt.id} />

                            <span className={cn(
                                'text-sm font-bold text-slate-800 dark:text-[#e2e8f0]',
                                isSelected && 'text-[#2ea89e]'
                            )}>
                                {translated.name}
                            </span>

                            <span className="text-xs text-muted-foreground leading-relaxed">
                                {translated.desc}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Custom Note */}
            <div className="rounded-[14px] border-[1.5px] border-border bg-white p-5 dark:bg-[#1a2744]">
                <div className="flex flex-col gap-1 mb-3">
                    <span className="text-[13.5px] font-bold text-slate-800 dark:text-[#e2e8f0]">
                        {t('diagnosis_org_structure.customTitle')}
                    </span>
                    <span className="text-[11.5px] text-muted-foreground">
                        {t('diagnosis_org_structure.customSubtitle')}
                    </span>
                </div>
                <textarea
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder={t('diagnosis_org_structure.customPlaceholder')}
                    rows={4}
                    className="w-full px-3.5 py-3 border-[1.5px] border-border rounded-lg text-[13px] bg-slate-50 resize-y outline-none focus:border-[#4ecdc4] focus:bg-white placeholder:text-muted-foreground dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0] dark:focus:bg-[#1e3a5f]"
                />
            </div>

            {/* Selected Summary */}
            <div className="rounded-xl border-[1.5px] border-border bg-white px-5 py-3.5 flex flex-wrap items-center gap-3 dark:bg-[#1a2744]">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                    {t('diagnosis_org_structure.selectedLabel')}
                </span>
                <div className="flex flex-wrap gap-2 items-center">
                    {selectedIds.length === 0 ? (
                        <span className="text-xs text-muted-foreground/70 italic">
                            {t('diagnosis_org_structure.noStructureSelected')}
                        </span>
                    ) : (
                        selectedIds.map((id) => {
                            const option = STRUCTURE_OPTIONS.find(o => o.id === id);
                            const name = option ? tx(option.nameKey) : id;
                            return (
                                <span
                                    key={id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(78,205,196,0.12)] border border-[rgba(78,205,196,0.3)] text-xs font-semibold text-[#2ea89e]"
                                >
                                    ✓ {name}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeFromSummary(id); }}
                                        className="opacity-60 hover:opacity-100"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })
                    )}
                </div>
            </div>

            <DiagnosisFieldErrorMessage
                fieldKey="org_structure_types"
                inertiaError={inertiaOrgStructureErr}
            />
        </div>
    );

    if (embedMode) return <>{innerContent}</>;

    return (
        <>
            <Head
                title={t('page_heads.organizational_structure', {
                    company:
                        company?.name ||
                        project?.company?.name ||
                        t('page_head_fallbacks.company'),
                })}
            />
            <FormLayout
                title={t('diagnosis_org_structure.title')}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="organizational-charts"
                nextRoute="job-structure"
                formData={{
                    org_structure_types: selectedIds,
                    org_structure_explanations: { custom: customNote },
                }}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                {innerContent}
            </FormLayout>
        </>
    );
}

// Helper function
function normalizeLoadedTypes(types: string[] | undefined): string[] {
    if (!types?.length) return [];
    return types.map((t) => {
        if (t === 'hq_subsidiary') return 'hq';
        if (t === 'no_defined') return 'undefined';
        return t;
    }).filter(Boolean);
}