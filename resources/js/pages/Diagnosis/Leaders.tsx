import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Check, GripVertical, Plus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const PRESET_LEADERS: { id: string; label: string; korean: string; desc: string; icon: string }[] = [
    { id: 'DH', label: 'Division Head', korean: '본부장', desc: 'Oversees an entire business division', icon: '🏢' },
    { id: 'DeptH', label: 'Department Head', korean: '부서장', desc: 'Manages a specific department', icon: '🏬' },
    { id: 'TL', label: 'Team Leader', korean: '팀장', desc: 'Leads a cross-functional team', icon: '👥' },
    { id: 'GL', label: 'Group Leader', korean: '그룹장', desc: 'Manages a sub-group within a team', icon: '🔷' },
    { id: 'PL', label: 'Part Leader', korean: '파트장', desc: 'Oversees a specific work unit', icon: '📌' },
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
    const workforceFromDiagnosis = diagnosis?.present_headcount ?? 100;
    const [totalWorkforce, setTotalWorkforce] = useState(workforceFromDiagnosis);
    const [selected, setSelected] = useState<Set<string>>(() => {
        const total = diagnosis?.leadership_count ?? 0;
        if (total > 0) return new Set(['TL']);
        return new Set(['DH', 'DeptH', 'TL']);
    });
    const [counts, setCounts] = useState<Record<string, number>>(() => {
        const total = diagnosis?.leadership_count ?? 0;
        const c: Record<string, number> = { DH: 2, DeptH: 1, TL: 10, GL: 1, PL: 1 };
        if (total > 0) {
            c.TL = Math.max(1, total);
            c.DH = 2;
            c.DeptH = 1;
        }
        return c;
    });
    const [customRows, setCustomRows] = useState<Array<{ id: string; label: string; korean: string; count: number }>>([]);
    const [customInputVisible, setCustomInputVisible] = useState(false);
    const [customTitle, setCustomTitle] = useState('');
    const [customKorean, setCustomKorean] = useState('');
    const customIdRef = useRef(0);
    const [order, setOrder] = useState<string[]>(() => [...PRESET_LEADERS.map((l) => l.id)]);
    const [draggingKey, setDraggingKey] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<{ key: string; top: boolean } | null>(null);

    const internalForm = useForm({
        leadership_count: diagnosis?.leadership_count ?? 0,
    });
    const useEmbed = embedMode && embedData != null && embedSetData;
    const data = useEmbed ? { ...internalForm.data, ...embedData } as typeof internalForm.data : internalForm.data;
    const setData = useEmbed ? (k: string, v: unknown) => embedSetData(k, v) : internalForm.setData;

    const allSelected = [
        ...PRESET_LEADERS.filter((l) => selected.has(l.id)).map((l) => ({ label: l.label, korean: l.korean, count: counts[l.id] ?? 1 })),
        ...customRows.filter((r) => selected.has(r.id)).map((r) => ({ label: r.label, korean: r.korean, count: counts[r.id] ?? r.count })),
    ];
    const totalPos = allSelected.length;
    const totalHead = allSelected.reduce((s, r) => s + r.count, 0);
    const ratioPct = totalWorkforce > 0 && totalHead >= 0 ? ((totalHead / totalWorkforce) * 100).toFixed(1) : null;
    const ratioNum = totalWorkforce > 0 ? Math.min(100, parseFloat(ratioPct || '0')) : 0;
    const tooManyLeaders = totalWorkforce > 0 && totalHead > totalWorkforce;

    useEffect(() => {
        setData('leadership_count', totalHead);
    }, [totalHead]);

    const toggleRow = useCallback(
        (key: string) => {
            if (readOnly) return;
            setSelected((prev) => {
                const next = new Set(prev);
                if (next.has(key)) next.delete(key);
                else next.add(key);
                return next;
            });
        },
        [readOnly]
    );

    const adj = useCallback((key: string, delta: number) => {
        setCounts((prev) => ({ ...prev, [key]: Math.max(1, (prev[key] ?? 1) + delta) }));
    }, []);

    const syncRow = useCallback((key: string, value: number) => {
        setCounts((prev) => ({ ...prev, [key]: Math.max(1, value) }));
    }, []);

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

    const adjCustom = useCallback((id: string, delta: number) => {
        setCounts((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta) }));
    }, []);

    const handleDragStart = useCallback((e: React.DragEvent, key: string) => {
        setDraggingKey(key);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', key);
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggingKey(null);
        setDropTarget(null);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, key: string) => {
        e.preventDefault();
        if (draggingKey === key) return;
        e.dataTransfer.dropEffect = 'move';
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        setDropTarget({ key, top: e.clientY < mid });
    }, [draggingKey]);

    const handleDragLeave = useCallback(() => {
        setDropTarget(null);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, key: string) => {
            e.preventDefault();
            const srcKey = draggingKey;
            if (!srcKey || srcKey === key) return;
            setDropTarget(null);
            setDraggingKey(null);
            setOrder((prev) => {
                const i = prev.indexOf(srcKey);
                const j = prev.indexOf(key);
                if (i === -1 || j === -1) return prev;
                const next = [...prev];
                const [removed] = next.splice(i, 1);
                const newJ = next.indexOf(key);
                const top = e.clientY < (e.currentTarget as HTMLElement).getBoundingClientRect().top + (e.currentTarget as HTMLElement).getBoundingClientRect().height / 2;
                next.splice(top ? newJ : newJ + 1, 0, removed);
                return next;
            });
        },
        [draggingKey]
    );

    const isReadOnlyStatus = diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
    const isReadOnly = readOnly || isReadOnlyStatus;

    const innerContent = (
        <div className="rounded-[14px] border border-[#E2E6ED] bg-white overflow-hidden shadow-[0_4px_20px_rgba(27,43,91,0.09)] mb-4 sm:mb-5">
            {/* Hero strip */}
            <div className="bg-gradient-to-br from-[#1B2B5B] to-[#243877] p-3 sm:p-4 sm:px-6 lg:px-7 flex flex-col lg:flex-row items-start lg:items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[#2EC4A9] flex-shrink-0">
                    <svg className="w-5 sm:w-[22px] h-5 sm:h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
                    </svg>
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-[15px] font-bold text-white leading-tight mb-1">Leaders</h2>
                    <p className="text-xs sm:text-[12px] text-white/55 leading-relaxed">Team Leader 직급 이상, 임원 미만의 리더를 선택하고 인원수를 입력하세요</p>
                </div>
                <div className="w-full lg:ml-auto lg:w-auto mt-2 lg:mt-0 flex flex-wrap gap-1.5 lg:gap-2 items-stretch">
                    <div className="bg-white/10 rounded-lg py-1 px-2 sm:py-1.5 sm:px-2.5 text-center min-w-[58px] flex flex-col justify-center flex-1 lg:flex-none">
                        <div className="text-lg sm:text-xl lg:text-[22px] font-extrabold text-white leading-none">{totalPos}</div>
                        <div className="text-xs text-white/50 mt-0.5">포지션 수</div>
                    </div>
                    <div className="bg-white/10 rounded-lg py-1 px-2 sm:py-1.5 sm:px-2.5 text-center min-w-[58px] flex flex-col justify-center flex-1 lg:flex-none">
                        <div className="text-lg sm:text-xl lg:text-[22px] font-extrabold text-white leading-none">{totalHead}</div>
                        <div className="text-xs text-white/50 mt-0.5">총 리더</div>
                    </div>
                    <div className="hidden lg:block w-px bg-white/10 my-auto h-6 flex-shrink-0" />
                    <div className="bg-[rgba(46,196,169,0.18)] border border-[rgba(46,196,169,0.35)] rounded-lg py-1 px-2 sm:py-1.5 sm:px-2.5 text-center min-w-[70px] flex flex-col justify-center flex-1 lg:flex-none">
                        <div className="text-lg sm:text-xl lg:text-[22px] font-extrabold text-[#2EC4A9] leading-none">{ratioPct ?? '—'}%</div>
                        <div className="text-xs text-white/50 mt-0.5">전체 대비 비율</div>
                    </div>
                </div>
            </div>

            {/* Workforce size */}
            <div className="mx-4 sm:mx-7 mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center gap-2.5 py-2.5 px-3 bg-[#F0F2F5] rounded-lg">
                <svg className="w-3.5 h-3.5 text-[#9AA3B2] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="9" cy="7" r="4" />
                    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                    <path d="M21 21v-2a4 4 0 00-3-3.85" />
                </svg>
                <span className="text-sm sm:text-[12px] font-semibold text-[#6B7585] flex-shrink-0">전체 재직 인원 (Workforce 단계 입력값)</span>
                <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 sm:flex-none">
                    <input
                        type="number"
                        min={1}
                        value={totalWorkforce}
                        onChange={(e) => setTotalWorkforce(parseInt(e.target.value, 10) || 0)}
                        className="flex-1 sm:w-[72px] h-9 sm:h-7 px-2.5 border-[1.5px] border-[#E2E6ED] rounded-md text-sm sm:text-[13px] font-bold text-[#1B2B5B] text-center outline-none focus:border-[#2EC4A9] min-h-[40px]"
                    />
                    <span className="text-sm sm:text-[12px] text-[#9AA3B2] whitespace-nowrap flex-shrink-0">명</span>
                </div>
                <span className="text-xs sm:text-[11px] text-[#9AA3B2] ml-1">· 실제 연동 시 자동으로 불러옵니다</span>
            </div>

            {/* Note banner */}
            <div className="mx-4 sm:mx-7 mt-4 sm:mt-5 py-2.5 sm:py-3 px-3 sm:px-4 bg-[#E6F9F6] border border-[#B2EDE5] rounded-lg flex flex-col sm:flex-row sm:items-start gap-2 text-sm sm:text-[12.5px] text-[#3A4356] leading-relaxed">
                <Info className="w-4 h-4 text-[#2EC4A9] shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-sm sm:text-[12.5px]">
                    <strong className="text-[#1B2B5B]">Note:</strong> Leaders are defined as employees <strong>above Team Leader level</strong>, excluding executives. Select each applicable leadership title and set the headcount.
                </span>
            </div>

            {/* Leader list */}
            <div className="px-4 sm:px-7 py-3 sm:py-4 space-y-1.5 sm:space-y-2 max-h-[400px] overflow-y-auto">
                {order.map((key) => {
                    const preset = PRESET_LEADERS.find((l) => l.id === key);
                    const custom = customRows.find((r) => r.id === key);
                    const row = preset || (custom ? { id: custom.id, label: custom.label, korean: custom.korean, desc: '커스텀 포지션', icon: '🏷' } : null);
                    if (!row) return null;
                    const active = selected.has(row.id);
                    const count = counts[row.id] ?? 1;
                    const isCustom = !!custom;
                    return (
                            <div
                                key={row.id}
                                id={`row-${row.id}`}
                                data-key={row.id}
                                draggable={!isReadOnly}
                                onDragStart={(e) => handleDragStart(e, row.id)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, row.id)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, row.id)}
                                className={cn(
                                    'leader-row flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 py-3 sm:py-3.5 px-3 sm:px-4 border-2 rounded-lg bg-white cursor-pointer transition-all select-none touch-manipulation',
                                    active ? 'border-[#2EC4A9] bg-[#E6F9F6] shadow-[0_0_0_3px_rgba(46,196,169,0.1)]' : 'border-[#E2E6ED] hover:border-[#CBD0DA] hover:shadow-[0_1px_4px_rgba(27,43,91,0.07)]',
                                    draggingKey === row.id && 'opacity-40 bg-[#F0F2F5]',
                                    dropTarget?.key === row.id && dropTarget.top && 'border-t-[2.5px] border-t-[#2EC4A9]',
                                    dropTarget?.key === row.id && !dropTarget.top && 'border-b-[2.5px] border-b-[#2EC4A9]'
                                )}
                                onClick={() => !isReadOnly && toggleRow(row.id)}
                            >
                            <div className="w-5 h-8 flex items-center justify-center cursor-grab text-[#CBD0DA] hover:text-[#6B7585] shrink-0" onClick={(e) => e.stopPropagation()}>
                                <GripVertical className="w-3.5 h-3.5" />
                            </div>
                            <div
                                className={cn(
                                    'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                                    active ? 'bg-[#2EC4A9] border-[#2EC4A9]' : 'bg-white border-[#CBD0DA]'
                                )}
                            >
                                {active && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                            </div>
                            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-[17px] shrink-0', active ? 'bg-[rgba(46,196,169,0.15)]' : 'bg-[#F0F2F5]')}>
                                {row.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[14px] font-bold text-[#1B2B5B] flex items-center gap-2">
                                    {row.label}
                                    {row.korean && <span className={cn('text-[12px] font-medium', active ? 'text-[#25A891]' : 'text-[#9AA3B2]')}>{row.korean}</span>}
                                </div>
                                <div className="text-[11.5px] text-[#9AA3B2] mt-0.5">{row.desc}</div>
                            </div>
                            <span className={cn('text-[10.5px] font-semibold rounded-[20px] py-0.5 px-2 shrink-0', active ? 'bg-[#B2EDE5] text-[#25A891]' : 'bg-[#F0F2F5] text-[#9AA3B2]')}>
                                Default
                            </span>
                            {isCustom && !isReadOnly && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeCustomRow(row.id); }}
                                    className="w-[22px] h-[22px] rounded-full border border-[#E2E6ED] bg-white flex items-center justify-center text-[#9AA3B2] hover:bg-[#E05252] hover:text-white hover:border-[#E05252] shrink-0"
                                >
                                    ×
                                </button>
                            )}
                            <div
                                className={cn(
                                    'flex items-center rounded-lg overflow-hidden border bg-white shrink-0 transition-all',
                                    active ? 'border-[#B2EDE5]' : 'border-[#E2E6ED] opacity-30 pointer-events-none'
                                )}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button type="button" onClick={() => adj(row.id, -1)} className="w-8 h-8 flex items-center justify-center bg-[#F8F9FB] text-[#6B7585] font-bold hover:bg-[#E6F9F6] hover:text-[#25A891]">
                                    −
                                </button>
                                <input
                                    type="number"
                                    min={1}
                                    max={999}
                                    value={count}
                                    onChange={(e) => syncRow(row.id, parseInt(e.target.value, 10) || 1)}
                                    className="w-11 border-0 bg-transparent text-center text-[15px] font-extrabold text-[#1B2B5B] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="px-2 border-l border-[#E2E6ED] bg-[#F8F9FB] text-[11px] font-semibold text-[#9AA3B2] h-8 flex items-center">명</span>
                            </div>
                        </div>
                    );
                })}

                {/* Custom inline input */}
                {customInputVisible && (
                    <div className="p-3.5 px-4 border-2 border-[#B2EDE5] rounded-lg bg-[#E6F9F6] flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={customTitle}
                                onChange={(e) => setCustomTitle(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') confirmCustom(); if (e.key === 'Escape') cancelCustom(); }}
                                placeholder="직급명 (예: Unit Leader, Cell Leader…)"
                                maxLength={30}
                                autoFocus
                                className="flex-1 h-[38px] px-3 border-[1.5px] border-[#B2EDE5] rounded-lg text-[13px] font-semibold text-[#1B2B5B] outline-none focus:border-[#2EC4A9] focus:ring-[3px] focus:ring-[rgba(46,196,169,0.12)]"
                            />
                            <input
                                type="text"
                                value={customKorean}
                                onChange={(e) => setCustomKorean(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') confirmCustom(); if (e.key === 'Escape') cancelCustom(); }}
                                placeholder="한국어 명칭"
                                maxLength={10}
                                className="w-[110px] h-[38px] px-3 border-[1.5px] border-[#B2EDE5] rounded-lg text-[13px] text-[#3A4356] outline-none focus:border-[#2EC4A9] focus:ring-[3px] focus:ring-[rgba(46,196,169,0.12)]"
                            />
                            <button type="button" onClick={confirmCustom} className="h-[38px] px-4 rounded-lg bg-[#2EC4A9] text-white text-[12.5px] font-bold hover:bg-[#25A891] whitespace-nowrap">
                                추가
                            </button>
                            <button type="button" onClick={cancelCustom} className="w-[38px] h-[38px] rounded-lg border-[1.5px] border-[#E2E6ED] bg-white text-[#9AA3B2] flex items-center justify-center hover:border-[#E05252] hover:text-[#E05252]">
                                ×
                            </button>
                        </div>
                        <div className="text-[11px] text-[#25A891]">Enter 키로 빠르게 추가할 수 있습니다</div>
                    </div>
                )}

                {/* Add custom row */}
                {!customInputVisible && (
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={() => !isReadOnly && openCustom()}
                        onKeyDown={(e) => e.key === 'Enter' && !isReadOnly && openCustom()}
                        className="flex items-center gap-3 py-3 px-4 border-2 border-dashed border-[#E2E6ED] rounded-lg cursor-pointer transition-colors text-[#9AA3B2] hover:border-[#2EC4A9] hover:text-[#2EC4A9] hover:bg-[#E6F9F6]"
                    >
                        <div className="w-8 h-8 rounded-lg bg-[#F0F2F5] flex items-center justify-center shrink-0">
                            <Plus className="w-4 h-4" strokeWidth={2.2} />
                        </div>
                        <span className="text-[13px] font-semibold">커스텀 리더십 타이틀 추가</span>
                    </div>
                )}
            </div>

            {/* Ratio strip */}
            <div className="mx-7 mb-5 py-3.5 px-4 bg-[#F8F9FB] border border-[#E2E6ED] rounded-lg flex items-center gap-4">
                <span className="text-[12px] font-bold text-[#6B7585] shrink-0">리더 비율</span>
                <div className="flex-1 h-2 bg-[#E2E6ED] rounded-[20px] overflow-hidden">
                    <div
                        className="h-full rounded-[20px] transition-all duration-300"
                        style={{
                            width: `${ratioNum}%`,
                            background: ratioNum > 30 ? 'linear-gradient(90deg,#E05252,#f87171)' : 'linear-gradient(90deg,#2EC4A9,#3DD6BD)',
                        }}
                    />
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-[12.5px] font-bold text-[#1B2B5B]">
                    <span className="text-[15px] font-extrabold text-[#2EC4A9]">{ratioPct ?? '—'}%</span>
                    <span className="text-[11px] font-normal text-[#9AA3B2]">
                        {totalWorkforce > 0 ? `(${totalHead}명 / ${totalWorkforce}명)` : ''}
                    </span>
                </div>
            </div>

            {/* Summary bar */}
            <div className="mx-7 mb-6 py-3 px-4 bg-[#F8F9FB] border border-[#E2E6ED] rounded-lg flex items-center gap-3 flex-wrap">
                <span className="text-[12px] font-semibold text-[#6B7585] shrink-0">선택된 포지션</span>
                <div className="flex gap-1.5 flex-wrap flex-1">
                    {allSelected.length === 0 ? (
                        <span className="text-[12px] text-[#CBD0DA] italic">선택된 포지션이 없습니다</span>
                    ) : (
                        allSelected.map((r) => (
                            <div
                                key={`${r.label}-${r.korean}`}
                                className="flex items-center gap-1.5 bg-white border-[1.5px] border-[#B2EDE5] rounded-[20px] py-0.5 px-2.5 text-[12px] font-semibold text-[#1B2B5B]"
                            >
                                {r.label}
                                {r.korean && <> · {r.korean}</>}
                                <span className="bg-[#2EC4A9] text-white rounded-[10px] px-1.5 text-[10.5px] font-extrabold">{r.count}</span>
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
            <Head title={`Leaders - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title="Leaders"
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="executives"
                nextRoute="job-grades"
                formData={data}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
                validateBeforeNext={() => {
                    if (tooManyLeaders) {
                        return `Leadership count (${totalHead}) cannot exceed total workforce (${totalWorkforce}).`;
                    }
                    return true;
                }}
            >
                {innerContent}
            </FormLayout>
        </>
    );
}
