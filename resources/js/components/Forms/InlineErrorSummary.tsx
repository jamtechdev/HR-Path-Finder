import { AlertCircle } from 'lucide-react';
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Errors = Record<string, string | string[] | undefined>;

function firstMessage(err: unknown): string {
    if (err == null) return '';
    if (Array.isArray(err)) return String(err[0] ?? '');
    return String(err);
}

/** Flatten Inertia/Laravel errors for display (no toast). */
export function flattenErrors(errors: Errors | null | undefined): string[] {
    if (!errors || typeof errors !== 'object') return [];
    const out: string[] = [];
    for (const v of Object.values(errors)) {
        const m = firstMessage(v);
        if (m) out.push(m);
    }
    return out;
}

export default function InlineErrorSummary({
    message,
    errors,
    className = '',
}: {
    message?: string | null;
    errors?: Errors | null;
    className?: string;
}) {
    const fromErrors = flattenErrors(errors ?? undefined);
    const lines = message ? [message, ...fromErrors.filter((l) => l !== message)] : fromErrors;
    if (lines.length === 0) return null;
    return (
        <Alert variant="destructive" className={className}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Please fix the following</AlertTitle>
            <AlertDescription>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                    {lines.map((line, i) => (
                        <li key={i}>{line}</li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
}
