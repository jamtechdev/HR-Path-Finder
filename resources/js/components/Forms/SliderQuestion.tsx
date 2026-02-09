import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SliderQuestionProps {
    question: string;
    value?: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    optionA?: string;
    optionB?: string;
    required?: boolean;
    error?: string;
}

export default function SliderQuestion({
    question,
    value = 4,
    onChange,
    min = 1,
    max = 7,
    optionA,
    optionB,
    required = false,
    error,
}: SliderQuestionProps) {
    return (
        <div className="space-y-4">
            <Label className="text-sm font-medium">
                {question}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="px-2">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{optionA || 'Option A'}</span>
                    <span className="text-xs text-muted-foreground">{optionB || 'Option B'}</span>
                </div>
                <Slider
                    value={[value]}
                    onValueChange={(vals) => onChange(vals[0])}
                    min={min}
                    max={max}
                    step={1}
                    className="w-full"
                />
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium">{value}</span>
                </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
