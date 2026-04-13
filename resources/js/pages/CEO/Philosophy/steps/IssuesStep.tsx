import React from 'react';
import { Input } from '@/components/ui/input';
import { ISSUE_CATEGORY_META, MAX_ORGANIZATIONAL_ISSUES } from '../constants';
import type { HrIssue, SurveyFormData } from '../types';
import { usePhilosophyText } from '../uiText';

interface IssuesStepProps {
    hrIssues: HrIssue[];
    data: SurveyFormData;
    setData: <K extends keyof SurveyFormData>(key: K, value: SurveyFormData[K]) => void;
    showError?: boolean;
}

export default function IssuesStep({ hrIssues, data, setData, showError = false }: IssuesStepProps) {
    const { isKo } = usePhilosophyText();
    const orderedIds = (data.organizational_issues || []).map((id) => id.toString());
    const maxReached = orderedIds.length >= MAX_ORGANIZATIONAL_ISSUES;
    const hasError = showError && orderedIds.length === 0;
    const [draggingId, setDraggingId] = React.useState<string | null>(null);

    const issueMap = React.useMemo(() => {
        const m: Record<string, { name: string; category: string }> = {};
        hrIssues.forEach((i) => {
            m[i.id.toString()] = { name: i.name, category: i.category || 'others' };
        });
        return m;
    }, [hrIssues]);

    const grouped = React.useMemo(() => {
        const acc: Record<string, HrIssue[]> = {};
        hrIssues.forEach((issue) => {
            const cat = issue.category || 'others';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(issue);
        });
        return acc;
    }, [hrIssues]);

    const selectedDetails = orderedIds
        .map((id) => {
            const info = issueMap[id];
            return info ? { id, name: info.name, category: info.category } : null;
        })
        .filter(Boolean) as { id: string; name: string; category: string }[];

    const toggleIssue = (issueId: string) => {
        const current = [...orderedIds];
        const idx = current.indexOf(issueId);
        if (idx !== -1) {
            current.splice(idx, 1);
            setData('organizational_issues', current);
            return;
        }
        if (current.length >= MAX_ORGANIZATIONAL_ISSUES) {
            return;
        }
        setData('organizational_issues', [...current, issueId]);
    };

    const removeIssue = (issueId: string) => {
        setData(
            'organizational_issues',
            orderedIds.filter((id) => id !== issueId)
        );
    };

    const getCategoryMeta = (category: string) =>
        ISSUE_CATEGORY_META[category] ?? ISSUE_CATEGORY_META.others ?? { name: category, icon: '🔧' };

    const moveIssue = React.useCallback(
        (activeId: string, overId: string) => {
            if (!activeId || !overId || activeId === overId) return;
            const current = [...orderedIds];
            const from = current.indexOf(activeId);
            const to = current.indexOf(overId);
            if (from === -1 || to === -1) return;
            current.splice(from, 1);
            current.splice(to, 0, activeId);
            setData('organizational_issues', current);
        },
        // orderedIds comes from data; re-create callback when it changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [orderedIds.join('|'), setData]
    );

    return (
        <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Section header */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-[52px] h-[52px] flex-shrink-0 rounded-xl bg-[#0E1628] flex items-center justify-center text-2xl">
                    🏗️
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-[#C9A84C] mb-1">
                        {isKo ? '섹션 7 / 8' : 'Step 7 of 8'}
                    </div>
                    <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#0E1628] dark:text-slate-100 mb-1.5">
                        {isKo ? '조직 이슈' : 'Organizational Issues'}
                    </h2>
                    <p className="text-[13px] text-[#4A4E69] dark:text-slate-400 font-light leading-relaxed max-w-[580px]">
                        {isKo
                            ? '아래 이슈는 HR 담당자가 현재 조직의 핵심 과제로 제시한 항목입니다. CEO 관점에서 공감하는 항목을 선택해 주세요.'
                            : 'These issues have been identified by your HR manager as key challenges currently facing the company. Please select the issues that you also agree are relevant from your perspective as CEO.'}
                    </p>
                </div>
            </div>

            {/* Callout */}
            <div className="bg-[#0E1628] rounded-[10px] px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 relative overflow-hidden">
                <div className="absolute top-[-30px] right-[-20px] w-[110px] h-[110px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.2)_0%,transparent_65%)]" />
                <span className="text-xl flex-shrink-0 relative">🎯</span>
                <div className="relative min-w-0 flex-1">
                    <strong className="block text-xs font-medium text-[#E8C96B] mb-0.5">
                        {isKo ? '가장 중요하다고 생각하는 이슈를 최대 5개까지 선택해 주세요.' : 'Select up to 5 issues that resonate most with you.'}
                    </strong>
                    <span className="text-[11.5px] text-white/50 font-light">
                        {isKo
                            ? '선택 순서대로 우선순위가 반영됩니다. 첫 번째 선택 항목이 가장 중요한 이슈로 간주됩니다.'
                            : 'Your selections will be prioritized in the order chosen — the first issue you pick is weighted as most critical.'}
                    </span>
                </div>
            </div>
            {maxReached && (
                <div className="text-[12px] text-[#B08C2E] dark:text-[#E8C96B] -mt-3">
                    {isKo ? `최대 ${MAX_ORGANIZATIONAL_ISSUES}개까지 선택할 수 있습니다. 하나를 제거한 뒤 추가해 주세요.` : `You’ve selected the maximum of ${MAX_ORGANIZATIONAL_ISSUES}. Remove one to add another.`}
                </div>
            )}
            {hasError && (
                <div className="text-sm font-medium text-red-600 dark:text-red-400 -mt-3">
                    {isKo ? '다음으로 진행하려면 최소 1개의 조직 이슈를 선택해 주세요.' : 'Please select at least one organizational issue before continuing.'}
                </div>
            )}

            {/* Selected panel */}
            <div className={`bg-white dark:bg-slate-900 border-[1.5px] rounded-xl p-5 sm:p-6 relative overflow-hidden animate-in fade-in duration-300 ${hasError ? 'border-red-300 dark:border-red-500/60 bg-red-50/40 dark:bg-red-950/20' : 'border-[#0E1628] dark:border-slate-700'}`}>
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0E1628] to-[#C9A84C]" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <span className="font-serif text-sm font-bold text-[#0E1628] dark:text-slate-100">
                        {isKo ? '선택한 핵심 이슈 (우선순위 순)' : 'Your Top Issues (in priority order)'}
                    </span>
                    <span className="text-[11px] text-[#9A9EB8] dark:text-slate-400">
                        {isKo ? '드래그로 순서 변경 · × 클릭으로 제거 · 첫 번째가 최우선' : 'Drag to reorder · Click × to remove · First = highest priority'}
                    </span>
                </div>
                <div className="min-h-[44px] flex flex-col gap-2">
                    {selectedDetails.length === 0 ? (
                        <div className="text-center py-4 px-4 text-[12.5px] text-[#9A9EB8] dark:text-slate-400 border-2 border-dashed border-[#E2DDD4] dark:border-slate-600 rounded-lg italic">
                            {isKo ? '아래 카테고리에서 최대 5개를 선택해 주세요.' : 'Select issues from the categories below — up to 5'}
                        </div>
                    ) : (
                        selectedDetails.map((item, idx) => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => {
                                    setDraggingId(item.id);
                                    e.dataTransfer.effectAllowed = 'move';
                                    try {
                                        e.dataTransfer.setData('text/plain', item.id);
                                    } catch {
                                        /* ignore */
                                    }
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    const active = draggingId || (() => {
                                        try {
                                            return e.dataTransfer.getData('text/plain');
                                        } catch {
                                            return '';
                                        }
                                    })();
                                    if (active) moveIssue(active, item.id);
                                }}
                                onDragEnd={() => setDraggingId(null)}
                                onDrop={() => setDraggingId(null)}
                                aria-grabbed={draggingId === item.id}
                                className={`flex items-center gap-2.5 bg-[#F8F4ED] dark:bg-slate-800 border border-[#E2DDD4] dark:border-slate-600 rounded-lg py-2.5 px-3.5 animate-in fade-in duration-200 cursor-move select-none ${
                                    draggingId === item.id ? 'ring-2 ring-[#C9A84C]/60' : ''
                                }`}
                                title={isKo ? '드래그로 순서 변경' : 'Drag to reorder'}
                            >
                                <div className="w-[22px] h-[22px] rounded-full bg-[#0E1628] text-[#E8C96B] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <span className="flex-1 text-[13px] text-[#1A1A2E] dark:text-slate-200 font-normal">
                                    {item.name}
                                    <span className="text-[10px] text-[#9A9EB8] dark:text-slate-400 ml-1">
                                        {getCategoryMeta(item.category).name}
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeIssue(item.id)}
                                    className="w-[22px] h-[22px] rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-[11px] text-[#E05A5A] flex-shrink-0 transition-colors"
                                    title={isKo ? '제거' : 'Remove'}
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Category blocks + chips */}
            <div className="space-y-7">
                {Object.entries(grouped).map(([category, issues], ci) => {
                    const meta = getCategoryMeta(category);
                    const selectedInCat = issues.filter((i) => orderedIds.includes(i.id.toString())).length;
                    return (
                        <div key={category} className="space-y-3" style={{ animationDelay: `${ci * 0.06}s` }}>
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#0E1628] flex items-center justify-center text-[15px] flex-shrink-0">
                                    {meta.icon}
                                </div>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0E1628] dark:text-slate-200">
                                    {meta.name}
                                </span>
                                {selectedInCat > 0 && (
                                    <span className="ml-auto text-[11px] text-[#9A9EB8] dark:text-slate-400">
                                        {isKo ? `${selectedInCat}개 선택` : `${selectedInCat} selected`}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {issues.map((issue) => {
                                    const idStr = issue.id.toString();
                                    const isSelected = orderedIds.includes(idStr);
                                    const disabled = maxReached && !isSelected;
                                    return (
                                        <button
                                            key={issue.id}
                                            type="button"
                                            onClick={() => !disabled && toggleIssue(idStr)}
                                            className={`
                                                flex items-start gap-2 rounded-lg px-3.5 py-2.5 border-[1.5px] text-left transition-all
                                                ${isSelected
                                                    ? 'bg-[#0E1628] border-[#0E1628] text-white shadow-md'
                                                    : 'bg-white dark:bg-slate-800 border-[#E2DDD4] dark:border-slate-600 text-[#1A1A2E] dark:text-slate-200 hover:border-[#0E1628]/25 dark:hover:border-slate-500 hover:shadow-sm'
                                                }
                                                ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
                                            `}
                                        >
                                            <span
                                                className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5 border-2 transition-colors ${
                                                    isSelected
                                                        ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0E1628]'
                                                        : 'bg-white border-[#E2DDD4] text-transparent'
                                                }`}
                                            >
                                                {isSelected ? '✓' : ''}
                                            </span>
                                            <span className="text-[12.5px] leading-snug font-normal">
                                                {issue.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Other */}
            <div className="pt-4 border-t border-[#E2DDD4] dark:border-slate-700 space-y-2">
                <label className="text-sm font-medium text-[#1A1A2E] dark:text-slate-200">
                    {isKo ? '기타 (위 목록 외 추가 이슈 작성)' : 'Other (describe additional issues not listed above)'}
                </label>
                <Input
                    value={data.organizational_issues_other || ''}
                    onChange={(e) => setData('organizational_issues_other', e.target.value)}
                    placeholder={isKo ? '추가 HR/조직 이슈를 작성해 주세요...' : 'Please describe additional HR or organizational issues...'}
                    className="border-[#E2DDD4] dark:border-slate-600 bg-[#FAFAF8] dark:bg-slate-800 text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#9A9EB8] dark:placeholder:text-slate-500"
                />
            </div>
        </div>
    );
}
