import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface MultiSelectQuestionProps {
    question: string;
    value?: string[];
    onChange: (value: string[]) => void;
    options: string[] | { value: string; label: string }[];
    required?: boolean;
    error?: string;
    columns?: number;
}

export default function MultiSelectQuestion({
    question,
    value = [],
    onChange,
    options,
    required = false,
    error,
    columns = 1,
}: MultiSelectQuestionProps) {
    const normalizedOptions = options.map(opt => 
        typeof opt === 'string' ? { value: opt, label: opt } : opt
    );

    const handleToggle = (optionValue: string) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    return (
        <div className="space-y-3">
            <Label className="text-sm font-medium">
                {question}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className={cn(
                "grid gap-3",
                columns === 1 ? "grid-cols-1" : columns === 2 ? "grid-cols-2" : "grid-cols-3"
            )}>
                {normalizedOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                            id={`option-${option.value}`}
                            checked={value.includes(option.value)}
                            onCheckedChange={() => handleToggle(option.value)}
                        />
                        <label
                            htmlFor={`option-${option.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
