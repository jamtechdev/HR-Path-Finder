import type { FieldErrors } from '@/components/Forms/FieldErrorMessage';

/** Remove one or more keys from a field-errors map (immutable). */
export function omitFieldErrorKeys(errors: FieldErrors | null | undefined, keys: string[]): FieldErrors {
    if (!errors || keys.length === 0) return { ...(errors ?? {}) };
    const next = { ...errors };
    for (const k of keys) {
        delete next[k];
    }
    return next;
}

/** Remove a single field error key. */
export function clearFieldErrorKey(errors: FieldErrors | null | undefined, key: string): FieldErrors {
    return omitFieldErrorKeys(errors, [key]);
}

/**
 * Keep only keys that still appear in the latest validation result.
 * Use after re-running a validator so fixed fields drop out immediately.
 */
export function pruneFieldErrorsToValidator(previous: FieldErrors, latestFieldErrors: FieldErrors): FieldErrors {
    if (Object.keys(previous).length === 0) return previous;
    const next: FieldErrors = {};
    for (const k of Object.keys(previous)) {
        if (latestFieldErrors[k]) next[k] = latestFieldErrors[k];
    }
    const prevKeys = Object.keys(previous);
    const nextKeys = Object.keys(next);
    if (prevKeys.length === nextKeys.length && nextKeys.every((k) => previous[k] === next[k])) {
        return previous;
    }
    return next;
}

/** Merge diagnosis record with live form data for validation (form wins on overlap). */
export function mergeDiagnosisWithFormData(diagnosis: unknown, formData: unknown): Record<string, unknown> {
    const d = diagnosis && typeof diagnosis === 'object' && !Array.isArray(diagnosis) ? (diagnosis as Record<string, unknown>) : {};
    const f = formData && typeof formData === 'object' && !Array.isArray(formData) ? (formData as Record<string, unknown>) : {};
    return { ...d, ...f };
}
