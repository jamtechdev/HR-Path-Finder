import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Plus, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

interface ExecutivePosition {
    id: string;
    role: string;
    count: number;
}

const DEFAULT_POSITIONS = ['CEO', 'COO', 'CTO', 'CFO', 'CMO'];

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
    const { t } = useTranslation();
    const [positions, setPositions] = useState<ExecutivePosition[]>(() => {
        if (diagnosis?.executive_positions) {
            if (Array.isArray(diagnosis.executive_positions)) {
                return diagnosis.executive_positions.map((pos, index) => ({
                    id: `pos-${index}`,
                    role: pos.role || '',
                    count: pos.count || 0,
                }));
            }
            return Object.entries(diagnosis.executive_positions).map(([role, count], index) => ({
                id: `pos-${index}`,
                role,
                count: count as number,
            }));
        }
        return [];
    });
    const [selectedDefaultPositions, setSelectedDefaultPositions] = useState<string[]>(() => {
        const selected: string[] = [];
        positions.forEach((pos) => {
            if (DEFAULT_POSITIONS.includes(pos.role)) selected.push(pos.role);
        });
        return selected;
    });
    const [customInputVisible, setCustomInputVisible] = useState(false);
    const [customRoleName, setCustomRoleName] = useState('');

    const internalForm = useForm({
        total_executives: diagnosis?.total_executives || 0,
        executive_positions: [] as Array<{ role: string; count: number }>,
    });
    const useEmbed = embedMode && embedData != null && embedSetData;
    const data = useEmbed ? { ...internalForm.data, ...embedData } as typeof internalForm.data : internalForm.data;
    const setData = useEmbed ? (k: string, v: unknown) => embedSetData(k, v) : internalForm.setData;

    const toggleDefaultPosition = (role: string) => {
        setSelectedDefaultPositions((prev) =>
            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role].sort()
        );
    };

    useEffect(() => {
        setPositions((prev) => {
            const next: ExecutivePosition[] = [];
            selectedDefaultPositions.forEach((role) => {
                const ex = prev.find((p) => p.role === role);
                next.push(ex || { id: `pos-${Date.now()}-${role}`, role, count: 1 });
            });
            prev.forEach((p) => {
                if (!DEFAULT_POSITIONS.includes(p.role)) next.push(p);
            });
            return next;
        });
    }, [selectedDefaultPositions]);

    useEffect(() => {
        const positionsArray = positions
            .filter((pos) => pos.role && pos.count > 0)
            .map((pos) => ({ role: pos.role, count: pos.count }));
        const total = positionsArray.reduce((sum, p) => sum + p.count, 0);
        setData({ executive_positions: positionsArray, total_executives: total });
    }, [positions]);

    const updatePosition = (id: string, updates: Partial<ExecutivePosition>) => {
        setPositions(
            positions.map((p) => {
                if (p.id !== id) return p;
                const updated = { ...p, ...updates };
                if (updated.role.toUpperCase() === 'CXO') return p;
                return updated;
            })
        );
    };

    const addCustomPosition = () => {
        const name = customRoleName.trim();
        if (!name || DEFAULT_POSITIONS.includes(name)) {
            setCustomInputVisible(false);
            setCustomRoleName('');
            return;
        }
        setPositions((prev) => [...prev, { id: `pos-${Date.now()}`, role: name, count: 1 }]);
        setCustomInputVisible(false);
        setCustomRoleName('');
    };

    const removePosition = (id: string) => {
        const pos = positions.find((p) => p.id === id);
        if (pos && DEFAULT_POSITIONS.includes(pos.role)) {
            setSelectedDefaultPositions(selectedDefaultPositions.filter((r) => r !== pos.role));
        }
        setPositions(positions.filter((p) => p.id !== id));
    };

    const totalCount = positions
        .filter((p) => p.role && p.count > 0)
        .reduce((sum, p) => sum + p.count, 0);

    const getPositionCount = (role: string) => positions.find((p) => p.role === role)?.count ?? 0;

    const isReadOnlyStatus = diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
    const isReadOnly = readOnly || isReadOnlyStatus;

    const innerContent = (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[14px] overflow-hidden mb-3.5">
                    {/* Card header */}
                    <div className="py-4 px-[22px] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
                                {t('diagnosis.executives.card_title', '임원 포지션 설정')}
                            </h3>
                            <p className="text-[11.5px] text-slate-400 dark:text-slate-500 mt-0.5">
                                {t('diagnosis.executives.card_desc', '해당되는 임원 직책을 선택하고 인원수를 입력하세요')}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg py-1.5 px-3.5">
                            <span className="text-[11px] text-slate-600 dark:text-slate-300">
                                {t('diagnosis.executives.total_label', '총 임원')}
                            </span>
                            <strong className="text-[18px] font-bold text-slate-900 dark:text-slate-100 leading-none">
                                {totalCount}
                            </strong>
                            <em className="text-[11px] text-slate-400 dark:text-slate-500 not-italic">
                                {t('diagnosis.executives.total_suffix', '명')}
                            </em>
                        </div>
                    </div>

                    <div className="p-5 px-[22px]">
                        <div className="flex flex-col gap-2">
                            {/* Default position rows */}
                            {DEFAULT_POSITIONS.map((role) => {
                                const selected = selectedDefaultPositions.includes(role);
                                const count = getPositionCount(role);
                                return (
                                    <div
                                        key={role}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => !isReadOnly && toggleDefaultPosition(role)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                if (!isReadOnly) toggleDefaultPosition(role);
                                            }
                                        }}
                                        className={`flex items-center gap-3 py-2.5 px-3.5 border rounded-[10px] transition-all cursor-pointer ${
                                            selected
                                                ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-[0_0_0_1px_rgb(16_185_129)]'
                                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-900'
                                        }`}
                                    >
                                        <div
                                            className={`w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center shrink-0 ${
                                                selected
                                                    ? 'border-emerald-500 bg-emerald-500'
                                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                            }`}
                                        >
                                            {selected && <Check className="w-2.5 h-2.5 text-white" />}
                                        </div>
                                        <span
                                            className={`flex-1 text-[13px] font-semibold ${
                                                selected ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            {role}
                                        </span>
                                        <span className="text-[9.5px] font-semibold py-0.5 px-1.5 rounded-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                                            {t('diagnosis.executives.preset_badge', '기본')}
                                        </span>
                                        {selected && (
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={count}
                                                    onChange={(e) => {
                                                        const pos = positions.find((p) => p.role === role);
                                                        if (pos) updatePosition(pos.id, { count: parseInt(e.target.value, 10) || 0 });
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    disabled={isReadOnly}
                                                    className="w-12 text-center text-[12px] font-bold text-[var(--hr-navy)] border-0 bg-transparent focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                />
                                                <span className="text-[11px] text-[var(--hr-gray-400)]">
                                                    {t('diagnosis.executives.count_suffix', '명')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Custom positions */}
                            {positions
                                .filter((p) => !DEFAULT_POSITIONS.includes(p.role))
                                .map((position) => (
                                    <div
                                        key={position.id}
                                        className="flex items-center gap-2.5 py-2.5 px-3.5 border border-[var(--hr-mint)] rounded-[10px] bg-white shadow-[0_0_0_1px_var(--hr-mint)]"
                                    >
                                        <div className="w-[18px] h-[18px] rounded-[5px] border-2 border-[var(--hr-mint)] bg-[var(--hr-mint)] flex items-center justify-center shrink-0">
                                            <Check className="w-2.5 h-2.5 text-[var(--hr-navy-deep)]" />
                                        </div>
                                        <input
                                            type="text"
                                            value={position.role}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                if (v.toUpperCase() !== 'CXO') updatePosition(position.id, { role: v });
                                            }}
                                            placeholder={t('diagnosis.executives.custom_placeholder', '직책명 입력 (예: CPO, 부회장)')}
                                            disabled={isReadOnly}
                                            className="flex-1 text-[13px] font-semibold text-[var(--hr-gray-800)] border-0 bg-transparent outline-none placeholder:text-[var(--hr-gray-300)]"
                                        />
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="number"
                                                min={0}
                                                value={position.count}
                                                onChange={(e) =>
                                                    updatePosition(position.id, { count: parseInt(e.target.value, 10) || 0 })
                                                }
                                                disabled={isReadOnly}
                                                className="w-12 text-center text-[12px] font-bold text-[var(--hr-navy)] border-0 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="text-[11px] text-[var(--hr-gray-400)]">
                                                {t('diagnosis.executives.count_suffix', '명')}
                                            </span>
                                        </div>
                                        {!isReadOnly && (
                                            <button
                                                type="button"
                                                onClick={() => removePosition(position.id)}
                                                className="w-[22px] h-[22px] rounded-md bg-[var(--hr-gray-100)] flex items-center justify-center text-[12px] text-[var(--hr-gray-400)] hover:bg-[var(--hr-gray-200)] transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                            {/* Add custom row (inline input when visible) */}
                            {customInputVisible ? (
                                <div className="flex items-center gap-2.5 py-2.5 px-3.5 border border-[var(--hr-mint)] rounded-[10px] bg-white shadow-[0_0_0_1px_var(--hr-mint)] mt-1">
                                    <div className="w-[18px] h-[18px] rounded-[5px] border-2 border-[var(--hr-mint)] bg-[var(--hr-mint)] flex items-center justify-center shrink-0">
                                        <Check className="w-2.5 h-2.5 text-[var(--hr-navy-deep)]" />
                                    </div>
                                    <input
                                        type="text"
                                        value={customRoleName}
                                        onChange={(e) => setCustomRoleName(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomPosition(); } }}
                                        placeholder={t('diagnosis.executives.custom_placeholder', '직책명 입력 (예: CPO, 부회장)')}
                                        autoFocus
                                        className="flex-1 text-[13px] font-semibold text-[var(--hr-gray-800)] border-0 bg-transparent outline-none placeholder:text-[var(--hr-gray-300)]"
                                    />
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[12px] font-bold text-[var(--hr-navy)]">1</span>
                                        <span className="text-[11px] text-[var(--hr-gray-400)]">
                                            {t('diagnosis.executives.count_suffix', '명')}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCustomInputVisible(false);
                                            setCustomRoleName('');
                                        }}
                                        className="w-[22px] h-[22px] rounded-md bg-[var(--hr-gray-100)] flex items-center justify-center text-[12px] text-[var(--hr-gray-400)] hover:bg-[var(--hr-gray-200)]"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setCustomInputVisible(true)}
                                    disabled={isReadOnly}
                                    className="flex items-center gap-2 py-2.5 px-3.5 mt-1 border border-dashed border-[var(--hr-gray-200)] rounded-[10px] bg-transparent cursor-pointer hover:border-[var(--hr-mint)] hover:bg-[var(--hr-mint-dim)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                                >
                                    <div className="w-[22px] h-[22px] rounded-md bg-[var(--hr-gray-100)] flex items-center justify-center text-[14px] text-[var(--hr-gray-400)]">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <span className="text-[12.5px] font-medium text-[var(--hr-gray-400)]">
                                        {t('diagnosis.executives.add_custom', '커스텀 임원 직책 추가')}
                                    </span>
                                </button>
                            )}
                        </div>
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
