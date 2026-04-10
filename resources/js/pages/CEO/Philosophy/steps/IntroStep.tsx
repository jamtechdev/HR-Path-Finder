import { CheckCircle2 } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { IntroText } from '../types';

const defaultIntroContent = `This diagnostic is not an evaluation of your leadership or performance.
There are no right or wrong answers.
This assessment is designed to understand your current management priorities and decision-making perspective, based on your responses at this point in time.
Please note the following:
• Your individual responses will not be shared as-is with the HR manager or any other employees.
• No one will be able to view your original answers to individual questions.
• Results will be used only after being aggregated, interpreted, and anonymized into summary insights.
• Any comparison with HR input is intended to understand differences in perspective, not to judge or evaluate individuals.
For the most meaningful outcome, please answer honestly and instinctively, based on what you consider most important right now, rather than what may appear ideal or socially desirable.`;

interface IntroStepProps {
    introText?: IntroText;
    hasAgreed: boolean;
    onAgreeChange: (checked: boolean) => void;
}

export default function IntroStep({ introText, hasAgreed, onAgreeChange }: IntroStepProps) {
    return (
        <Card className="w-full border border-[#E2DDD4] shadow-sm overflow-hidden rounded-xl bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="bg-gradient-to-r from-[#0E1628]/5 via-[#C9A84C]/5 to-transparent p-1">
                <CardHeader className="py-5 sm:py-6 px-5 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#0E1628]/10 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-[#0E1628]" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-xl sm:text-2xl text-[#0E1628] dark:text-slate-100">Welcome to Your Survey</CardTitle>
                            <CardDescription className="text-sm sm:text-base mt-1 text-[#4A4E69] dark:text-slate-300">
                                Let's begin your management philosophy assessment
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </div>
            <CardContent className="space-y-6 sm:space-y-8 px-5 sm:px-6 lg:px-8 pb-6 sm:pb-8">
                <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-[#1A1A2E] space-y-4 dark:text-slate-200">
                        <p className="font-normal">{introText?.content || defaultIntroContent}</p>
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
                                I Understand & Ready to Start
                            </span>
                            <p className="text-xs sm:text-sm text-[#4A4E69] leading-relaxed dark:text-slate-300">
                                By checking this box, you confirm that you understand the purpose of this diagnostic and agree to proceed with the survey.
                            </p>
                        </label>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
