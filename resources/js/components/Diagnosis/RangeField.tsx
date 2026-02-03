import type { ChangeEvent, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface RangeFieldProps {
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    displayValue: string;
    onValueChange: (value: number) => void;
    className?: string;
}

export function RangeField({
    label,
    value,
    min = 0,
    max = 100,
    step = 1,
    displayValue,
    onValueChange,
    className,
}: RangeFieldProps) {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onValueChange(Number(event.target.value));
    };

    const progress =
        max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-sm font-semibold text-muted-foreground">{displayValue}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleChange}
                className="hr-range"
                style={{ '--range-progress': `${progress}%` } as CSSProperties}
            />
        </div>
    );
}
