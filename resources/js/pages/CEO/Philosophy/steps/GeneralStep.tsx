import React from 'react';
import type { DiagnosisQuestion, QuestionMetadata, SurveyFormData } from '../types';
import { usePhilosophyText } from '../uiText';

interface GeneralStepProps {
    questions: DiagnosisQuestion[];
    data: SurveyFormData;
    setData: (key: 'general', value: SurveyFormData['general']) => void;
    showErrors?: boolean;
}

function getQuestionMeta(question: DiagnosisQuestion, isKo: boolean) {
    const meta = (question.metadata || {}) as QuestionMetadata;
    const left = (isKo ? meta.option_a_label_ko : meta.option_a_label) || meta.option_a || (isKo ? '왼쪽' : 'Left');
    const right = (isKo ? meta.option_b_label_ko : meta.option_b_label) || meta.option_b || (isKo ? '오른쪽' : 'Right');
    const title = (isKo ? meta.title_ko : meta.title) || question.question_text;
    return {
        icon: meta.icon || '📋',
        title,
        leftLabel: left.slice(0, 30) + (left.length > 30 ? '…' : ''),
        rightLabel: right.slice(0, 30) + (right.length > 30 ? '…' : ''),
    };
}

export default function GeneralStep({ questions, data, setData, showErrors = false }: GeneralStepProps) {
    const { isKo } = usePhilosophyText();
    const total = questions.length;
    const sectionMeta = ((questions[0]?.metadata || {}) as QuestionMetadata);
    const sectionTitle = (isKo ? sectionMeta.section_title_ko : sectionMeta.section_title) || (isKo ? '일반 질문' : 'General Questions');
    const sectionDesc =
        (isKo ? sectionMeta.section_description_ko : sectionMeta.section_description) ||
        (isKo ? '응답 해석의 정확도를 높이기 위해 전반적인 운영 맥락을 확인하는 섹션입니다.' : 'This section gathers overall operational context to support a balanced and accurate interpretation of your responses.');
    const calloutTitle = (isKo ? sectionMeta.section_callout_title_ko : sectionMeta.section_callout_title);
    const calloutBody = (isKo ? sectionMeta.section_callout_body_ko : sectionMeta.section_callout_body);

    return (
        <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Section header */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-[52px] h-[52px] flex-shrink-0 rounded-xl bg-[#0E1628] flex items-center justify-center text-2xl">
                    🔍
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-[#C9A84C] mb-1">
                        {isKo ? '섹션 6 / 8' : 'Step 6 of 8'}
                    </div>
                    <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#0E1628] mb-1.5 dark:text-slate-100">
                        {sectionTitle}
                    </h2>
                    <p className="text-[13px] text-[#4A4E69] font-light leading-relaxed dark:text-slate-200">
                        {sectionDesc}
                    </p>
                </div>
            </div>

            {/* Callout */}
            <div className="bg-[#0E1628] rounded-[10px] px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 relative overflow-hidden">
                <div className="absolute top-[-30px] right-[-20px] w-[110px] h-[110px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.2)_0%,transparent_65%)]" />
                <span className="text-xl flex-shrink-0 relative">🧭</span>
                <div className="relative min-w-0 flex-1">
                    <strong className="block text-xs font-medium text-[#E8C96B] mb-0.5">
                        {calloutTitle || (isKo ? '운영 철학의 위치를 정확히 선택해 주세요.' : 'Your operational philosophy — placed precisely.')}
                    </strong>
                    <span className="text-[11.5px] text-white/75 font-light">
                        {calloutBody || (isKo
                            ? '각 항목은 두 가지 합리적인 관점으로 구성됩니다. 1(왼쪽)부터 7(오른쪽) 사이에서 가장 가까운 위치를 선택해 주세요.'
                            : 'Each dimension has two legitimate poles. Place yourself honestly between 1 (far left) and 7 (far right).')}
                    </span>
                </div>
            </div>

            {/* Spectrum cards */}
            <div className="space-y-3.5 sm:space-y-4">
                {questions.map((question, qi) => {
                    const qId = question.id.toString();
                    const value = data.general[qId];
                    const num = typeof value === 'number' && value >= 1 && value <= 7 ? value : null;
                    const answered = num !== null;
                    const hasError = showErrors && !answered;
                    const meta = getQuestionMeta(question, isKo);
                    const optionA = ((question.metadata as { option_a?: string }) || {}).option_a || '';
                    const optionB = ((question.metadata as { option_b?: string }) || {}).option_b || '';

                    return (
                        <div
                            key={question.id}
                            className={`bg-white border-[1.5px] rounded-xl overflow-hidden transition-colors dark:bg-slate-800/90 ${
                                hasError ? 'border-red-300 bg-red-50/40 dark:border-red-500/60 dark:bg-red-950/20' : answered ? 'border-[#0E1628]/20 dark:border-slate-600' : 'border-[#E2DDD4] dark:border-slate-600'
                            }`}
                            style={{ animationDelay: `${qi * 0.05}s` }}
                        >
                            {/* Card header */}
                            <div className="px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4 border-b border-[#E2DDD4] dark:border-slate-700">
                                <div
                                    className={`w-9 h-9 sm:w-[36px] sm:h-[36px] rounded-lg flex items-center justify-center text-[17px] flex-shrink-0 border transition-colors ${
                                        answered ? 'bg-[#0E1628] border-[#0E1628]' : 'bg-[#F8F4ED] border-[#E2DDD4]'
                                    }`}
                                >
                                    {meta.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[10px] font-medium uppercase tracking-wider text-[#9A9EB8] mb-0.5">
                                        {isKo ? `문항 ${qi + 1} / ${total}` : `Q${qi + 1} of ${total}`}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm sm:text-[14.5px] font-medium text-[#1A1A2E] leading-snug dark:text-slate-100">
                                            {(isKo
                                                ? ((question.metadata as QuestionMetadata)?.question_text_ko as string)
                                                : ((question.metadata as QuestionMetadata)?.question_text_en as string)) || meta.title}
                                            <span className="text-[#E05A5A] ml-0.5">*</span>
                                        </span>
                                        {answered && (
                                            <span className="text-[10.5px] text-[#2E9E6B] font-medium flex-shrink-0">
                                                ✓
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Spectrum body */}
                            <div className="p-4 sm:p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3 items-center mb-4">
                                    <div className="bg-[#0E1628]/[0.04] border-l-[3px] border-l-[#0E1628] rounded-md py-2.5 px-3 sm:px-4 dark:bg-slate-700/50">
                                        <strong className="block text-[10px] font-semibold uppercase tracking-wide text-[#0E1628] mb-1">
                                            {meta.leftLabel}
                                        </strong>
                                        <p className="text-xs text-[#4A4E69] font-light leading-relaxed dark:text-slate-300">{optionA}</p>
                                    </div>
                                    <div className="hidden sm:block text-[10px] font-semibold text-[#9A9EB8] text-center whitespace-nowrap">
                                        VS
                                    </div>
                                    <div className="bg-[#C9A84C]/[0.06] border-r-[3px] border-r-[#C9A84C] rounded-md py-2.5 px-3 sm:px-4 sm:text-right dark:bg-amber-900/15">
                                        <strong className="block text-[10px] font-semibold uppercase tracking-wide text-[#8A6820] mb-1">
                                            {meta.rightLabel}
                                        </strong>
                                        <p className="text-xs text-[#4A4E69] font-light leading-relaxed dark:text-slate-300">{optionB}</p>
                                    </div>
                                </div>

                                {/* 7-point scale */}
                                <div className="flex flex-col gap-1.5">
                                    {hasError && <p className="text-sm font-medium text-red-600">{isKo ? '이 문항에 응답해 주세요.' : 'Please answer this question.'}</p>}
                                    <div className="flex justify-between">
                                <span className="text-[10px] text-[#9A9EB8] dark:text-slate-300">← {meta.leftLabel}</span>
                                <span className="text-[10px] text-[#9A9EB8] dark:text-slate-300">{meta.rightLabel} →</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() =>
                                                    setData('general', { ...data.general, [qId]: n })
                                                }
                                                className={`
                                                    flex-1 h-9 sm:h-10 rounded-md text-sm font-normal transition-all
                                                    flex items-center justify-center relative
                                                    ${n === 4 && !answered ? 'border-[1.5px] border-dashed border-[#E2DDD4] dark:border-slate-500/70' : 'border-[1.5px] border-[#E2DDD4] dark:border-slate-500/70'}
                                                    ${
                                                        num === n
                                                            ? 'bg-[#0E1628] border-[#0E1628] text-white font-semibold dark:bg-[#1f3f7a] dark:border-[#1f3f7a]'
                                                            : 'bg-[#FAFAF8] text-[#4A4E69] hover:border-[#0E1628] hover:text-[#0E1628] hover:bg-[#F8F4ED] dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-300 dark:hover:text-white'
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
