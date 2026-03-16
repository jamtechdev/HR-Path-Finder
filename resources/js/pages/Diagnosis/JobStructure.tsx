import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { both, tr } from '@/config/diagnosisTranslations';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const SEP = '|';

interface JobFunction {
    id: number;
    name: string;
}

interface JobCategory {
    id: number;
    name: string;
    functions: JobFunction[];
}

interface Diagnosis {
    id: number;
    job_categories?: string[];
    job_functions?: string[];
    job_grade_names?: string[];
    job_grade_headcounts?: Record<string, number>;
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

function buildCategoriesFromDiagnosis(diagnosis?: Diagnosis | null): JobCategory[] {
    const cats = diagnosis?.job_categories ?? [];
    const fns = diagnosis?.job_functions ?? [];
    const hasPrefix = fns.some((s) => typeof s === 'string' && s.includes(SEP));
    if (hasPrefix) {
        const byCategory: Record<string, string[]> = {};
        fns.forEach((s) => {
            const str = String(s);
            const idx = str.indexOf(SEP);
            if (idx > 0) {
                const cat = str.slice(0, idx).trim();
                const fn = str.slice(idx + 1).trim();
                if (fn) {
                    if (!byCategory[cat]) byCategory[cat] = [];
                    if (!byCategory[cat].includes(fn)) byCategory[cat].push(fn);
                }
            }
        });
        const list: JobCategory[] = [];
        const seen = new Set<string>();
        cats.forEach((name) => {
            const n = String(name).trim();
            if (!n || seen.has(n)) return;
            seen.add(n);
            list.push({
                id: list.length + 1,
                name: n,
                functions: (byCategory[n] ?? []).map((fn, i) => ({ id: (list.length + 1) * 100 + i, name: fn })),
            });
        });
        Object.keys(byCategory).forEach((n) => {
            if (seen.has(n)) return;
            seen.add(n);
            list.push({
                id: list.length + 1,
                name: n,
                functions: byCategory[n].map((fn, i) => ({ id: (list.length + 1) * 100 + i, name: fn })),
            });
        });
        return list.length ? list : [{ id: 1, name: 'Management', functions: [] }, { id: 2, name: 'Support', functions: [] }];
    }
    if (cats.length === 0 && fns.length === 0) {
        return [
            { id: 1, name: 'Management', functions: [{ id: 101, name: 'HR' }, { id: 102, name: 'General Affairs' }, { id: 103, name: 'Finance' }] },
            { id: 2, name: 'Support', functions: [{ id: 201, name: 'IT' }, { id: 202, name: 'Treasury' }] },
        ];
    }
    const list: JobCategory[] = cats.length
        ? cats.map((name, i) => ({ id: i + 1, name: String(name).trim(), functions: [] as JobFunction[] }))
        : [{ id: 1, name: 'General', functions: [] }];
    fns.forEach((fn, i) => {
        const name = String(fn).trim();
        if (!name) return;
        if (list[0]) {
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
    const [categories, setCategories] = useState<JobCategory[]>(() => buildCategoriesFromDiagnosis(diagnosis));
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
    const data = useEmbed ? { ...internalForm.data, ...embedData } as typeof internalForm.data : internalForm.data;
    const setData = useEmbed ? (k: string, v: unknown) => embedSetData(k, v) : internalForm.setData;

    useEffect(() => {
        setData(
            'job_categories',
            categories.map((c) => c.name)
        );
        setData(
            'job_functions',
            categories.flatMap((c) => c.functions.map((f) => `${c.name}${SEP}${f.name}`))
        );
    }, [categories]);

    const addCategory = () => {
        const name = newCategoryName.trim();
        if (!name) return;
        const newId = Math.max(0, ...categories.map((c) => c.id)) + 1;
        const newCat: JobCategory = { id: newId, name, functions: [] };
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
                    ? { ...c, functions: [...c.functions, { id: Date.now(), name }] }
                    : c
            )
        );
        setFnInput('');
    };

    const removeFunction = (fnId: number) => {
        if (!selectedCatId) return;
        setCategories((prev) =>
            prev.map((c) =>
                c.id === selectedCatId ? { ...c, functions: c.functions.filter((f) => f.id !== fnId) } : c
            )
        );
    };

    const titleEn = both('jobStructureTitle').en;
    const desc = both('jobStructureDesc');
    const categoryListLabel = both('jobCategoryList');
    const addCatBtn = both('addCategory');
    const functionsCount = both('functionsCount');
    const addCatPlaceholder = both('addCategoryPlaceholder');
    const confirmLabel = both('confirm');
    const cancelLabel = both('cancel');
    const addCategoryEmpty = both('addCategoryEmpty');
    const addFunctionBelow = both('addFunctionBelow');
    const selectCategoryLeft = both('selectCategoryLeft');

    const innerContent = (
                <div className="space-y-7">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{tr('jobStructureTitle')}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">{desc.ko}</p>
                        <p className="text-xs text-muted-foreground/80 mt-0.5">{desc.en}</p>
                    </div>

                    <div
                        className="grid grid-cols-1 md:grid-cols-[260px_1fr] rounded-xl border-[1.5px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden min-h-[460px]"
                        style={{ boxShadow: '0 1px 4px rgba(15,42,74,0.07)' }}
                    >
                        {/* Left: Category list */}
                        <div className="flex flex-col border-r border-slate-200 dark:border-slate-700">
                            <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    {categoryListLabel.ko}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setAddingCategory(true)}
                                    className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-0 rounded-md py-1 px-2.5 text-xs font-semibold cursor-pointer"
                                >
                                    {addCatBtn.ko}
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
                                            onKeyDown={(e) => e.key === 'Enter' && setSelectedCatId(cat.id)}
                                            className={cn(
                                                'flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer mb-0.5 transition-colors',
                                                isSelected ? 'bg-slate-900 dark:bg-slate-100' : 'hover:bg-muted/50'
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <div
                                                        className={cn(
                                                            'w-2 h-2 rounded-full flex-shrink-0',
                                                            isSelected ? 'bg-yellow-500' : 'bg-slate-300 dark:bg-slate-600'
                                                        )}
                                                    />
                                                    {idx < categories.length - 1 && (
                                                        <div
                                                            className="w-[1.5px] h-4 mt-0.5"
                                                            style={{
                                                                background: isSelected ? 'rgba(200,168,75,0.27)' : '#e2e8f0',
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <div
                                                        className={cn(
                                                            'text-sm font-medium',
                                                            isSelected ? 'text-white dark:text-slate-900 font-bold' : 'text-slate-900 dark:text-slate-100'
                                                        )}
                                                    >
                                                        {cat.name}
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            'text-[11px]',
                                                            isSelected ? 'text-yellow-500' : 'text-slate-400 dark:text-slate-500'
                                                        )}
                                                    >
                                                        {functionsCount.ko} {cat.functions.length}{both('functionsCountSuffix').ko}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeCategory(cat.id);
                                                }}
                                                className={cn(
                                                    'bg-transparent border-0 cursor-pointer text-sm p-0.5 leading-none',
                                                    isSelected ? 'text-white/40 dark:text-slate-900/40 hover:text-white dark:hover:text-slate-900' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-500'
                                                )}
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                                {addingCategory && (
                                    <div className="p-2">
                                        <input
                                            autoFocus
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') addCategory();
                                                if (e.key === 'Escape') {
                                                    setAddingCategory(false);
                                                    setNewCategoryName('');
                                                }
                                            }}
                                            placeholder={addCatPlaceholder.ko}
                                            className="w-full border-[1.5px] border-slate-900 dark:border-slate-100 rounded-md py-2 px-2.5 text-[13px] text-slate-900 dark:text-slate-100 outline-none"
                                        />
                                        <div className="flex gap-1.5 mt-1.5">
                                            <button
                                                type="button"
                                                onClick={addCategory}
                                                className="flex-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-0 rounded-md py-2 text-xs font-semibold cursor-pointer"
                                            >
                                                {confirmLabel.ko}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAddingCategory(false);
                                                    setNewCategoryName('');
                                                }}
                                                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0 rounded-md py-2 text-xs font-semibold cursor-pointer"
                                            >
                                                {cancelLabel.ko}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {categories.length === 0 && !addingCategory && (
                                    <div className="py-6 px-3 text-center text-slate-300 dark:text-slate-600 text-sm">
                                        {addCategoryEmpty.ko}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Functions for selected category */}
                        <div className="flex flex-col">
                            {selectedCat ? (
                                <>
                                    <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                        <span className="text-[15px] font-bold text-slate-900 dark:text-slate-100">{selectedCat.name}</span>
                                        <span className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full py-0.5 px-2.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                                            {functionsCount.ko} {selectedCat.functions.length}{both('functionsCountSuffix').ko}
                                        </span>
                                    </div>
                                    <div className="flex-1 p-5 overflow-y-auto">
                                        {selectedCat.functions.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                                <div className="text-3xl mb-2">＋</div>
                                                <div className="text-sm">{addFunctionBelow.ko}</div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedCat.functions.map((fn) => (
                                                    <span
                                                        key={fn.id}
                                                        className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-full text-[13px] font-semibold text-blue-700 dark:text-blue-300"
                                                    >
                                                        {fn.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFunction(fn.id)}
                                                            className="bg-transparent border-0 text-slate-400 dark:text-slate-500 cursor-pointer p-0 leading-none hover:text-slate-600 dark:hover:text-slate-300"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex gap-2">
                                        <input
                                            value={fnInput}
                                            onChange={(e) => setFnInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addFunction()}
                                            placeholder={tr('addFunctionPlaceholder').replace(/\{\{name\}\}/g, selectedCat.name)}
                                            className="flex-1 border-[1.5px] border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-3.5 text-[13px] text-slate-800 dark:text-slate-100 outline-none bg-white dark:bg-slate-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={addFunction}
                                            className="bg-[#c8a84b] text-white border-0 rounded-lg py-2.5 px-4 text-[13px] font-semibold cursor-pointer whitespace-nowrap"
                                        >
                                            {tr('addFunctionBtn')}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm gap-2">
                                    <div className="text-3xl">←</div>
                                    <div>{selectCategoryLeft.ko}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Headcount per Job Grade - from Job Grades step */}
                    {diagnosis?.job_grade_names?.length ? (() => {
                        const names = diagnosis.job_grade_names;
                        const headcounts = (diagnosis.job_grade_headcounts ?? {}) as Record<string, number>;
                        const rows = names.map((name) => ({ name, headcount: Number(headcounts[name]) || 0 }));
                        const total = rows.reduce((s, r) => s + r.headcount, 0);
                        return (
                            <div className="mt-6 rounded-xl border-[1.5px] border-[#e2e8f0] bg-white overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(15,42,74,0.07)' }}>
                                <div className="px-4 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc]">
                                    <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">
                                        {tr('gradePyramidTitle')}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#e2e8f0]">
                                                <th className="pb-2 text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Job Grade</th>
                                                <th className="pb-2 text-right text-[11px] font-bold text-[#64748b] uppercase tracking-wider">{tr('headcount')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row, i) => (
                                                <tr key={`grade-${i}-${row.name}`} className="border-b border-[#f1f5f9] last:border-0">
                                                    <td className="py-2.5 text-[13px] font-semibold text-[#0f2a4a]">{row.name}</td>
                                                    <td className="py-2.5 text-right text-[13px] font-medium text-[#0f2a4a]">{row.headcount}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-[#f8fafc] font-bold">
                                                <td className="py-2.5 pl-0 text-[13px] text-[#0f2a4a]">{tr('totalHeadcount')}</td>
                                                <td className="py-2.5 text-right text-[13px] text-[#0f2a4a]">{total}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })() : null}
                </div>
    );
    if (embedMode) return <>{innerContent}</>;
    return (
        <>
            <Head title={`Job Structure - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title={titleEn}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="organizational-structure"
                nextRoute="hr-issues"
                formData={data}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                {innerContent}
            </FormLayout>
        </>
    );
}
