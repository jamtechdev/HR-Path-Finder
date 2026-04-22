import React from 'react';
import LikertScale from '@/components/Forms/LikertScale';
import type { DiagnosisQuestion, SurveyFormData, StepConfig } from '../types';
import { usePhilosophyText } from '../uiText';

interface ManagementStepProps {
    stepMeta: StepConfig;
    stepIndex: number;
    totalSteps: number;
    questions: DiagnosisQuestion[];
    data: SurveyFormData;
    setData: (key: keyof SurveyFormData, value: SurveyFormData['management_philosophy']) => void;
    showErrors?: boolean;
}

export default function ManagementStep({
    stepMeta,
    stepIndex,
    totalSteps,
    questions,
    data,
    setData,
    showErrors = false,
}: ManagementStepProps) {
    const { isKo } = usePhilosophyText();
    const leadMeta = (questions[0]?.metadata || {}) as Record<string, unknown>;
    const sectionTitle = isKo
        ? (((leadMeta.section_title_ko || leadMeta.title_ko) as string) ||
            stepMeta.nameKo ||
            ((leadMeta.section_title || leadMeta.title) as string) ||
            stepMeta.name)
        : (((leadMeta.section_title || leadMeta.title) as string) ||
            stepMeta.name ||
            ((leadMeta.section_title_ko || leadMeta.title_ko) as string) ||
            stepMeta.nameKo);
    const sectionDesc = isKo
        ? (((leadMeta.section_description_ko || leadMeta.description_ko) as string) ||
            stepMeta.descKo ||
            stepMeta.desc ||
            ((leadMeta.section_description || leadMeta.description) as string))
        : (((leadMeta.section_description || leadMeta.description) as string) ||
            stepMeta.desc ||
            ((leadMeta.section_description_ko || leadMeta.description_ko) as string) ||
            stepMeta.descKo);
    const calloutTitle = isKo
        ? (((leadMeta.section_callout_title_ko || leadMeta.callout_title_ko) as string) ||
            stepMeta.calloutKo?.title ||
            stepMeta.callout?.title ||
            ((leadMeta.section_callout_title || leadMeta.callout_title) as string))
        : (((leadMeta.section_callout_title || leadMeta.callout_title) as string) ||
            stepMeta.callout?.title ||
            ((leadMeta.section_callout_title_ko || leadMeta.callout_title_ko) as string) ||
            stepMeta.calloutKo?.title);
    const calloutBody = isKo
        ? (((leadMeta.section_callout_body_ko || leadMeta.callout_body_ko) as string) ||
            stepMeta.calloutKo?.body ||
            stepMeta.callout?.body ||
            ((leadMeta.section_callout_body || leadMeta.callout_body) as string))
        : (((leadMeta.section_callout_body || leadMeta.callout_body) as string) ||
            stepMeta.callout?.body ||
            ((leadMeta.section_callout_body_ko || leadMeta.callout_body_ko) as string) ||
            stepMeta.calloutKo?.body);
    return (
        <div className="w-full space-y-6 sm:space-y-7">
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6 sm:mb-7 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="w-[52px] h-[52px] flex-shrink-0 rounded-xl bg-[#0E1628] flex items-center justify-center text-2xl">
                    {stepMeta.icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-[#C9A84C] mb-1">
                        {isKo ? `섹션 ${stepIndex + 1} / ${totalSteps}` : `Section ${stepIndex + 1} of ${totalSteps}`}
                    </div>
                    <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#0E1628] mb-1.5 dark:text-slate-100">
                        {sectionTitle}
                    </h2>
                    <p className="text-[12px] sm:text-[13px] text-[#4A4E69] font-light leading-relaxed dark:text-slate-300">{sectionDesc}</p>
                </div>
            </div>
            {(calloutTitle || calloutBody) && (
                <div className="w-full bg-[#0E1628] rounded-[10px] px-4 sm:px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-3.5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 delay-75">
                    <div className="absolute -top-8 -right-5 w-[120px] h-[120px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.2)_0%,transparent_65%)]" />
                    <span className="text-[22px] flex-shrink-0 relative">💡</span>
                    <div className="relative min-w-0 flex-1">
                        {calloutTitle && (
                            <strong className="block text-[12px] sm:text-[13px] font-medium text-[#E8C96B] mb-0.5">
                                {calloutTitle}
                            </strong>
                        )}
                        {calloutBody && (
                            <span className="text-[11px] sm:text-[12px] text-white/55 font-light leading-snug">
                                {calloutBody}
                            </span>
                        )}
                    </div>
                </div>
            )}
            <div className="w-full space-y-3">
                {questions.map((question, qi) => {
                    const val = data.management_philosophy[question.id.toString()];
                    const answered = val != null && !Number.isNaN(Number(val));
                    const hasError = showErrors && !answered;
                    return (
                        <div
                            key={question.id}
                            className={`w-full bg-white border rounded-[10px] px-4 sm:px-6 py-4 sm:py-5 animate-in fade-in slide-in-from-bottom-4 duration-300 dark:bg-slate-800 ${hasError ? 'border-red-300 bg-red-50/40 dark:border-red-500/60 dark:bg-red-950/20' : answered ? 'border-[#0E1628]/20 dark:border-slate-600' : 'border-[#E2DDD4] dark:border-slate-600'}`}
                            style={{ animationDelay: `${(qi + 2) * 40}ms` }}
                        >
                            <div className="text-[10px] font-medium uppercase tracking-widest text-[#9A9EB8] mb-2">
                                Q{qi + 1}
                                {answered && <span className="float-right text-[#2E9E6B]">✓ {isKo ? '응답 완료' : 'Answered'}</span>}
                            </div>
                            <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#1A1A2E] mb-4 break-words dark:text-slate-100">
                                {(isKo
                                    ? (question.metadata as Record<string, unknown>)?.question_text_ko
                                    : (question.metadata as Record<string, unknown>)?.question_text_en) as string || question.question_text}
                                <span className="text-red-500 ml-0.5">*</span>
                            </p>
                            <div className="min-w-0 overflow-x-auto">
                                <LikertScale
                                    value={val}
                                    onChange={(v) => setData('management_philosophy', { ...data.management_philosophy, [question.id.toString()]: v })}
                                    scale={7}
                                    leftLabel={
                                        ((isKo
                                            ? (question.metadata as Record<string, unknown>)?.option_a_label_ko
                                            : (question.metadata as Record<string, unknown>)?.option_a_label) as string) ||
                                        (isKo ? '전혀\n아니다' : 'Strongly\nDisagree')
                                    }
                                    rightLabel={
                                        ((isKo
                                            ? (question.metadata as Record<string, unknown>)?.option_b_label_ko
                                            : (question.metadata as Record<string, unknown>)?.option_b_label) as string) ||
                                        (isKo ? '매우\n그렇다' : 'Strongly\nAgree')
                                    }
                                    variant="survey"
                                    required
                                    error={hasError ? (isKo ? '이 문항에 응답해 주세요.' : 'Please answer this question.') : undefined}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
