import React, { useEffect, useState, useCallback } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDiagnosisDraftHydrate } from '@/hooks/useDiagnosisDraftHydrate';
import { DiagnosisFieldErrorMessage } from '@/components/Diagnosis/DiagnosisFieldErrorsContext';

interface Diagnosis {
    id: number;
    total_executives?: number;
    executive_positions?: Array<{ role: string; count: number }> | Record<string, number>;
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

const PRESET_EXECUTIVES: { id: string; role: string; full: string; icon: string }[] = [
    { id: 'CEO', role: 'CEO', full: 'Chief Executive Officer', icon: '👑' },
    { id: 'COO', role: 'COO', full: 'Chief Operating Officer', icon: '⚙️' },
    { id: 'CTO', role: 'CTO', full: 'Chief Technology Officer', icon: '💻' },
    { id: 'CFO', role: 'CFO', full: 'Chief Financial Officer', icon: '💰' },
    { id: 'CMO', role: 'CMO', full: 'Chief Marketing Officer', icon: '📣' },
    { id: 'CHRO', role: 'CHRO', full: 'Chief HR Officer', icon: '🤝' },
    { id: 'CSO', role: 'CSO', full: 'Chief Strategy Officer', icon: '🎯' },
    { id: 'CPO', role: 'CPO', full: 'Chief Product Officer', icon: '📦' },
];

function parsePositions(diagnosis: Diagnosis | undefined): Array<{ id: string; role: string; count: number; custom?: boolean }> {
    if (!diagnosis?.executive_positions) return [];
    const raw = diagnosis.executive_positions;
    if (Array.isArray(raw)) {
        return raw.map((p, i) => ({
            id: p.role === 'CEO' || PRESET_EXECUTIVES.some((e) => e.role === p.role) ? p.role : `custom_${i}_${p.role}`,
            role: p.role,
            count: typeof p.count === 'number' ? p.count : 1,
            custom: !PRESET_EXECUTIVES.some((e) => e.role === p.role),
        }));
    }
    return Object.entries(raw).map(([role, count]) => ({
        id: PRESET_EXECUTIVES.some((e) => e.role === role) ? role : `custom_${role}`,
        role,
        count: typeof count === 'number' ? count : 1,
        custom: !PRESET_EXECUTIVES.some((e) => e.role === role),
    }));
}

function applyPositionsToUi(
    positions: Array<{ role: string; count: number }> | Record<string, number> | undefined | null,
    setSelected: React.Dispatch<React.SetStateAction<Set<string>>>,
    setCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>,
    setCustomRoles: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; count: number }>>>
): void {
    const d: Diagnosis = { id: 0, executive_positions: positions ?? undefined };
    const parsed = parsePositions(d);
    setSelected(new Set(parsed.map((p) => p.id)));
    setCounts((prev) => {
        const next: Record<string, number> = {};
        parsed.forEach((p) => {
            next[p.id] = p.count;
        });
        PRESET_EXECUTIVES.forEach((e) => {
            if (next[e.id] == null) next[e.id] = prev?.[e.id] ?? 1;
        });
        return next;
    });
    setCustomRoles(parsed.filter((p) => p.custom).map((p) => ({ id: p.id, name: p.role, count: p.count })));
}

export default function Executives({
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
    const [selected, setSelected] = useState<Set<string>>(() => {
        const positions = parsePositions(diagnosis);
        const set = new Set<string>();
        positions.forEach((p) => set.add(p.id));
        return set;
    });
    const [counts, setCounts] = useState<Record<string, number>>(() => {
        const positions = parsePositions(diagnosis);
        const map: Record<string, number> = {};
        positions.forEach((p) => {
            map[p.id] = p.count;
        });
        PRESET_EXECUTIVES.forEach((e) => {
            if (map[e.id] == null) map[e.id] = 1;
        });
        return map;
    });
    const [customRoles, setCustomRoles] = useState<Array<{ id: string; name: string; count: number }>>(() => {
        const positions = parsePositions(diagnosis);
        return positions.filter((p) => p.custom).map((p) => ({ id: p.id, name: p.role, count: p.count }));
    });
    const [customInputVisible, setCustomInputVisible] = useState(false);
    const [customName, setCustomName] = useState('');

    const internalForm = useForm({
        total_executives: diagnosis?.total_executives || 0,
        executive_positions: [] as Array<{ role: string; count: number }>,
    });
    const useEmbed = embedMode && embedData != null && embedSetData;
    const data = useEmbed ? ({ ...internalForm.data, ...embedData } as typeof internalForm.data) : internalForm.data;
    const setFieldData = useCallback(
        (k: string, v: unknown) => {
            if (useEmbed) {
                embedSetData(k, v);
                return;
            }
            internalForm.setData(k as 'total_executives' | 'executive_positions', v as any);
        },
        [useEmbed, embedSetData, internalForm]
    );
    const setFormData = useCallback(
        (payload: { total_executives: number; executive_positions: Array<{ role: string; count: number }> }) => {
            if (useEmbed) {
                embedSetData('total_executives', payload.total_executives);
                embedSetData('executive_positions', payload.executive_positions);
                return;
            }
            internalForm.setData(payload);
        },
        [useEmbed, embedSetData, internalForm]
    );
    const { errors: executivesErrors } = internalForm;

    // Hydrate from saved draft so Back/Next keeps selections.
    useDiagnosisDraftHydrate(
        projectId,
        'executives',
        (patch) => {
            if (patch.total_executives != null) setFieldData('total_executives', patch.total_executives as any);
            if (patch.executive_positions != null) {
                setFieldData('executive_positions', patch.executive_positions as any);
                applyPositionsToUi(patch.executive_positions as any, setSelected, setCounts, setCustomRoles);
            }
        },
        { enabled: !embedMode && !readOnly }
    );
    const toggleCard = useCallback(
        (roleId: string) => {
            if (readOnly) return;
            setSelected((prev) => {
                const next = new Set(prev);
                if (next.has(roleId)) next.delete(roleId);
                else next.add(roleId);
                return next;
            });
        },
        [readOnly]
    );

    const adjustCount = useCallback(
        (roleId: string, delta: number) => {
            setCounts((prev) => ({
                ...prev,
                [roleId]: Math.max(1, (prev[roleId] ?? 1) + delta),
            }));
        },
        []
    );

    const syncCount = useCallback((roleId: string, value: number) => {
        setCounts((prev) => ({ ...prev, [roleId]: Math.max(1, value) }));
    }, []);

    const confirmCustom = useCallback(() => {
        const name = customName.trim().toUpperCase();
        if (!name) return;
        const id = `custom_${Date.now()}`;
        setCustomRoles((prev) => [...prev, { id, name, count: 1 }]);
        setCounts((prev) => ({ ...prev, [id]: 1 }));
        setSelected((prev) => new Set(prev).add(id));
        setCustomInputVisible(false);
        setCustomName('');
    }, [customName]);

    const removeCustom = useCallback((id: string) => {
        setCustomRoles((prev) => prev.filter((r) => r.id !== id));
        setSelected((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    const allSelected = [
        ...PRESET_EXECUTIVES.filter((e) => selected.has(e.id)).map((e) => ({ name: e.role, count: counts[e.id] ?? 1 })),
        ...customRoles.filter((r) => selected.has(r.id)).map((r) => ({ name: r.name, count: counts[r.id] ?? r.count })),
    ];
    const totalPos = allSelected.length;
    const totalHead = allSelected.reduce((s, r) => s + r.count, 0);

    useEffect(() => {
        const positionsArray = allSelected.map((r) => ({ role: r.name, count: r.count }));
        setFormData({ executive_positions: positionsArray, total_executives: totalHead });
    }, [totalHead, allSelected.map((r) => `${r.name}:${r.count}`).join(',')]);

    const isReadOnlyStatus = diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
    const isReadOnly = readOnly || isReadOnlyStatus;

    const innerContent = (
        <div className="rounded-[14px] border border-[#E2E6ED] bg-white overflow-hidden shadow-[0_4px_20px_rgba(27,43,91,0.09)] mb-5">
            {/* Hero strip */}
            <div className="bg-gradient-to-br from-[#1B2B5B] to-[#243877] px-7 py-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[#2EC4A9]">
                    <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        <path d="M16 3.5c1.5.5 3 2 3 4.5" />
                        <path d="M8 3.5C6.5 4 5 5.5 5 8" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-[15px] font-bold text-white">임원 포지션 설정</h2>
                    <p className="text-[12px] text-white/55 mt-0.5">해당되는 임원을 선택하고 인원수를 입력하세요</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <div className="bg-white/10 rounded-lg py-1.5 px-3.5 text-center min-w-[60px]">
                        <div className="text-[22px] font-extrabold text-white leading-none">{totalPos}</div>
                        <div className="text-[10px] text-white/50 mt-0.5">포지션 수</div>
                    </div>
                    <div className="bg-white/10 rounded-lg py-1.5 px-3.5 text-center min-w-[60px]">
                        <div className="text-[22px] font-extrabold text-white leading-none">{totalHead}</div>
                        <div className="text-[10px] text-white/50 mt-0.5">총 임원</div>
                    </div>
                </div>
            </div>

            {/* Position grid */}
            <div className="p-6 px-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PRESET_EXECUTIVES.map((e) => {
                    const active = selected.has(e.id);
                    const count = counts[e.id] ?? 1;
                    return (
                        <div
                            key={e.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => !isReadOnly && toggleCard(e.id)}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !isReadOnly && toggleCard((e.target as HTMLElement).closest('[data-role]')?.getAttribute('data-role') || '')}
                            data-role={e.id}
                            className={cn(
                                'relative rounded-lg border-2 p-4 transition-all cursor-pointer select-none text-left',
                                active
                                    ? 'border-[#2EC4A9] bg-[#E6F9F6] shadow-[0_0_0_3px_rgba(46,196,169,0.1)]'
                                    : 'border-[#E2E6ED] bg-white hover:border-[#CBD0DA] hover:shadow-[0_1px_4px_rgba(27,43,91,0.07)]'
                            )}
                        >
                            <div
                                className={cn(
                                    'absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white',
                                    active ? 'border-[#2EC4A9] bg-[#2EC4A9]' : 'border-[#CBD0DA]'
                                )}
                            >
                                {active && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                            </div>
                            <div className="flex items-start gap-2.5 mb-3 pr-7">
                                <div
                                    className={cn(
                                        'w-9 h-9 rounded-lg flex items-center justify-center text-[17px] shrink-0',
                                        active ? 'bg-[rgba(46,196,169,0.15)]' : 'bg-[#F0F2F5]'
                                    )}
                                >
                                    {e.icon}
                                </div>
                                <div>
                                    <div className="text-[15px] font-extrabold text-[#1B2B5B]">{e.role}</div>
                                    <div className={cn('text-[11px] mt-0.5', active ? 'text-[#25A891]' : 'text-[#9AA3B2]')}>
                                        {e.full}
                                    </div>
                                </div>
                            </div>
                            <div
                                className={cn(
                                    'flex items-center rounded-lg overflow-hidden border bg-white transition-all',
                                    active ? 'border-[#B2EDE5]' : 'border-[#E2E6ED] opacity-35 pointer-events-none'
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={(ev) => {
                                        ev.stopPropagation();
                                        adjustCount(e.id, -1);
                                    }}
                                    className="w-[34px] h-[34px] flex items-center justify-center bg-[#F8F9FB] text-[#6B7585] font-bold text-base hover:bg-[#E6F9F6] hover:text-[#25A891]"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={count}
                                    onClick={(ev) => ev.stopPropagation()}
                                    onChange={(ev) => syncCount(e.id, parseInt(ev.target.value, 10) || 1)}
                                    className="flex-1 border-0 bg-transparent text-center text-base font-extrabold text-[#1B2B5B] min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="px-2.5 text-[11px] font-semibold text-[#9AA3B2] border-l border-[#E2E6ED] bg-[#F8F9FB] h-[34px] flex items-center">
                                    명
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Custom cards (rendered) */}
                {customRoles.map((r) => {
                    const active = selected.has(r.id);
                    const count = counts[r.id] ?? r.count;
                    return (
                        <div
                            key={r.id}
                            className={cn(
                                'relative rounded-lg border-2 p-4 transition-all cursor-pointer select-none text-left',
                                active && 'border-[#2EC4A9] bg-[#E6F9F6] shadow-[0_0_0_3px_rgba(46,196,169,0.1)]'
                            )}
                        >
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 border-[#2EC4A9] bg-[#2EC4A9] flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </div>
                            {!isReadOnly && (
                                <button
                                    type="button"
                                    onClick={() => removeCustom(r.id)}
                                    className="absolute top-2.5 right-9 w-5 h-5 rounded-full border border-[#E2E6ED] bg-white flex items-center justify-center text-[#9AA3B2] text-sm hover:bg-[#E05252] hover:text-white hover:border-[#E05252] z-[2]"
                                >
                                    ×
                                </button>
                            )}
                            <div className="flex items-start gap-2.5 mb-3 pr-7">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[17px] shrink-0 bg-[rgba(46,196,169,0.15)]">
                                    🏷
                                </div>
                                <div>
                                    <div className="text-[15px] font-extrabold text-[#1B2B5B]">{r.name}</div>
                                    <div className="text-[11px] mt-0.5 text-[#25A891]">커스텀 포지션</div>
                                </div>
                            </div>
                            <div className="flex items-center rounded-lg overflow-hidden border border-[#B2EDE5] bg-white">
                                <button
                                    type="button"
                                    onClick={() => adjustCount(r.id, -1)}
                                    className="w-[34px] h-[34px] flex items-center justify-center bg-[#F8F9FB] text-[#6B7585] font-bold hover:bg-[#E6F9F6] hover:text-[#25A891]"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={count}
                                    onChange={(ev) => syncCount(r.id, parseInt(ev.target.value, 10) || 1)}
                                    className="flex-1 border-0 bg-transparent text-center text-base font-extrabold text-[#1B2B5B] min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="px-2.5 text-[11px] font-semibold text-[#9AA3B2] border-l border-[#E2E6ED] bg-[#F8F9FB] h-[34px] flex items-center">
                                    명
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Add custom card */}
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => !isReadOnly && setCustomInputVisible(true)}
                    onKeyDown={(e) => e.key === 'Enter' && !isReadOnly && setCustomInputVisible(true)}
                    className={cn(
                        'rounded-lg border-2 border-dashed border-[#E2E6ED] p-4 flex flex-col items-center justify-center min-h-[100px] text-[#9AA3B2] cursor-pointer hover:border-[#2EC4A9] hover:text-[#2EC4A9] transition-colors',
                        customInputVisible && 'border-[#B2EDE5] bg-[#E6F9F6]'
                    )}
                >
                    {!customInputVisible ? (
                        <>
                            <div className="w-9 h-9 rounded-lg bg-[#F0F2F5] flex items-center justify-center mb-2 hover:bg-[#E6F9F6]">
                                <Plus className="w-[18px] h-[18px]" strokeWidth={2.2} />
                            </div>
                            <span className="text-[12.5px] font-semibold">커스텀 임원 포지션 추가</span>
                        </>
                    ) : (
                        <div className="w-full space-y-2" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') confirmCustom();
                                    if (e.key === 'Escape') setCustomInputVisible(false);
                                }}
                                placeholder="예: CIO, CDO, CRO…"
                                maxLength={20}
                                autoFocus
                                className="w-full h-[38px] px-3 border-[1.5px] border-[#B2EDE5] rounded-lg text-[13px] font-semibold text-[#1B2B5B] outline-none focus:border-[#2EC4A9] focus:ring-[3px] focus:ring-[rgba(46,196,169,0.12)]"
                            />
                            <div className="flex gap-1.5">
                                <button
                                    type="button"
                                    onClick={confirmCustom}
                                    className="flex-1 h-[34px] rounded-lg bg-[#2EC4A9] text-white text-[12.5px] font-bold hover:bg-[#25A891]"
                                >
                                    추가하기
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCustomInputVisible(false);
                                        setCustomName('');
                                    }}
                                    className="w-[34px] h-[34px] rounded-lg border-[1.5px] border-[#E2E6ED] bg-white text-[#6B7585] flex items-center justify-center hover:border-[#E05252] hover:text-[#E05252]"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary bar */}
            <div className="mx-7 mb-6 py-3.5 px-4 bg-[#F8F9FB] border border-[#E2E6ED] rounded-lg flex items-center gap-4 flex-wrap">
                <span className="text-[12px] font-semibold text-[#6B7585]">선택된 포지션</span>
                <div className="flex gap-1.5 flex-wrap flex-1">
                    {allSelected.length === 0 ? (
                        <span className="text-[12px] text-[#CBD0DA] italic">선택된 포지션이 없습니다</span>
                    ) : (
                        allSelected.map((r) => (
                            <div
                                key={r.name}
                                className="flex items-center gap-1.5 bg-white border-[1.5px] border-[#B2EDE5] rounded-[20px] py-0.5 px-2.5 text-[12px] font-semibold text-[#1B2B5B]"
                            >
                                {r.name}
                                <span className="bg-[#2EC4A9] text-white rounded-[10px] px-1.5 text-[10.5px] font-extrabold">
                                    {r.count}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="px-7 pb-4">
                <DiagnosisFieldErrorMessage
                    fieldKey="total_executives"
                    inertiaError={
                        typeof executivesErrors.total_executives === 'string'
                            ? executivesErrors.total_executives
                            : undefined
                    }
                />
            </div>
        </div>
    );

    if (embedMode) return <>{innerContent}</>;
    return (
        <>
            <Head title={`Executives - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title="Executives"
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="workforce"
                nextRoute="leaders"
                formData={{
                    total_executives: data.total_executives,
                    executive_positions: data.executive_positions,
                }}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                {innerContent}
            </FormLayout>
        </>
    );
}
