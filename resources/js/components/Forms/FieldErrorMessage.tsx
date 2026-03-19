import React from 'react';
import { cn } from '@/lib/utils';

/** Map of field key → first error message (client or server validation). */
export type FieldErrors = Record<string, string>;

type Props = {
    /** Field key used in FieldErrors map */
    fieldKey: string;
    errors?: FieldErrors | null;
    className?: string;
};

/**
 * Renders a single red validation line under a control when `errors[fieldKey]` is set.
 */
export default function FieldErrorMessage({ fieldKey, errors, className }: Props) {
    const msg = errors?.[fieldKey];
    if (!msg) return null;
    return (
        <p role="alert" className={cn('mt-1.5 text-sm text-destructive font-medium', className)}>
            {msg}
        </p>
    );
}

export function fieldErrorClass(fieldKey: string, errors?: FieldErrors | null): string {
    return errors?.[fieldKey] ? 'border-destructive ring-1 ring-destructive/30' : '';
}
