import React, { createContext, useContext } from 'react';
import type { FieldErrors } from '@/components/Forms/FieldErrorMessage';
import FieldErrorMessage from '@/components/Forms/FieldErrorMessage';

const DiagnosisFieldErrorsContext = createContext<FieldErrors>({});

export function DiagnosisFieldErrorsProvider({
    value,
    children,
}: {
    value: FieldErrors;
    children: React.ReactNode;
}) {
    return <DiagnosisFieldErrorsContext.Provider value={value}>{children}</DiagnosisFieldErrorsContext.Provider>;
}

export function useDiagnosisFieldErrors(): FieldErrors {
    return useContext(DiagnosisFieldErrorsContext);
}

/** Merge Inertia field error (wins) with client “Next click” errors from FormLayout context. */
export function DiagnosisFieldErrorMessage({
    fieldKey,
    inertiaError,
    className,
}: {
    fieldKey: string;
    inertiaError?: string;
    className?: string;
}) {
    const ctx = useDiagnosisFieldErrors();
    const merged: FieldErrors = { ...ctx };
    if (inertiaError) merged[fieldKey] = inertiaError;
    return <FieldErrorMessage fieldKey={fieldKey} errors={merged} className={className} />;
}

/** Red border class when context or Inertia reports an error for this field. */
export function DiagnosisFieldShell({
    fieldKey,
    inertiaError,
    children,
}: {
    fieldKey: string;
    inertiaError?: string;
    children: (opts: { borderCn: string; ErrorLine: React.ReactElement | null }) => React.ReactNode;
}) {
    const ctx = useDiagnosisFieldErrors();
    const message = inertiaError || ctx[fieldKey];
    const borderCn = message ? 'border-red-500' : '';
    const ErrorLine = message ? (
        <FieldErrorMessage fieldKey={fieldKey} errors={{ [fieldKey]: message }} className="text-xs text-red-500" />
    ) : null;
    return <>{children({ borderCn, ErrorLine })}</>;
}
