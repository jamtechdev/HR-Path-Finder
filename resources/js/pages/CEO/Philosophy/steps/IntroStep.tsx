import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { IntroText } from '../types';
import { usePhilosophyText } from '../uiText';

const defaultIntroContent = `This diagnostic is not an evaluation of your leadership or performance.
There are no right or wrong answers.
This assessment is designed to understand your current management priorities and decision-making perspective, based on your responses at this point in time.
Please note the following:
• Your individual responses will not be shared as-is with the HR manager or any other employees.
• No one will be able to view your original answers to individual questions.
• Results will be used only after being aggregated, interpreted, and anonymized into summary insights.
• Any comparison with HR input is intended to understand differences in perspective, not to judge or evaluate individuals.
For the most meaningful outcome, please answer honestly and instinctively, based on what you consider most important right now, rather than what may appear ideal or socially desirable.`;

const defaultIntroContentKo = `이 진단은 리더십이나 성과를 평가하기 위한 목적이 아닙니다.
정답이나 오답은 없습니다.
본 설문은 현재 시점의 경영 우선순위와 의사결정 관점을 이해하기 위한 것입니다.
아래 내용을 참고해 주세요:
• 개인 응답은 HR 담당자나 다른 직원에게 원문 그대로 공유되지 않습니다.
• 누구도 개별 문항의 원본 응답을 직접 확인할 수 없습니다.
• 결과는 집계/해석/익명화 과정을 거친 인사이트 형태로만 활용됩니다.
• HR 응답과의 비교는 개인 평가가 아니라 관점 차이를 이해하기 위한 목적입니다.
가장 의미 있는 결과를 위해, 이상적인 답보다 현재 중요하다고 생각하는 내용을 솔직하고 직관적으로 응답해 주세요.`;

interface IntroStepProps {
    introText?: IntroText;
    hasAgreed: boolean;
    onAgreeChange: (checked: boolean) => void;
}

export default function IntroStep({ introText, hasAgreed, onAgreeChange }: IntroStepProps) {
    const { tx, isKo } = usePhilosophyText();
    const content = isKo ? defaultIntroContentKo : defaultIntroContent;

    return (
        <Card className="w-full border border-[#E2DDD4] shadow-sm overflow-hidden rounded-xl bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="bg-gradient-to-r from-[#0E1628]/5 via-[#C9A84C]/5 to-transparent p-1">
                <CardHeader className="py-5 sm:py-6 px-5 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#0E1628]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[22px] leading-none" aria-hidden>
                                ✅
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-xl sm:text-2xl text-[#0E1628] dark:text-slate-100">{tx('introTitle')}</CardTitle>
                            <CardDescription className="text-sm sm:text-base mt-1 text-[#4A4E69] dark:text-slate-300">
                                {tx('introDesc')}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </div>
            <CardContent className="space-y-6 sm:space-y-8 px-5 sm:px-6 lg:px-8 pb-6 sm:pb-8">
                <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-[#1A1A2E] space-y-4 dark:text-slate-200">
                        <p className="font-normal">{content}</p>
                    </div>
                </div>
                <div className="border-t border-[#E2DDD4] pt-6 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-6 bg-[#0E1628]/[0.04] rounded-xl border border-[#E2DDD4] hover:border-[#0E1628]/20 transition-all dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-slate-500">
                        <div className="flex-shrink-0 mt-0.5">
                            <Checkbox
                                id="agree-intro"
                                checked={hasAgreed}
                                onCheckedChange={(checked) => onAgreeChange(checked === true)}
                                className="w-5 h-5 border-2 border-[#0E1628]/30"
                            />
                        </div>
                        <label htmlFor="agree-intro" className="flex-1 cursor-pointer min-w-0">
                            <span className="text-base sm:text-lg font-semibold text-[#0E1628] block mb-1 sm:mb-2 dark:text-slate-100">
                                {tx('introAgreeTitle')}
                            </span>
                            <p className="text-xs sm:text-sm text-[#4A4E69] leading-relaxed dark:text-slate-300">
                                {tx('introAgreeDesc')}
                            </p>
                        </label>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
