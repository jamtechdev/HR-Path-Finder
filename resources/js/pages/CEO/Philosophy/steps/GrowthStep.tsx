import React, { useMemo } from 'react';
import { GROWTH_STAGES } from '../constants';
import type { GrowthStageConfig } from '../types';
import { usePhilosophyText } from '../uiText';

interface GrowthStepProps {
    value: string;
    onChange: (value: string) => void;
    showError?: boolean;
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

export default function GrowthStep({ value, onChange, showError = false }: GrowthStepProps) {
    const { isKo } = usePhilosophyText();
    const selectedId = useMemo(() => valueToStageId(value), [value]);
    const selectedStage = useMemo(
        () => GROWTH_STAGES.find((s) => s.id === selectedId),
        [selectedId]
    );
    const stageKoText = useMemo(() => ({
        foundation: {
            title: '기반 구축',
            detail: '인력과 조직의 기반을 만드는 초기 단계입니다. 급격한 확장 전에 핵심 역할, 보상 기준, 문화 기반을 우선 정립하는 것이 중요합니다.',
            issues: ['직무 레벨 체계 미정', '케이스별 보상 운영', '창업자 중심 문화', '온보딩 체계 부족', '역할 중복 빈번'],
        },
        acceleration: {
            title: '성장 가속',
            detail: '성장 속도가 빠른 단계로, 역할/보상/성과 기준이 불명확하면 혼선이 커집니다. 구조화된 기준 정립이 핵심입니다.',
            issues: ['역할 명확성 저하', '보상 공정성 리스크', '핵심인재 유지 압박', '관리자층 필요', '성과 격차 확대'],
        },
        expansion: {
            title: '안정 확장',
            detail: '채용 속도보다 인재 최적화가 중요한 단계입니다. 경력경로, 성과관리, 핵심인재 유지 체계를 정교화해야 합니다.',
            issues: ['커리어 경로 기대 증가', '중간관리자 역량 과제', '승계 계획 필요', '몰입도 정체', '부서 간 마찰'],
        },
        optimization: {
            title: '수익 최적화',
            detail: '성장 정체 구간에서 효율 중심 운영이 중요해집니다. 인력 생산성과 보상 ROI 관점의 재정렬이 필요합니다.',
            issues: ['생산성 측정 공백', '기능별 인력 비효율', '성과연동 보상 설계', '재교육 vs 충원 의사결정', '저성과 관리'],
        },
        restructuring: {
            title: '구조 재편',
            detail: '사업 전환 압력이 큰 단계입니다. 인력 전환, 핵심 인재 유지, 변화관리 체계가 성패를 좌우합니다.',
            issues: ['인력 조정 계획', '핵심인재 이탈 리스크', '문화 회복 탄력성', '역할 통합 필요', '변화관리 역량'],
        },
    }), []);
    const hasError = showError && !selectedId;

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
                        {isKo ? '섹션 4 / 8' : 'Step 4 of 8'}
                    </div>
                    <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#0E1628] mb-1.5 dark:text-slate-100">
                        {isKo ? '성장 단계' : 'Growth Stage'}
                    </h2>
                    <p className="text-[12px] sm:text-[13px] text-[#4A4E69] font-light leading-relaxed max-w-[560px] dark:text-slate-300">
                        {isKo ? '회사의 현재 성장 단계를 파악하여 조직 구조와 인사 전략을 비즈니스 성숙도에 맞추기 위한 섹션입니다.' : "This section identifies your company's current growth phase to align organizational structure and people strategy with business maturity."}
                    </p>
                </div>
            </div>

            {/* Question */}
            <div className="space-y-1">
                <p className="text-sm sm:text-[14px] text-[#1A1A2E] leading-relaxed font-normal dark:text-slate-100">
                    {isKo ? '현재 회사 상황과 가장 가까운 성장 단계를 선택해 주세요.' : "What is the growth stage closest to your company's current situation?"}
                    <span className="text-[#E05A5A] ml-0.5">*</span>
                </p>
                <p className="text-xs text-[#9A9EB8] italic mt-1 dark:text-slate-400">
                    {isKo ? '완전히 일치하지 않아도 가장 유사한 단계를 선택해 주세요.' : "Choose the most similar stage even if it doesn't match perfectly."}
                </p>
                {hasError && (
                    <p className="text-sm font-medium text-red-600">{isKo ? '회사의 성장 단계를 선택해 주세요.' : "Please select your company's growth stage."}</p>
                )}
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
                            hasError={hasError}
                        />
                    ))}
                </div>
            </div>

            {/* Detail panel */}
            {selectedStage && (
                <div className="mt-5 bg-white border-[1.5px] border-[#0E1628] rounded-xl p-6 sm:p-7 animate-in fade-in slide-in-from-bottom-4 duration-300 relative overflow-hidden dark:border-slate-600 dark:bg-slate-800">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0E1628] to-[#C9A84C]" />
                    <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-11 h-11 rounded-[10px] bg-[#0E1628] flex items-center justify-center text-[22px] flex-shrink-0">
                            {selectedStage.icon}
                        </div>
                        <div>
                            <div className="font-serif text-[17px] font-bold text-[#0E1628] dark:text-slate-100">
                                {isKo ? `${stageKoText[selectedStage.id as keyof typeof stageKoText]?.title ?? selectedStage.title} 단계` : `${selectedStage.title} Phase`}
                            </div>
                            <div className="text-xs text-[#9A9EB8] dark:text-slate-400">{isKo ? '선택한 성장 단계' : 'Your selected growth stage'}</div>
                        </div>
                    </div>
                    <p className="text-[13px] text-[#4A4E69] leading-relaxed font-light mb-4 dark:text-slate-300">
                        {isKo
                            ? stageKoText[selectedStage.id as keyof typeof stageKoText]?.detail ?? selectedStage.detail
                            : selectedStage.detail}
                    </p>
                    <div className="text-[10px] font-medium uppercase tracking-widest text-[#C9A84C] mb-2.5">
                        {isKo ? '이 단계의 핵심 HR 과제' : 'Key HR challenges at this stage'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(isKo
                            ? (stageKoText[selectedStage.id as keyof typeof stageKoText]?.issues ?? selectedStage.hrIssues)
                            : selectedStage.hrIssues
                        ).map((issue) => (
                            <span
                                key={issue}
                                className="px-3 py-1.5 rounded-[14px] bg-[#0E1628]/5 border border-[#0E1628]/10 text-[11.5px] text-[#1A1A2E] font-normal dark:border-slate-600 dark:bg-slate-700/60 dark:text-slate-200"
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
    hasError = false,
}: {
    stage: GrowthStageConfig;
    stepNumber: number;
    isSelected: boolean;
    onSelect: () => void;
    hasError?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`
                w-full border-2 rounded-xl py-5 px-3.5 sm:py-5 sm:px-4 flex flex-col items-center text-center relative
                transition-all duration-200 select-none touch-manipulation
                hover:border-[#0E1628]/30 hover:shadow-[0_4px_16px_rgba(14,22,40,0.08)] hover:-translate-y-0.5
                ${isSelected
                    ? 'border-[#0E1628] shadow-[0_6px_24px_rgba(14,22,40,0.14)] -translate-y-1 bg-[#0E1628]'
                    : hasError
                        ? 'border-red-300 bg-red-50/40'
                        : 'border-[#E2DDD4] bg-white dark:border-slate-600 dark:bg-slate-800'
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
                        : 'bg-white border-[#E2DDD4] text-[#9A9EB8] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400'
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
                        : 'bg-[#F8F4ED] border-[#E2DDD4] dark:border-slate-600 dark:bg-slate-700'
                    }
                `}
            >
                {stage.icon}
            </div>

            {/* Title */}
            <div
                className={`font-serif text-[12.5px] font-bold leading-tight mb-2 ${isSelected ? 'text-white' : 'text-[#0E1628] dark:text-slate-100'}`}
            >
                {stage.title}
            </div>

            {/* Keyword */}
            <span
                className={`
                    inline-block rounded-[10px] px-2 py-0.5 text-[10px] font-medium mb-2.5 leading-snug
                    ${isSelected
                        ? 'bg-[#E8C96B]/20 border border-[#E8C96B]/50 text-[#E8C96B]'
                        : 'bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#8A6820] dark:bg-amber-900/20 dark:text-amber-300'
                    }
                `}
            >
                {stage.keyword}
            </span>

            {/* Description */}
            <p
                className={`text-[11px] leading-snug font-light ${isSelected ? 'text-white/60' : 'text-[#9A9EB8] dark:text-slate-400'}`}
            >
                {stage.desc}
            </p>
        </button>
    );
}
