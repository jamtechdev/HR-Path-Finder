import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function humanizeKey(key: string): string {
    return key
        .replace(/_/g, ' ')
        .replace(/\bid\b/gi, 'ID')
        .replace(/\bhr\b/gi, 'HR')
        .replace(/\bjson\b/gi, 'JSON')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatScalar(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '—';
    if (typeof value === 'string') {
        const t = value.trim();
        if (t === '') return '—';
        return t;
    }
    return String(value);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date);
}

export interface StepDataFieldsProps {
    data: unknown;
    className?: string;
}

/**
 * Renders Eloquent-style JSON (objects, arrays, scalars) as readable label/value rows.
 */
export default function StepDataFields({ data, className }: StepDataFieldsProps) {
    const rows = useMemo(() => flattenForDisplay(data, ''), [data]);

    if (rows.length === 0) {
        return <p className="text-sm text-muted-foreground">No fields to display.</p>;
    }

    return (
        <dl className={cn('divide-y divide-border text-sm', className)}>
            {rows.map(({ path, label, value }) => (
                <div key={path} className="grid grid-cols-1 gap-0.5 py-1.5 sm:grid-cols-[minmax(8rem,32%)_1fr] sm:gap-3">
                    <dt className="text-xs font-medium text-muted-foreground break-words">{label}</dt>
                    <dd className="text-xs text-foreground break-words whitespace-pre-wrap">{value}</dd>
                </div>
            ))}
        </dl>
    );
}

function flattenForDisplay(
    value: unknown,
    prefix: string,
): Array<{ path: string; label: string; value: string }> {
    const out: Array<{ path: string; label: string; value: string }> = [];

    if (value === null || value === undefined) {
        return out;
    }

    if (Array.isArray(value)) {
        if (value.length === 0) {
            out.push({ path: prefix || 'root', label: humanizeKey(prefix.split('.').pop() || 'Items'), value: '—' });
            return out;
        }
        const allScalar = value.every((v) => v === null || ['string', 'number', 'boolean'].includes(typeof v));
        if (allScalar) {
            out.push({
                path: prefix || 'root',
                label: humanizeKey(prefix.split('.').pop() || 'Items'),
                value: value.map((v) => formatScalar(v)).join(', '),
            });
            return out;
        }
        value.forEach((item, i) => {
            const p = prefix ? `${prefix}[${i}]` : `[${i}]`;
            if (isPlainObject(item) || Array.isArray(item)) {
                out.push(...flattenForDisplay(item, p));
            } else {
                out.push({ path: p, label: `${humanizeKey(prefix.split('.').pop() || 'Item')} ${i + 1}`, value: formatScalar(item) });
            }
        });
        return out;
    }

    if (isPlainObject(value)) {
        const entries = Object.entries(value);
        if (entries.length === 0) {
            return out;
        }
        for (const [k, v] of entries) {
            const path = prefix ? `${prefix}.${k}` : k;
            const label = humanizeKey(k);
            if (v === null || v === undefined) {
                out.push({ path, label, value: '—' });
            } else if (Array.isArray(v) || isPlainObject(v)) {
                out.push(...flattenForDisplay(v, path));
            } else {
                out.push({ path, label, value: formatScalar(v) });
            }
        }
        return out;
    }

    out.push({
        path: prefix || 'value',
        label: humanizeKey(prefix.split('.').pop() || 'Value'),
        value: formatScalar(value),
    });
    return out;
}

export function StepDataJsonToggle({ value }: { value: unknown }) {
    const [open, setOpen] = useState(false);
    const json = JSON.stringify(value, null, 2);

    return (
        <div className="rounded-md border border-border bg-muted/20">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-full justify-start gap-1 rounded-none px-2 text-xs font-normal"
                onClick={() => setOpen((o) => !o)}
            >
                {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                Raw JSON
            </Button>
            {open && (
                <pre className="max-h-56 overflow-auto border-t border-border p-2 text-[10px] leading-relaxed">{json}</pre>
            )}
        </div>
    );
}
