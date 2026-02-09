import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SelectQuestionProps {
    question: string;
    value?: string;
    onChange: (value: string) => void;
    options: string[] | { value: string; label: string }[];
    placeholder?: string;
    required?: boolean;
    error?: string;
}

export default function SelectQuestion({
    question,
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    required = false,
    error,
}: SelectQuestionProps) {
    const normalizedOptions = options.map(opt => 
        typeof opt === 'string' ? { value: opt, label: opt } : opt
    );

    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">
                {question}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={onChange} required={required}>
                <SelectTrigger className={error ? 'border-red-500' : ''}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {normalizedOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
