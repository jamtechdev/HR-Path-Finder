import React from 'react';
import { Label } from '@/components/ui/label';

interface ReadOnlyFieldProps {
    label: string;
    value?: React.ReactNode;
}

export function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
    return (
        <div className="space-y-1">
            <Label className="text-sm font-semibold text-muted-foreground">{label}</Label>
            <p className="text-sm font-medium text-foreground min-h-[2.25rem] py-2 px-3 rounded-md bg-muted/50">
                {value ?? '—'}
            </p>
        </div>
    );
}
