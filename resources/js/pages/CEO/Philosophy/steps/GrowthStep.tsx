import React, { useMemo } from 'react';
import { GROWTH_STAGES } from '../constants';
import type { GrowthStageConfig } from '../types';

interface GrowthStepProps {
    value: string;
    onChange: (value: string) => void;
}

/** Normalize saved value (id or full option text) to stage id */
function valueToStageId(value: string): string | null {
    if (!value || !value.trim()) return null;
    const v = value.trim();
    const byId = GROWTH_STAGES.find((s) => s.id === v);
    if (byId) return byId.id;
    const byTitle = GROWTH_STAGES.find(
        (s) => v.includes(s.title) || v.toLowerCase().includes(s.id)
    );
    return byTitle ? byTitle.id : null;
}

export default function GrowthStep({ value, onChange }: GrowthStepProps) {
    const selectedId = useMemo(() => valueToStageId(value), [value]);
    const selectedStage = useMemo(
        () => GROWTH_STAGES.find((s) => s.id === selectedId),
        [selectedId]
    );

    const trackFillPercent =
        selectedId === null
            ? 0
            : (GROWTH_STAGES.findIndex((s) => s.id === selectedId) / (GROWTH_STAGES.length - 1)) * 100;

    const handleSelect = (id: string) => {
        onChange(id);
    };

    return (
        <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Section header */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-[52px] h-[52px] flex-shrink-0 rounded-xl bg-[#0E1628] flex items-center justify-center text-2xl">
                    📈
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-[#C9A84C] mb-1">
                        Step 4 of 8
                    </div>
                    <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#0E1628] mb-1.5">
                        Growth Stage
                    </h2>
                    <p className="text-[12px] sm:text-[13px] text-[#4A4E69] font-light leading-relaxed max-w-[560px]">
                        This section identifies your company's current growth phase to align organizational structure and people strategy with business maturity.
                    </p>
                </div>
            </div>

            {/* Question */}
            <div className="space-y-1">
                <p className="text-sm sm:text-[14px] text-[#1A1A2E] leading-relaxed font-normal">
                    What is the growth stage closest to your company's current situation?
                    <span className="text-[#E05A5A] ml-0.5">*</span>
                </p>
                <p className="text-xs text-[#9A9EB8] italic mt-1">
                    Choose the most similar stage even if it doesn't match perfectly.
                </p>
            </div>

            {/* Timeline + Cards */}
            <div className="relative">
                {/* Timeline track */}
                <div
                    className="absolute top-[52px] left-[calc(10%+24px)] right-[calc(10%+24px)] h-0.5 bg-[#E2DDD4] z-0 rounded-sm overflow-hidden hidden sm:block"
                    aria-hidden
                >
                    <div
                        className="h-full bg-gradient-to-r from-[#0E1628] to-[#C9A84C] rounded-sm transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{ width: `${trackFillPercent}%` }}
                    />
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 relative z-10">
                    {GROWTH_STAGES.map((stage, i) => (
                        <StageCard
                            key={stage.id}
                            stage={stage}
                            stepNumber={i + 1}
                            isSelected={selectedId === stage.id}
                            onSelect={() => handleSelect(stage.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Detail panel */}
            {selectedStage && (
                <div className="mt-5 bg-white border-[1.5px] border-[#0E1628] rounded-xl p-6 sm:p-7 animate-in fade-in slide-in-from-bottom-4 duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0E1628] to-[#C9A84C]" />
                    <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-11 h-11 rounded-[10px] bg-[#0E1628] flex items-center justify-center text-[22px] flex-shrink-0">
                            {selectedStage.icon}
                        </div>
                        <div>
                            <div className="font-serif text-[17px] font-bold text-[#0E1628]">
                                {selectedStage.title} Phase
                            </div>
                            <div className="text-xs text-[#9A9EB8]">Your selected growth stage</div>
                        </div>
                    </div>
                    <p className="text-[13px] text-[#4A4E69] leading-relaxed font-light mb-4">
                        {selectedStage.detail}
                    </p>
                    <div className="text-[10px] font-medium uppercase tracking-widest text-[#C9A84C] mb-2.5">
                        Key HR challenges at this stage
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedStage.hrIssues.map((issue) => (
                            <span
                                key={issue}
                                className="px-3 py-1.5 rounded-[14px] bg-[#0E1628]/5 border border-[#0E1628]/10 text-[11.5px] text-[#1A1A2E] font-normal"
                            >
                                {issue}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function StageCard({
    stage,
    stepNumber,
    isSelected,
    onSelect,
}: {
    stage: GrowthStageConfig;
    stepNumber: number;
    isSelected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`
                w-full  border-2 rounded-xl py-5 px-3.5 sm:py-5 sm:px-4 flex flex-col items-center text-center relative
                transition-all duration-200 select-none touch-manipulation
                hover:border-[#0E1628]/30 hover:shadow-[0_4px_16px_rgba(14,22,40,0.08)] hover:-translate-y-0.5
                ${isSelected
                    ? 'border-[#0E1628] shadow-[0_6px_24px_rgba(14,22,40,0.14)] -translate-y-1 bg-[#0E1628]'
                    : 'border-[#E2DDD4] bg-white'
                }
            `}
        >
            {/* Step number */}
            <div
                className={`
                    absolute -top-2.5 left-1/2 -translate-x-1/2 w-[22px] h-[22px] rounded-full
                    flex items-center justify-center text-[10px] font-semibold border-2 transition-all
                    ${isSelected
                        ? 'bg-[#0E1628] border-[#0E1628] text-[#E8C96B]'
                        : 'bg-white border-[#E2DDD4] text-[#9A9EB8]'
                    }
                `}
            >
                {stepNumber}
            </div>

            {/* Icon */}
            <div
                className={`
                    w-[52px] h-[52px] rounded-xl flex items-center justify-center text-[26px] mb-3
                    border-[1.5px] transition-all
                    ${isSelected
                        ? 'bg-[#0E1628] border-[#0E1628]'
                        : 'bg-[#F8F4ED] border-[#E2DDD4]'
                    }
                `}
            >
                {stage.icon}
            </div>

            {/* Title */}
            <div
                className={`font-serif text-[12.5px] font-bold leading-tight mb-2 ${isSelected ? 'text-white' : 'text-[#0E1628]'}`}
            >
                {stage.title}
            </div>

            {/* Keyword */}
            <span
                className={`
                    inline-block rounded-[10px] px-2 py-0.5 text-[10px] font-medium mb-2.5 leading-snug
                    ${isSelected
                        ? 'bg-[#E8C96B]/20 border border-[#E8C96B]/50 text-[#E8C96B]'
                        : 'bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#8A6820]'
                    }
                `}
            >
                {stage.keyword}
            </span>

            {/* Description */}
            <p
                className={`text-[11px] leading-snug font-light ${isSelected ? 'text-white/60' : 'text-[#9A9EB8]'}`}
            >
                {stage.desc}
            </p>
        </button>
    );
}
