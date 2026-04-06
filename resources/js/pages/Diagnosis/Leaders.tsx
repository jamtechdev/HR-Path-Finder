import { DiagnosisFieldErrorMessage } from '@/components/Diagnosis/DiagnosisFieldErrorsContext';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { useDiagnosisDraftHydrate } from '@/hooks/useDiagnosisDraftHydrate';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { Check, GripVertical, Info, Plus } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Diagnosis {
    id: number;
    leadership_count?: number;
    leadership_percentage?: number;
    present_headcount?: number;
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

const PRESET_LEADERS: {
    id: string;
    label: string;
    korean: string;
    desc: string;
    icon: string;
}[] = [
    {
        id: 'DH',
        label: 'Division Head',
        korean: '본부장',
        desc: 'Oversees an entire business division',
        icon: '🏢',
    },
    {
        id: 'DeptH',
        label: 'Department Head',
        korean: '부서장',
        desc: 'Manages a specific department',
        icon: '🏬',
    },
    {
        id: 'TL',
        label: 'Team Leader',
        korean: '팀장',
        desc: 'Leads a cross-functional team',
        icon: '👥',
    },
    {
        id: 'GL',
        label: 'Group Leader',
        korean: '그룹장',
        desc: 'Manages a sub-group within a team',
        icon: '🔷',
    },
    {
        id: 'PL',
        label: 'Part Leader',
        korean: '파트장',
        desc: 'Oversees a specific work unit',
        icon: '📌',
    },
];

export default function Leaders({
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

    const workforceFromDiagnosis = diagnosis?.present_headcount ?? 100;

    const [totalWorkforce, setTotalWorkforce] = useState(
        workforceFromDiagnosis,
    );
    const [selected, setSelected] = useState<Set<string>>(() => {
        const total = diagnosis?.leadership_count ?? 0;
        if (total > 0) return new Set(['TL']);
        return new Set(['DH', 'DeptH', 'TL']);
    });

    const [counts, setCounts] = useState<Record<string, number>>(() => {
        const total = diagnosis?.leadership_count ?? 0;
        const c: Record<string, number> = {
            DH: 2,
            DeptH: 1,
            TL: 10,
            GL: 1,
            PL: 1,
        };
        if (total > 0) {
            c.TL = Math.max(1, total);
            c.DH = 2;
            c.DeptH = 1;
        }
        return c;
    });

    const [customRows, setCustomRows] = useState<
        Array<{ id: string; label: string; korean: string; count: number }>
    >([]);
    const [customInputVisible, setCustomInputVisible] = useState(false);
    const [customTitle, setCustomTitle] = useState('');
    const [customKorean, setCustomKorean] = useState('');
    const customIdRef = useRef(0);
    const [order, setOrder] = useState<string[]>(() => [
        ...PRESET_LEADERS.map((l) => l.id),
    ]);
    const [draggingKey, setDraggingKey] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<{
        key: string;
        top: boolean;
    } | null>(null);
    const justDraggedRef = useRef(false);

    const internalForm = useForm({
        leadership_count: diagnosis?.leadership_count ?? 0,
    });

    const useEmbed = embedMode && embedData != null && embedSetData;
    const data = useEmbed
        ? ({ ...internalForm.data, ...embedData } as typeof internalForm.data)
        : internalForm.data;
    const setData = useEmbed
        ? (k: string, v: unknown) => embedSetData(k, v)
        : internalForm.setData;
    const { errors: leadersErrors } = internalForm;

    // Computed values
    const allSelected = [
        ...PRESET_LEADERS.filter((l) => selected.has(l.id)).map((l) => ({
            label: l.label,
            korean: l.korean,
            count: counts[l.id] ?? 1,
        })),
        ...customRows
            .filter((r) => selected.has(r.id))
            .map((r) => ({
                label: r.label,
                korean: r.korean,
                count: counts[r.id] ?? r.count,
            })),
    ];

    const totalPos = allSelected.length;
    const totalHead = allSelected.reduce((s, r) => s + r.count, 0);
    const ratioPctRaw =
        totalWorkforce > 0 ? (totalHead / totalWorkforce) * 100 : null;
    const ratioPct =
        ratioPctRaw == null ? null : Math.min(100, ratioPctRaw).toFixed(1);
    const ratioNum = totalWorkforce > 0 ? Math.min(100, ratioPctRaw ?? 0) : 0;
    const tooManyLeaders = totalWorkforce > 0 && totalHead > totalWorkforce;

    // Auto reduce leaders if exceeds workforce
    useEffect(() => {
        if (
            embedMode ||
            readOnly ||
            totalWorkforce <= 0 ||
            totalHead <= totalWorkforce
        )
            return;

        const ids = Array.from(selected);
        if (ids.length === 0) return;

        const excess = totalHead - totalWorkforce;
        setCounts((prev) => {
            const next = { ...prev };
            let remainingExcess = excess;
            let changed = false;

            const reducible = ids
                .map((id) => ({ id, count: next[id] ?? 1 }))
                .sort((a, b) => b.count - a.count);

            for (const r of reducible) {
                if (remainingExcess <= 0) break;
                const current = next[r.id] ?? 1;
                const canReduce = Math.max(0, current - 1);
                if (canReduce <= 0) continue;

                const dec = Math.min(canReduce, remainingExcess);
                const newVal = current - dec;
                if (newVal !== current) {
                    next[r.id] = newVal;
                    changed = true;
                }
                remainingExcess -= dec;
            }

            return changed ? next : prev;
        });
    }, [embedMode, readOnly, selected, totalHead, totalWorkforce]);

    // Hydrate from draft
    useDiagnosisDraftHydrate(
        projectId,
        'leaders',
        (patch) => {
            const ui = (patch.__draft_leaders as any) ?? null;
            if (!ui || typeof ui !== 'object') return;

            if (Array.isArray(ui.selectedIds))
                setSelected(new Set(ui.selectedIds.map(String)));
            if (ui.counts && typeof ui.counts === 'object')
                setCounts(ui.counts as Record<string, number>);
            if (Array.isArray(ui.customRows)) setCustomRows(ui.customRows);
            if (Array.isArray(ui.order)) setOrder(ui.order);
            if (typeof ui.totalWorkforce === 'number')
                setTotalWorkforce(ui.totalWorkforce);
        },
        { enabled: !embedMode && !readOnly },
    );

    useEffect(() => {
        setData('leadership_count', totalHead);
    }, [totalHead, setData]);

    // Save UI state to draft
    useEffect(() => {
        if (!projectId || embedMode || readOnly) return;
        (internalForm as any).setData('__draft_leaders', {
            selectedIds: Array.from(selected),
            counts,
            customRows,
            order,
            totalWorkforce,
        });
    }, [
        projectId,
        embedMode,
        readOnly,
        selected,
        counts,
        customRows,
        order,
        totalWorkforce,
        internalForm,
    ]);

    const toggleRow = useCallback(
        (key: string) => {
            if (readOnly) return;
            setSelected((prev) => {
                const next = new Set(prev);
                next.has(key) ? next.delete(key) : next.add(key);
                return next;
            });
        },
        [readOnly],
    );

    const computeTotalHeadFromCounts = useCallback(
        (nextCounts: Record<string, number>) =>
            Array.from(selected).reduce(
                (s, id) => s + (nextCounts[id] ?? 1),
                0,
            ),
        [selected],
    );

    const adj = useCallback(
        (key: string, delta: number) => {
            setCounts((prev) => {
                const next = { ...prev };
                let nextVal = Math.max(1, (prev[key] ?? 1) + delta);

                const nextTotal = computeTotalHeadFromCounts({
                    ...next,
                    [key]: nextVal,
                });

                if (
                    totalWorkforce > 0 &&
                    nextTotal > totalWorkforce &&
                    selected.has(key)
                ) {
                    const others = nextTotal - nextVal;
                    nextVal = Math.max(1, totalWorkforce - others);
                }

                next[key] = nextVal;
                return next;
            });
        },
        [computeTotalHeadFromCounts, totalWorkforce, selected],
    );

    const syncRow = useCallback(
        (key: string, value: number) => {
            setCounts((prev) => {
                const next = { ...prev };
                let nextVal = Math.max(1, value);

                const nextTotal = computeTotalHeadFromCounts({
                    ...next,
                    [key]: nextVal,
                });

                if (
                    totalWorkforce > 0 &&
                    nextTotal > totalWorkforce &&
                    selected.has(key)
                ) {
                    const others = nextTotal - nextVal;
                    nextVal = Math.max(1, totalWorkforce - others);
                }

                next[key] = nextVal;
                return next;
            });
        },
        [computeTotalHeadFromCounts, totalWorkforce, selected],
    );

    const openCustom = useCallback(() => {
        setCustomInputVisible(true);
        setCustomTitle('');
        setCustomKorean('');
    }, []);

    const cancelCustom = useCallback(() => {
        setCustomInputVisible(false);
        setCustomTitle('');
        setCustomKorean('');
    }, []);

    const confirmCustom = useCallback(() => {
        const label = customTitle.trim();
        if (!label) return;

        const id = `c${++customIdRef.current}`;
        const korean = customKorean.trim();

        setCustomRows((prev) => [...prev, { id, label, korean, count: 1 }]);
        setCounts((prev) => ({ ...prev, [id]: 1 }));
        setSelected((prev) => new Set(prev).add(id));
        setOrder((prev) => [...prev, id]);
        cancelCustom();
    }, [customTitle, customKorean, cancelCustom]);

    const removeCustomRow = useCallback((id: string) => {
        setCustomRows((prev) => prev.filter((r) => r.id !== id));
        setSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        setOrder((prev) => prev.filter((x) => x !== id));
    }, []);

    // Drag & Drop Handlers
    const handleDragStart = useCallback((e: React.DragEvent, key: string) => {
        setDraggingKey(key);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', key);
    }, []);

    const handleDragOver = useCallback(
        (e: React.DragEvent, key: string) => {
            e.preventDefault();
            if (draggingKey === key) return;
            const rect = (
                e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            const mid = rect.top + rect.height / 2;
            setDropTarget({ key, top: e.clientY < mid });
        },
        [draggingKey],
    );

    const handleDragLeave = useCallback(() => setDropTarget(null), []);

    const handleDrop = useCallback(
        (e: React.DragEvent, key: string) => {
            e.preventDefault();
            e.stopPropagation();

            const srcKey = e.dataTransfer.getData('text/plain') || draggingKey;
            if (!srcKey || srcKey === key) {
                setDropTarget(null);
                setDraggingKey(null);
                return;
            }

            const rect = (
                e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            const insertBeforeTarget = e.clientY < rect.top + rect.height / 2;

            setDropTarget(null);
            setDraggingKey(null);

            setOrder((prev) => {
                const i = prev.indexOf(srcKey);
                const j = prev.indexOf(key);
                if (i === -1 || j === -1) return prev;

                const next = [...prev];
                const [removed] = next.splice(i, 1);
                const newJ = next.indexOf(key);
                next.splice(insertBeforeTarget ? newJ : newJ + 1, 0, removed);
                return next;
            });
        },
        [draggingKey],
    );

    const isReadOnlyStatus = ['submitted', 'approved', 'locked'].includes(
        diagnosisStatus,
    );
    const isReadOnly = readOnly || isReadOnlyStatus;

    const innerContent = (
        <div className="mb-4 overflow-hidden rounded-[14px] border border-[#E2E6ED] bg-white shadow-[0_4px_20px_rgba(27,43,91,0.09)] sm:mb-5">
            {/* Hero Strip */}
            <div className="flex flex-col items-start gap-3 bg-gradient-to-br from-[#1B2B5B] to-[#243877] p-3 sm:p-4 sm:px-6 lg:flex-row lg:items-center lg:px-7">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#2EC4A9] sm:h-11 sm:w-11">
                    <svg
                        className="h-5 w-5 sm:h-[22px] sm:w-[22px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                    >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
                    </svg>
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="mb-1 text-base leading-tight font-bold text-white sm:text-[15px]">
                        {t('diagnosis_leaders.title')}
                    </h2>
                    <p className="text-xs leading-relaxed text-white/55 sm:text-[12px]">
                        {t('diagnosis_leaders.heroDesc')}
                    </p>
                </div>

                <div className="mt-2 flex w-full flex-wrap items-stretch gap-1.5 lg:mt-0 lg:ml-auto lg:w-auto lg:gap-2">
                    <div className="flex min-w-[58px] flex-1 flex-col justify-center rounded-lg bg-white/10 px-2 py-1 text-center sm:px-2.5 sm:py-1.5 lg:flex-none">
                        <div className="text-lg leading-none font-extrabold text-white sm:text-xl lg:text-[22px]">
                            {totalPos}
                        </div>
                        <div className="mt-0.5 text-xs text-white/50">
                            포지션 수
                        </div>
                    </div>
                    <div className="flex min-w-[58px] flex-1 flex-col justify-center rounded-lg bg-white/10 px-2 py-1 text-center sm:px-2.5 sm:py-1.5 lg:flex-none">
                        <div className="text-lg leading-none font-extrabold text-white sm:text-xl lg:text-[22px]">
                            {totalHead}
                        </div>
                        <div className="mt-0.5 text-xs text-white/50">
                            {t('diagnosis_leaders.unit')} 리더
                        </div>
                    </div>
                    <div className="my-auto hidden h-6 w-px flex-shrink-0 bg-white/10 lg:block" />
                    <div className="flex min-w-[70px] flex-1 flex-col justify-center rounded-lg border border-[rgba(46,196,169,0.35)] bg-[rgba(46,196,169,0.18)] px-2 py-1 text-center sm:px-2.5 sm:py-1.5 lg:flex-none">
                        <div className="text-lg leading-none font-extrabold text-[#2EC4A9] sm:text-xl lg:text-[22px]">
                            {ratioPct ?? '—'}%
                        </div>
                        <div className="mt-0.5 text-xs text-white/50">
                            {t('diagnosis_leaders.ratioLabel')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Workforce Size */}
            <div className="mx-4 mt-3 flex flex-col gap-2.5 rounded-lg bg-[#F0F2F5] px-3 py-2.5 sm:mx-7 sm:mt-4 sm:flex-row sm:items-center">
                <svg
                    className="h-3.5 w-3.5 shrink-0 text-[#9AA3B2]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <circle cx="9" cy="7" r="4" />
                    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                    <path d="M21 21v-2a4 4 0 00-3-3.85" />
                </svg>
                <span className="flex-shrink-0 text-sm font-semibold text-[#6B7585] sm:text-[12px]">
                    {t('diagnosis_leaders.workforceLabel')}
                </span>
                <div className="flex flex-1 items-center gap-1.5 sm:flex-none sm:gap-2.5">
                    <input
                        type="number"
                        min={1}
                        value={totalWorkforce}
                        onChange={(e) =>
                            setTotalWorkforce(parseInt(e.target.value, 10) || 0)
                        }
                        className="h-9 min-h-[40px] flex-1 rounded-md border-[1.5px] border-[#E2E6ED] px-2.5 text-center text-sm font-bold text-[#1B2B5B] outline-none focus:border-[#2EC4A9] sm:h-7 sm:w-[72px] sm:text-[13px]"
                    />
                    <span className="flex-shrink-0 text-sm whitespace-nowrap text-[#9AA3B2] sm:text-[12px]">
                        {t('diagnosis_leaders.unit')}
                    </span>
                </div>
                <span className="ml-1 text-xs text-[#9AA3B2] sm:text-[11px]">
                    · 실제 연동 시 자동으로 불러옵니다
                </span>
            </div>

            {/* Note Banner */}
            <div className="mx-4 mt-4 flex flex-col gap-2 rounded-lg border border-[#B2EDE5] bg-[#E6F9F6] px-3 py-2.5 text-sm leading-relaxed text-[#3A4356] sm:mx-7 sm:mt-5 sm:flex-row sm:items-start sm:px-4 sm:py-3 sm:text-[12.5px]">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#2EC4A9] sm:mt-0" />
                <span>
                    <strong className="text-[#1B2B5B]">Note:</strong>{' '}
                    {t('diagnosis_leaders.noteDesc')}
                </span>
            </div>

            {/* Leader List */}
            <div className="max-h-[400px] space-y-1.5 overflow-y-auto px-4 py-3 sm:space-y-2 sm:px-7 sm:py-4">
                {order.map((key) => {
                    const preset = PRESET_LEADERS.find((l) => l.id === key);
                    const custom = customRows.find((r) => r.id === key);
                    const row =
                        preset ||
                        (custom
                            ? {
                                  id: custom.id,
                                  label: custom.label,
                                  korean: custom.korean,
                                  desc: '커스텀 포지션',
                                  icon: '🏷',
                              }
                            : null);

                    if (!row) return null;

                    const active = selected.has(row.id);
                    const count = counts[row.id] ?? 1;
                    const isCustom = !!custom;

                    return (
                        <div
                            key={row.id}
                            draggable={!isReadOnly}
                            onDragStart={(e) => handleDragStart(e, row.id)}
                            onDragEnd={() => {
                                setDraggingKey(null);
                                setDropTarget(null);
                            }}
                            onDragOver={(e) => handleDragOver(e, row.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, row.id)}
                            className={cn(
                                'leader-row flex cursor-pointer touch-manipulation flex-col gap-2 rounded-lg border-2 bg-white px-3 py-3 transition-all select-none sm:flex-row sm:items-center sm:gap-3.5 sm:px-4 sm:py-3.5',
                                active
                                    ? 'border-[#2EC4A9] bg-[#E6F9F6] shadow-[0_0_0_3px_rgba(46,196,169,0.1)]'
                                    : 'border-[#E2E6ED] hover:border-[#CBD0DA] hover:shadow-[0_1px_4px_rgba(27,43,91,0.07)]',
                                draggingKey === row.id &&
                                    'bg-[#F0F2F5] opacity-40',
                                dropTarget?.key === row.id &&
                                    dropTarget.top &&
                                    'border-t-[2.5px] border-t-[#2EC4A9]',
                                dropTarget?.key === row.id &&
                                    !dropTarget.top &&
                                    'border-b-[2.5px] border-b-[#2EC4A9]',
                            )}
                            onClick={() =>
                                !isReadOnly &&
                                !justDraggedRef.current &&
                                toggleRow(row.id)
                            }
                        >
                            {/* Drag Handle */}
                            <div
                                className="flex h-8 w-5 shrink-0 cursor-grab items-center justify-center text-[#CBD0DA] hover:text-[#6B7585]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <GripVertical className="h-3.5 w-3.5" />
                            </div>

                            {/* Checkbox */}
                            <div
                                className={cn(
                                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all',
                                    active
                                        ? 'border-[#2EC4A9] bg-[#2EC4A9]'
                                        : 'border-[#CBD0DA] bg-white',
                                )}
                            >
                                {active && (
                                    <Check
                                        className="h-2.5 w-2.5 text-white"
                                        strokeWidth={3}
                                    />
                                )}
                            </div>

                            {/* Icon */}
                            <div
                                className={cn(
                                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[17px]',
                                    active
                                        ? 'bg-[rgba(46,196,169,0.15)]'
                                        : 'bg-[#F0F2F5]',
                                )}
                            >
                                {row.icon}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-[14px] font-bold text-[#1B2B5B]">
                                    {row.label}
                                    {row.korean && (
                                        <span
                                            className={cn(
                                                'text-[12px] font-medium',
                                                active
                                                    ? 'text-[#25A891]'
                                                    : 'text-[#9AA3B2]',
                                            )}
                                        >
                                            {row.korean}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-0.5 text-[11.5px] text-[#9AA3B2]">
                                    {row.desc}
                                </div>
                            </div>

                            {/* Count Controls */}
                            <div
                                className={cn(
                                    'flex shrink-0 items-center overflow-hidden rounded-lg border bg-white transition-all',
                                    active
                                        ? 'border-[#B2EDE5]'
                                        : 'border-[#E2E6ED] opacity-30',
                                )}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        adj(row.id, -1);
                                    }}
                                    className="flex h-8 w-8 items-center justify-center bg-[#F8F9FB] font-bold text-[#6B7585] hover:bg-[#E6F9F6] hover:text-[#25A891]"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    min={1}
                                    max={999}
                                    value={count}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.currentTarget.select();
                                    }}
                                    onFocus={(e) => e.currentTarget.select()}
                                    onChange={(e) =>
                                        syncRow(
                                            row.id,
                                            parseInt(e.target.value, 10) || 1,
                                        )
                                    }
                                    className="w-11 [appearance:textfield] border-0 bg-transparent text-center text-[15px] font-extrabold text-[#1B2B5B] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        adj(row.id, 1);
                                    }}
                                    className="flex h-8 w-8 items-center justify-center bg-[#F8F9FB] font-bold text-[#6B7585] hover:bg-[#E6F9F6] hover:text-[#25A891]"
                                >
                                    +
                                </button>
                                <span className="flex h-8 items-center border-l border-[#E2E6ED] bg-[#F8F9FB] px-2 text-[11px] font-semibold text-[#9AA3B2]">
                                    {t('diagnosis_leaders.unit')}
                                </span>
                            </div>

                            {isCustom && !isReadOnly && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeCustomRow(row.id);
                                    }}
                                    className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[#E2E6ED] bg-white text-[#9AA3B2] hover:border-[#E05252] hover:bg-[#E05252] hover:text-white"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    );
                })}

                {/* Custom Input */}
                {customInputVisible && (
                    <div
                        className="flex flex-col gap-2 rounded-lg border-2 border-[#B2EDE5] bg-[#E6F9F6] p-3.5 px-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={customTitle}
                                onChange={(e) => setCustomTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') confirmCustom();
                                    if (e.key === 'Escape') cancelCustom();
                                }}
                                placeholder="직급명 (예: Unit Leader, Cell Leader…)"
                                maxLength={30}
                                autoFocus
                                className="h-[38px] flex-1 rounded-lg border-[1.5px] border-[#B2EDE5] px-3 text-[13px] font-semibold text-[#1B2B5B] outline-none focus:border-[#2EC4A9] focus:ring-[3px] focus:ring-[rgba(46,196,169,0.12)]"
                            />
                            <input
                                type="text"
                                value={customKorean}
                                onChange={(e) =>
                                    setCustomKorean(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') confirmCustom();
                                    if (e.key === 'Escape') cancelCustom();
                                }}
                                placeholder="한국어 명칭"
                                maxLength={10}
                                className="h-[38px] w-[110px] rounded-lg border-[1.5px] border-[#B2EDE5] px-3 text-[13px] text-[#3A4356] outline-none focus:border-[#2EC4A9] focus:ring-[3px] focus:ring-[rgba(46,196,169,0.12)]"
                            />
                            <button
                                type="button"
                                onClick={confirmCustom}
                                className="h-[38px] rounded-lg bg-[#2EC4A9] px-4 text-[12.5px] font-bold whitespace-nowrap text-white hover:bg-[#25A891]"
                            >
                                추가
                            </button>
                            <button
                                type="button"
                                onClick={cancelCustom}
                                className="flex h-[38px] w-[38px] items-center justify-center rounded-lg border-[1.5px] border-[#E2E6ED] bg-white text-[#9AA3B2] hover:border-[#E05252] hover:text-[#E05252]"
                            >
                                ×
                            </button>
                        </div>
                        <div className="text-[11px] text-[#25A891]">
                            Enter 키로 빠르게 추가할 수 있습니다
                        </div>
                    </div>
                )}

                {/* Add Custom Button */}
                {!customInputVisible && (
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => !isReadOnly && openCustom()}
                        onKeyDown={(e) =>
                            e.key === 'Enter' && !isReadOnly && openCustom()
                        }
                        className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-[#E2E6ED] px-4 py-3 text-[#9AA3B2] transition-colors hover:border-[#2EC4A9] hover:bg-[#E6F9F6] hover:text-[#2EC4A9]"
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0F2F5]">
                            <Plus className="h-4 w-4" strokeWidth={2.2} />
                        </div>
                        <span className="text-[13px] font-semibold">
                            {t('diagnosis_leaders.addCustom') ||
                                '커스텀 직급 추가'}
                        </span>
                    </div>
                )}
            </div>

            {/* Ratio Bar */}
            <div className="mx-7 mb-5 flex items-center gap-4 rounded-lg border border-[#E2E6ED] bg-[#F8F9FB] px-4 py-3.5">
                <span className="shrink-0 text-[12px] font-bold text-[#6B7585]">
                    {t('diagnosis_leaders.ratioLabel')}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-[20px] bg-[#E2E6ED]">
                    <div
                        className="h-full rounded-[20px] transition-all duration-300"
                        style={{
                            width: `${ratioNum}%`,
                            background:
                                ratioNum > 30
                                    ? 'linear-gradient(90deg,#E05252,#f87171)'
                                    : 'linear-gradient(90deg,#2EC4A9,#3DD6BD)',
                        }}
                    />
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-[12.5px] font-bold text-[#1B2B5B]">
                    <span className="text-[15px] font-extrabold text-[#2EC4A9]">
                        {ratioPct ?? '—'}%
                    </span>
                    <span className="text-[11px] font-normal text-[#9AA3B2]">
                        {totalWorkforce > 0
                            ? `(${totalHead}명 / ${totalWorkforce}명)`
                            : ''}
                    </span>
                </div>
            </div>

            <div className="mx-7 mb-2">
                <DiagnosisFieldErrorMessage
                    fieldKey="leadership_count"
                    inertiaError={
                        typeof leadersErrors.leadership_count === 'string'
                            ? leadersErrors.leadership_count
                            : undefined
                    }
                />
            </div>

            {/* Selected Summary */}
            <div className="mx-7 mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-[#E2E6ED] bg-[#F8F9FB] px-4 py-3">
                <span className="shrink-0 text-[12px] font-semibold text-[#6B7585]">
                    {t('diagnosis_leaders.selectedPositions')}
                </span>
                <div className="flex flex-1 flex-wrap gap-1.5">
                    {allSelected.length === 0 ? (
                        <span className="text-[12px] text-[#CBD0DA] italic">
                            선택된 포지션이 없습니다
                        </span>
                    ) : (
                        allSelected.map((r) => (
                            <div
                                key={`${r.label}-${r.korean}`}
                                className="flex items-center gap-1.5 rounded-[20px] border-[1.5px] border-[#B2EDE5] bg-white px-2.5 py-0.5 text-[12px] font-semibold text-[#1B2B5B]"
                            >
                                {r.label}
                                {r.korean && <> · {r.korean}</>}
                                <span className="rounded-[10px] bg-[#2EC4A9] px-1.5 text-[10.5px] font-extrabold text-white">
                                    {r.count}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    if (embedMode) return <>{innerContent}</>;

    return (
        <>
            <Head
                title={`Leaders - ${company?.name || project?.company?.name || 'Company'}`}
            />
            <FormLayout
                title={t('diagnosis_leaders.title')}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="executives"
                nextRoute="job-grades"
                formData={data}
                saveRoute={
                    projectId ? `/hr-manager/diagnosis/${projectId}` : undefined
                }
                liveValidationError={
                    tooManyLeaders && !isReadOnly
                        ? `Leadership count (${totalHead}) cannot exceed total workforce (${totalWorkforce}).`
                        : null
                }
                validateBeforeNext={() => {
                    if (tooManyLeaders) {
                        return t('diagnosis_leaders.validationExceeded', {
                            totalHead,
                            totalWorkforce,
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
