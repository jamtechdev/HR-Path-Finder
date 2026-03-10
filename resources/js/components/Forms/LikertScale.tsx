import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface LikertScaleProps {
    question?: string;
    value?: number;
    onChange: (value: number) => void;
    scale?: number;
    labels?: string[];
    leftLabel?: string;
    rightLabel?: string;
    required?: boolean;
    error?: string;
    /** Survey style: circle only, gold dot when selected, number below */
    variant?: 'default' | 'survey';
}

export default function LikertScale({
    question,
    value,
    onChange,
    scale = 7,
    labels = ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree'],
    leftLabel,
    rightLabel,
    required = false,
    error,
    variant = 'default',
}: LikertScaleProps) {
    const scaleArray = Array.from({ length: scale }, (_, i) => i + 1);
    const left = leftLabel ?? labels[0] ?? '1';
    const right = rightLabel ?? labels[labels.length - 1] ?? scale.toString();
    const isSurvey = variant === 'survey';

    return (
        <div className="space-y-4">
            {question != null && (
                <Label className="text-sm font-medium block text-foreground">
                    {question}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
            )}
            <div className="flex items-start gap-0">
                <span className="text-[10px] leading-tight text-[#9A9EB8] w-[52px] flex-shrink-0 pt-0.5 text-right">
                    {left.split('\n').map((line, i) => (
                        <span key={i}>{line}{i < left.split('\n').length - 1 ? <br /> : null}</span>
                    ))}
                </span>
                <div className="flex-1 flex justify-between px-1.5 gap-1">
                    {scaleArray.map((num) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => onChange(num)}
                            className={cn(
                                "flex-1 flex flex-col items-center gap-1.5 cursor-pointer select-none focus:outline-none min-w-0"
                            )}
                        >
                            <span
                                className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-full border-[1.5px] transition-all duration-150 flex-shrink-0",
                                    isSurvey
                                        ? value === num
                                            ? "bg-[#0E1628] border-[#0E1628]"
                                            : "border-[#E2DDD4] bg-[#FAFAF8] hover:border-[#0E1628]/40 hover:bg-[#0E1628]/[0.06]"
                                        : value === num
                                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                            : "border-border bg-muted/40 hover:bg-muted hover:border-primary/60"
                                )}
                            >
                                {isSurvey && value === num ? (
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#C9A84C]" />
                                ) : !isSurvey ? (
                                    <span className="text-xs">{num}</span>
                                ) : null}
                            </span>
                            <span
                                className={cn(
                                    "text-[11px] transition-colors",
                                    isSurvey
                                        ? value === num ? "text-[#0E1628] font-semibold" : "text-[#9A9EB8]"
                                        : value === num ? "text-primary font-medium" : "text-muted-foreground"
                                )}
                            >
                                {num}
                            </span>
                        </button>
                    ))}
                </div>
                <span className="text-[10px] leading-tight text-[#9A9EB8] w-[52px] flex-shrink-0 pt-0.5 text-left">
                    {right.split('\n').map((line, i) => (
                        <span key={i}>{line}{i < right.split('\n').length - 1 ? <br /> : null}</span>
                    ))}
                </span>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
