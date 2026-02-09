import React from 'react';
import { OptionPill } from './OptionPill';
import { cn } from '@/lib/utils';

interface MultiSelectPillsProps {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    maxSelections?: number;
    className?: string;
    required?: boolean;
}

export default function MultiSelectPills({
    label,
    options,
    selected,
    onChange,
    maxSelections,
    className,
    required = false,
}: MultiSelectPillsProps) {
    const handleToggle = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter((item) => item !== option));
        } else {
            if (maxSelections && selected.length >= maxSelections) {
                return; // Don't allow more selections
            }
            onChange([...selected, option]);
        }
    };

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </label>
                {maxSelections && (
                    <span className="text-xs text-muted-foreground">
                        Selected: {selected.length}/{maxSelections}
                    </span>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <OptionPill
                        key={option}
                        selected={selected.includes(option)}
                        onClick={() => handleToggle(option)}
                        disabled={maxSelections ? !selected.includes(option) && selected.length >= maxSelections : false}
                    >
                        {option}
                    </OptionPill>
                ))}
            </div>
        </div>
    );
}
