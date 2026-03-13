import React from 'react';
import { LEADERSHIP_SCENARIOS } from '../constants';
import type { DiagnosisQuestion, SurveyFormData } from '../types';

interface LeadershipStepProps {
    questions: DiagnosisQuestion[];
    data: SurveyFormData;
    setData: (key: 'leadership', value: SurveyFormData['leadership']) => void;
}

function getScenarioMeta(index: number, question: DiagnosisQuestion) {
    const preset = LEADERSHIP_SCENARIOS[index];
    if (preset) return preset;
    const meta = (question.metadata || {}) as { option_a?: string; option_b?: string };
    const left = meta.option_a || '';
    const right = meta.option_b || '';
    return {
        scenario: question.question_text.slice(0, 40) + (question.question_text.length > 40 ? '…' : ''),
        icon: '📋',
        leftLabel: left.slice(0, 28) + (left.length > 28 ? '…' : '') || 'Left',
        rightLabel: right.slice(0, 28) + (right.length > 28 ? '…' : '') || 'Right',
    };
}

export default function LeadershipStep({ questions, data, setData }: LeadershipStepProps) {
    return (
        <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Section header */}
            <div className="flex flex-col lg:flex-row items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-[52px] sm:h-[52px] flex-shrink-0 rounded-xl bg-[#0E1628] flex items-center justify-center text-xl sm:text-2xl">
                    🎖️
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-[10px] font-medium uppercase tracking-wider text-[#C9A84C] mb-1">
                        Step 5 of 8
                    </div>
                    <h2 className="font-serif text-lg sm:text-[20px] sm:text-[22px] font-bold text-[#0E1628] mb-1.5 leading-tight">
                        Leadership
                    </h2>
                    <p className="text-sm sm:text-[13px] text-[#4A4E69] font-light leading-relaxed">
                        Real workplace scenarios — choose where you stand on a scale of 1 to 7. This section examines leadership style and management practices to assess how leadership impacts execution and organizational culture.
                    </p>
                </div>
            </div>

            {/* Callout */}
            <div className="bg-[#0E1628] rounded-[10px] px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 relative overflow-hidden">
                <div className="absolute top-[-30px] right-[-20px] w-[110px] h-[110px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.2)_0%,transparent_65%)]" />
                <span className="text-xl flex-shrink-0 relative">⚖️</span>
                <div className="relative min-w-0 flex-1">
                    <strong className="block text-xs font-medium text-[#E8C96B] mb-0.5">
                        No right or wrong answer — only your philosophy.
                    </strong>
                    <span className="text-[11.5px] text-white/50 font-light">
                        Each scenario has two legitimate perspectives. Place yourself honestly between them.
                    </span>
                </div>
            </div>

            {/* Scenario cards */}
            <div className="space-y-4">
                {questions.map((question, qi) => {
                    const qId = question.id.toString();
                    const value = data.leadership[qId];
                    const num = typeof value === 'number' && value >= 1 && value <= 7 ? value : null;
                    const answered = num !== null;
                    const meta = getScenarioMeta(qi, question);
                    const optionA = ((question.metadata as { option_a?: string }) || {}).option_a || '';
                    const optionB = ((question.metadata as { option_b?: string }) || {}).option_b || '';

                    return (
                        <div
                            key={question.id}
                            className={`bg-white border-[1.5px] rounded-xl overflow-hidden transition-colors ${
                                answered ? 'border-[#0E1628]/20' : 'border-[#E2DDD4]'
                            }`}
                            style={{ animationDelay: `${qi * 0.06}s` }}
                        >
                            {/* Card top bar */}
                            <div className="px-4 sm:px-5 py-4 sm:py-5 border-b border-[#E2DDD4] flex items-start gap-3 sm:gap-4">
                                <div
                                    className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center text-base sm:text-lg flex-shrink-0 border transition-colors min-h-[44px] min-w-[44px] ${
                                        answered ? 'bg-[#0E1628] border-[#0E1628]' : 'bg-[#F8F4ED] border-[#E2DDD4]'
                                    }`}
                                >
                                    {meta.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#9A9EB8]">
                                            Scenario {qi + 1}
                                        </span>
                                        {answered && (
                                            <span className="text-[10.5px] text-[#2E9E6B] font-medium">✓ Answered</span>
                                        )}
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 bg-[#C9A84C]/10 border border-[#C9A84C]/25 rounded-[10px] px-2 py-0.5 text-[10.5px] text-[#8A6820] font-medium mb-2">
                                        📋 {meta.scenario}
                                    </div>
                                    <p className="text-sm text-[#1A1A2E] leading-relaxed">
                                        {question.question_text}
                                        <span className="text-[#E05A5A] ml-0.5">*</span>
                                    </p>
                                </div>
                            </div>

                            {/* Choice area */}
                            <div className="p-4 sm:p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2.5 sm:gap-3 items-start mb-4">
                                    <div className="bg-[#F8F4ED] border border-[#E2DDD4] rounded-lg p-3 sm:p-4 border-l-[3px] border-l-[#0E1628]">
                                        <strong className="block text-[11px] font-semibold text-[#0E1628] uppercase tracking-wide mb-1">
                                            {meta.leftLabel}
                                        </strong>
                                        <p className="text-xs text-[#4A4E69] font-light leading-relaxed">{optionA}</p>
                                    </div>
                                    <div className="hidden sm:flex w-7 h-7 rounded-full bg-[#E2DDD4] items-center justify-center text-[10px] font-semibold text-[#9A9EB8] flex-shrink-0 mt-3">
                                        VS
                                    </div>
                                    <div className="bg-[#F8F4ED] border border-[#E2DDD4] rounded-lg p-3 sm:p-4 border-r-[3px] border-r-[#C9A84C] sm:text-right">
                                        <strong className="block text-[11px] font-semibold text-[#0E1628] uppercase tracking-wide mb-1">
                                            {meta.rightLabel}
                                        </strong>
                                        <p className="text-xs text-[#4A4E69] font-light leading-relaxed">{optionB}</p>
                                    </div>
                                </div>

                                {/* 7-point scale */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between text-xs sm:text-[10px]">
                                        <span className="text-[#9A9EB8]">← Strongly lean left</span>
                                        <span className="text-[#9A9EB8]">Strongly lean right →</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() =>
                                                    setData('leadership', { ...data.leadership, [qId]: n })
                                                }
                                                className={`
                                                    flex-1 h-10 sm:h-11 lg:h-10 rounded-md text-sm font-semibold transition-all min-h-[44px]
                                                    flex items-center justify-center relative
                                                    ${n === 4 && !answered ? 'border-[1.5px] border-dashed border-[#E2DDD4]' : 'border-[1.5px] border-[#E2DDD4]'}
                                                    ${
                                                        num === n
                                                            ? 'bg-[#0E1628] border-[#0E1628] text-white shadow-sm'
                                                            : 'bg-[#FAFAF8] text-[#4A4E69] hover:border-[#0E1628] hover:text-[#0E1628] hover:bg-[#F8F4ED]'
                                                    }
                                                `}
                                            >
                                                {n}
                                                {num === n && (
                                                    <span
                                                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C9A84C]"
                                                        aria-hidden
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
