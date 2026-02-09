import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface LikertScaleProps {
    question: string;
    value?: number;
    onChange: (value: number) => void;
    scale?: number;
    labels?: string[];
    required?: boolean;
    error?: string;
}

export default function LikertScale({
    question,
    value,
    onChange,
    scale = 7,
    labels = ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree'],
    required = false,
    error,
}: LikertScaleProps) {
    const scaleArray = Array.from({ length: scale }, (_, i) => i + 1);

    return (
        <div className="space-y-3">
            <Label className="text-sm font-medium">
                {question}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground min-w-[100px] text-right">
                    {labels[0] || '1'}
                </span>
                <div className="flex-1 flex items-center gap-1">
                    {scaleArray.map((num) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => onChange(num)}
                            className={cn(
                                "flex-1 h-10 rounded-md border-2 transition-all duration-200 hover:scale-105",
                                value === num
                                    ? "bg-primary border-primary text-primary-foreground font-semibold"
                                    : "bg-background border-border hover:border-primary/50"
                            )}
                        >
                            {num}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-muted-foreground min-w-[100px]">
                    {labels[labels.length - 1] || scale.toString()}
                </span>
            </div>
            {value && (
                <div className="text-center text-sm text-muted-foreground">
                    Selected: {value} - {labels[value - 1] || value}
                </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
