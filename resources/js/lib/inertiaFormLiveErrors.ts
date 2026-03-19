/**
 * Call right after `setData` so Inertia server validation errors for that field clear while typing.
 */
export function clearInertiaFieldError(clearErrors: ((field?: string) => void) | undefined, field: string): void {
    clearErrors?.(field);
}
