import { DiagnosisFieldErrorMessage } from '@/components/Diagnosis/DiagnosisFieldErrorsContext';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateStaticOnly } from '@/lib/translateStaticOnly';

const SEP = '|';

interface JobFunction {
    id: number;
    name: string;
}

interface JobCategory {
    id: number;
    nameKey: string; // ← Changed: ab nameKey store hoga
    functions: JobFunction[];
}

interface Diagnosis {
    id: number;
    job_categories?: string[]; // translation keys
    job_functions?: string[];
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

// Default Categories with Translation Keys
const DEFAULT_CATEGORIES: JobCategory[] = [
    {
        id: 1,
        nameKey: 'diagnosis_job_structure.default.management',
        functions: [
            { id: 101, name: 'HR' },
            { id: 102, name: 'General Affairs' },
            { id: 103, name: 'Finance' },
        ],
    },
    {
        id: 2,
        nameKey: 'diagnosis_job_structure.default.support',
        functions: [
            { id: 201, name: 'IT' },
            { id: 202, name: 'Treasury' },
        ],
    },
];

function buildCategoriesFromDiagnosis(
    diagnosis?: Diagnosis | null,
): JobCategory[] {
    const cats = diagnosis?.job_categories ?? [];
    const fns = diagnosis?.job_functions ?? [];

    const hasPrefix = fns.some((s) => typeof s === 'string' && s.includes(SEP));

    if (hasPrefix) {
        const byCategory: Record<string, string[]> = {};
        fns.forEach((s) => {
            const str = String(s);
            const idx = str.indexOf(SEP);
            if (idx > 0) {
                const catKey = str.slice(0, idx).trim();
                const fn = str.slice(idx + 1).trim();
                if (fn) {
                    if (!byCategory[catKey]) byCategory[catKey] = [];
                    if (!byCategory[catKey].includes(fn))
                        byCategory[catKey].push(fn);
                }
            }
        });

        const list: JobCategory[] = [];
        const seen = new Set<string>();

        cats.forEach((catKey) => {
            const key = String(catKey).trim();
            if (!key || seen.has(key)) return;
            seen.add(key);
            list.push({
                id: list.length + 1,
                nameKey: key,
                functions: (byCategory[key] ?? []).map((fn, i) => ({
                    id: (list.length + 1) * 100 + i,
                    name: fn,
                })),
            });
        });

        Object.keys(byCategory).forEach((key) => {
            if (seen.has(key)) return;
            seen.add(key);
            list.push({
                id: list.length + 1,
                nameKey: key,
                functions: byCategory[key].map((fn, i) => ({
                    id: (list.length + 1) * 100 + i,
                    name: fn,
                })),
            });
        });

        return list.length ? list : [...DEFAULT_CATEGORIES];
    }

    // Fallback to default
    if (cats.length === 0 && fns.length === 0) {
        return [...DEFAULT_CATEGORIES];
    }

    const list: JobCategory[] = cats.length
        ? cats.map((nameKey, i) => ({
              id: i + 1,
              nameKey: String(nameKey).trim(),
              functions: [],
          }))
        : [
              {
                  id: 1,
                  nameKey: 'diagnosis_job_structure.default.general',
                  functions: [],
              },
          ];

    fns.forEach((fn, i) => {
        const name = String(fn).trim();
        if (name && list[0]) {
            list[0].functions.push({ id: 1000 + i, name });
        }
    });

    return list;
}

export default function JobStructure({
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
    const labelOf = (value: string) =>
        translateStaticOnly(t, value, ['diagnosis_job_structure.default.']);

    const [categories, setCategories] = useState<JobCategory[]>(() =>
        buildCategoriesFromDiagnosis(diagnosis),
    );
    const [selectedCatId, setSelectedCatId] = useState<number | null>(() => {
        const list = buildCategoriesFromDiagnosis(diagnosis);
        return list.length > 0 ? list[0].id : null;
    });

    const [newCategoryName, setNewCategoryName] = useState('');
    const [fnInput, setFnInput] = useState('');
    const [addingCategory, setAddingCategory] = useState(false);

    const selectedCat = categories.find((c) => c.id === selectedCatId);

    const internalForm = useForm({
        job_categories: [] as string[],
        job_functions: [] as string[],
    });

    const useEmbed = embedMode && embedData != null && embedSetData;
    const data = useEmbed
        ? ({ ...internalForm.data, ...embedData } as typeof internalForm.data)
        : internalForm.data;
    const setData = useEmbed
        ? (k: string, v: unknown) => embedSetData(k, v)
        : internalForm.setData;

    const inertiaJobStructureErr =
        typeof internalForm.errors.job_categories === 'string'
            ? internalForm.errors.job_categories
            : typeof internalForm.errors.job_functions === 'string'
              ? internalForm.errors.job_functions
              : undefined;

    // Sync to form
    useEffect(() => {
        setData(
            'job_categories',
            categories.map((c) => c.nameKey),
        );
        setData(
            'job_functions',
            categories.flatMap((c) =>
                c.functions.map((f) => `${c.nameKey}${SEP}${f.name}`),
            ),
        );
    }, [categories, setData]);

    const addCategory = () => {
        const trimmed = newCategoryName.trim();
        if (!trimmed) return;

        const newId = Math.max(0, ...categories.map((c) => c.id)) + 1;
        const newCat: JobCategory = {
            id: newId,
            // Keep user-entered label as-is for dynamic categories; known keys still translate via labelOf().
            nameKey: trimmed,
            functions: [],
        };

        setCategories((prev) => [...prev, newCat]);
        setSelectedCatId(newCat.id);
        setNewCategoryName('');
        setAddingCategory(false);
    };

    const removeCategory = (catId: number) => {
        const remaining = categories.filter((c) => c.id !== catId);
        setCategories(remaining);
        if (selectedCatId === catId) {
            setSelectedCatId(remaining.length > 0 ? remaining[0].id : null);
        }
    };

    const addFunction = () => {
        const name = fnInput.trim();
        if (!name || !selectedCatId) return;

        setCategories((prev) =>
            prev.map((c) =>
                c.id === selectedCatId
                    ? {
                          ...c,
                          functions: [...c.functions, { id: Date.now(), name }],
                      }
                    : c,
            ),
        );
        setFnInput('');
    };

    const removeFunction = (fnId: number) => {
        if (!selectedCatId) return;
        setCategories((prev) =>
            prev.map((c) =>
                c.id === selectedCatId
                    ? {
                          ...c,
                          functions: c.functions.filter((f) => f.id !== fnId),
                      }
                    : c,
            ),
        );
    };

    const innerContent = (
        <div className="space-y-7">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-[#e2e8f0]">
                    {t('diagnosis_job_structure.title')}
                </h1>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-[#9AA3B2]">
                    {t('diagnosis_job_structure.description')}
                </p>
            </div>

            <div
                className="grid min-h-[460px] grid-cols-1 overflow-hidden rounded-xl border-[1.5px] border-slate-200 bg-white md:grid-cols-[260px_1fr] dark:border-[#2a3a5c] dark:bg-[#1a2744]"
                style={{ boxShadow: '0 1px 4px rgba(15,42,74,0.07)' }}
            >
                {/* Left: Category List */}
                <div className="flex flex-col border-r border-slate-200 dark:border-[#2a3a5c]">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/30">
                        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-[#6B7585]">
                            {t('diagnosis_job_structure.categoryList')}
                        </span>
                        <button
                            type="button"
                            onClick={() => setAddingCategory(true)}
                            className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white"
                        >
                            {t('diagnosis_job_structure.addCategoryBtn')}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {categories.map((cat, idx) => {
                            const isSelected = cat.id === selectedCatId;
                            return (
                                <div
                                    key={cat.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelectedCatId(cat.id)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' &&
                                        setSelectedCatId(cat.id)
                                    }
                                    className={cn(
                                        'mb-0.5 flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition-colors relative',
                                        isSelected
                                            ? 'bg-slate-900 text-white dark:bg-[#2EC4A9]/20 dark:text-[#2EC4A9]'
                                            : 'hover:bg-slate-100 dark:hover:bg-[#1e3a5f]/30',
                                    )}
                                >
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <div
                                                className={cn(
                                                    'h-2 w-2 rounded-full',
                                                    isSelected
                                                        ? 'bg-yellow-500'
                                                        : 'bg-slate-300 dark:bg-[#4a5a7c]',
                                                )}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div
                                                className={cn(
                                                    'truncate text-sm font-medium',
                                                    isSelected && 'font-bold',
                                                )}
                                            >
                                                {labelOf(cat.nameKey)}
                                            </div>
                                            <div
                                                className={cn(
                                                    'text-[11px]',
                                                    isSelected
                                                        ? 'text-yellow-400'
                                                        : 'text-slate-400 dark:text-[#6B7585]',
                                                )}
                                            >
                                                {t(
                                                    'diagnosis_job_structure.functionsCount',
                                                    {
                                                        count: cat.functions
                                                            .length,
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (
                                                cat.functions.length > 0 &&
                                                !window.confirm(
                                                    t(
                                                        'diagnosis_job_structure.confirmRemoveCategory',
                                                        {
                                                            name: labelOf(cat.nameKey),
                                                        },
                                                    ),
                                                )
                                            ) {
                                                return;
                                            }
                                            removeCategory(cat.id);
                                        }}
                                        className="p-1 text-slate-400 hover:text-red-600 absolute right-0 top-0 dark:text-[#6B7585]"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        })}

                        {addingCategory && (
                            <div className="p-2">
                                <input
                                    autoFocus
                                    value={newCategoryName}
                                    onChange={(e) =>
                                        setNewCategoryName(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') addCategory();
                                        if (e.key === 'Escape') {
                                            setAddingCategory(false);
                                            setNewCategoryName('');
                                        }
                                    }}
                                    placeholder={t(
                                        'diagnosis_job_structure.addCategoryPlaceholder',
                                    )}
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]"
                                />
                                <div className="mt-2 flex gap-2">
                                    <button
                                        onClick={addCategory}
                                        className="flex-1 rounded-md bg-slate-900 py-2 text-xs font-semibold text-white dark:bg-[#2EC4A9] dark:text-[#1a2744]"
                                    >
                                        {t('diagnosis_job_structure.confirm')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAddingCategory(false);
                                            setNewCategoryName('');
                                        }}
                                        className="flex-1 rounded-md bg-slate-100 py-2 text-xs font-semibold dark:bg-[#2a3a5c] dark:text-[#CBD0DA]"
                                    >
                                        {t('diagnosis_job_structure.cancel')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {categories.length === 0 && !addingCategory && (
                            <div className="py-8 text-center text-sm text-slate-400">
                                {t('diagnosis_job_structure.noCategories')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Functions Panel */}
                <div className="flex flex-col">
                    {selectedCat ? (
                        <>
                            <div className="flex items-center gap-2.5 border-b border-slate-200 bg-slate-50 px-5 py-3.5 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/30">
                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                <span className="text-[15px] font-bold dark:text-[#e2e8f0]">
                                    {labelOf(selectedCat.nameKey)}
                                </span>
                                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    {t(
                                        'diagnosis_job_structure.functionsCount',
                                        { count: selectedCat.functions.length },
                                    )}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5">
                                {selectedCat.functions.length === 0 ? (
                                    <div className="flex h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-slate-400 dark:border-[#2a3a5c] dark:text-[#6B7585]">
                                        <div className="mb-2 text-3xl">＋</div>
                                        <div>
                                            {t(
                                                'diagnosis_job_structure.addFunctionBelow',
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedCat.functions.map((fn) => (
                                            <span
                                                key={fn.id}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-300"
                                            >
                                                {fn.name}
                                                <button
                                                    onClick={() =>
                                                        removeFunction(fn.id)
                                                    }
                                                    className="text-blue-400 hover:text-blue-600"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/30">
                                <input
                                    value={fnInput}
                                    onChange={(e) => setFnInput(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && addFunction()
                                    }
                                    placeholder={t(
                                        'diagnosis_job_structure.addFunctionPlaceholder',
                                        { category: labelOf(selectedCat.nameKey) },
                                    )}
                                    className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none dark:border-[#2a3a5c] dark:bg-[#1e3a5f]/20 dark:text-[#e2e8f0]"
                                />
                                <button
                                    onClick={addFunction}
                                    className="rounded-lg bg-[#c8a84b] px-5 text-sm font-semibold whitespace-nowrap text-white"
                                >
                                    {t(
                                        'diagnosis_job_structure.addFunctionBtn',
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-slate-400">
                            <div className="text-3xl">←</div>
                            <div>
                                {t(
                                    'diagnosis_job_structure.selectCategoryLeft',
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <DiagnosisFieldErrorMessage
                fieldKey="job_structure"
                inertiaError={inertiaJobStructureErr}
            />
        </div>
    );

    if (embedMode) return <>{innerContent}</>;

    return (
        <>
            <Head
                title={t('page_heads.job_structure', {
                    company:
                        company?.name ||
                        project?.company?.name ||
                        t('page_head_fallbacks.company'),
                    defaultValue: `Job Structure - ${company?.name || project?.company?.name || t('page_head_fallbacks.company', { defaultValue: 'Company' })}`,
                })}
            />
            <FormLayout
                title={t('diagnosis_job_structure.title')}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="organizational-structure"
                nextRoute="hr-issues"
                formData={data}
                saveRoute={
                    projectId ? `/hr-manager/diagnosis/${projectId}` : undefined
                }
            >
                {innerContent}
            </FormLayout>
        </>
    );
}
