import React from 'react';
import { Input } from '@/components/ui/input';
import { ISSUE_CATEGORY_META, MAX_ORGANIZATIONAL_ISSUES } from '../constants';
import { toast } from '@/hooks/use-toast';
import type { HrIssue, SurveyFormData } from '../types';

interface IssuesStepProps {
    hrIssues: HrIssue[];
    data: SurveyFormData;
    setData: <K extends keyof SurveyFormData>(key: K, value: SurveyFormData[K]) => void;
}

export default function IssuesStep({ hrIssues, data, setData }: IssuesStepProps) {
    const orderedIds = (data.organizational_issues || []).map((id) => id.toString());
    const maxReached = orderedIds.length >= MAX_ORGANIZATIONAL_ISSUES;

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
            toast({
                title: 'Maximum 5 issues',
                description: 'Remove one to add another.',
                variant: 'destructive',
            });
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

    return (
        <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Section header */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-[52px] h-[52px] flex-shrink-0 rounded-xl bg-[#0E1628] flex items-center justify-center text-2xl">
                    🏗️
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-[#C9A84C] mb-1">
                        Step 7 of 8
                    </div>
                    <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#0E1628] mb-1.5">
                        Organizational Issues
                    </h2>
                    <p className="text-[13px] text-[#4A4E69] font-light leading-relaxed max-w-[580px]">
                        These issues have been identified by your HR manager as key challenges currently facing the company. Please select the issues that you also agree are relevant from your perspective as CEO.
                    </p>
                </div>
            </div>

            {/* Callout */}
            <div className="bg-[#0E1628] rounded-[10px] px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 relative overflow-hidden">
                <div className="absolute top-[-30px] right-[-20px] w-[110px] h-[110px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.2)_0%,transparent_65%)]" />
                <span className="text-xl flex-shrink-0 relative">🎯</span>
                <div className="relative min-w-0 flex-1">
                    <strong className="block text-xs font-medium text-[#E8C96B] mb-0.5">
                        Select up to 5 issues that resonate most with you.
                    </strong>
                    <span className="text-[11.5px] text-white/50 font-light">
                        Your selections will be prioritized in the order chosen — the first issue you pick is weighted as most critical.
                    </span>
                </div>
            </div>

            {/* Selected panel */}
            <div className="bg-white border-[1.5px] border-[#0E1628] rounded-xl p-5 sm:p-6 relative overflow-hidden animate-in fade-in duration-300">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0E1628] to-[#C9A84C]" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <span className="font-serif text-sm font-bold text-[#0E1628]">
                        Your Top Issues (in priority order)
                    </span>
                    <span className="text-[11px] text-[#9A9EB8]">
                        Click × to remove · First selected = highest priority
                    </span>
                </div>
                <div className="min-h-[44px] flex flex-col gap-2">
                    {selectedDetails.length === 0 ? (
                        <div className="text-center py-4 px-4 text-[12.5px] text-[#9A9EB8] border-2 border-dashed border-[#E2DDD4] rounded-lg italic">
                            Select issues from the categories below — up to 5
                        </div>
                    ) : (
                        selectedDetails.map((item, idx) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-2.5 bg-[#F8F4ED] border border-[#E2DDD4] rounded-lg py-2.5 px-3.5 animate-in fade-in duration-200"
                            >
                                <div className="w-[22px] h-[22px] rounded-full bg-[#0E1628] text-[#E8C96B] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <span className="flex-1 text-[13px] text-[#1A1A2E] font-normal">
                                    {item.name}
                                    <span className="text-[10px] text-[#9A9EB8] ml-1">
                                        {getCategoryMeta(item.category).name}
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeIssue(item.id)}
                                    className="w-[22px] h-[22px] rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-[11px] text-[#E05A5A] flex-shrink-0 transition-colors"
                                    title="Remove"
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
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0E1628]">
                                    {meta.name}
                                </span>
                                {selectedInCat > 0 && (
                                    <span className="ml-auto text-[11px] text-[#9A9EB8]">{selectedInCat} selected</span>
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
                                                    : 'bg-white border-[#E2DDD4] text-[#1A1A2E] hover:border-[#0E1628]/25 hover:shadow-sm'
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
            <div className="pt-4 border-t border-[#E2DDD4] space-y-2">
                <label className="text-sm font-medium text-[#1A1A2E]">
                    Other (describe additional issues not listed above)
                </label>
                <Input
                    value={data.organizational_issues_other || ''}
                    onChange={(e) => setData('organizational_issues_other', e.target.value)}
                    placeholder="Please describe additional HR or organizational issues..."
                    className="border-[#E2DDD4] bg-[#FAFAF8]"
                />
            </div>
        </div>
    );
}
