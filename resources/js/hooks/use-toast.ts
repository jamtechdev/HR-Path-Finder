import type React from 'react';
import {
    toast as notify,
    type Id as ToastId,
    type ToastContent,
    type ToastOptions,
} from 'react-toastify';

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

type ToastInput = {
    title?: React.ReactNode;
    description?: React.ReactNode;
    variant?: ToastVariant;
    duration?: number;
};

function toToastContent(title?: React.ReactNode, description?: React.ReactNode): ToastContent {
    if (title && description) {
        return `${String(title)}\n${String(description)}`;
    }

    if (title) return title as ToastContent;
    if (description) return description as ToastContent;
    return '';
}

function baseOptions(duration?: number): ToastOptions {
    const MIN_AUTO_CLOSE_MS = 5000;
    const DEFAULT_AUTO_CLOSE_MS = 7000;
    const normalizedDuration =
        typeof duration === 'number'
            ? Math.max(duration, MIN_AUTO_CLOSE_MS)
            : DEFAULT_AUTO_CLOSE_MS;

    return {
        autoClose: normalizedDuration,
        position: 'top-right',
    };
}

function makeToastId(content: ToastContent, variant: ToastVariant): string {
    return `app-toast:${variant}:${String(content)}:${Date.now()}`;
}

function toast({ title, description, variant = 'default', duration }: ToastInput) {
    const content = toToastContent(title, description);
    const toastId = makeToastId(content, variant);
    const options: ToastOptions = {
        ...baseOptions(duration),
        toastId,
        className: variant === 'warning' ? 'toast-warning-emphasis' : undefined,
    };

    let id: ToastId;
    if (variant === 'destructive') {
        id = notify.error(content, options);
    } else if (variant === 'success') {
        id = notify.success(content, options);
    } else if (variant === 'warning') {
        id = notify.warn(content, options);
    } else {
        id = notify(content, options);
    }

    return {
        id: String(id),
        dismiss: () => notify.dismiss(id),
        update: (next: ToastInput) =>
            notify.update(id, {
                render: toToastContent(next.title, next.description),
                type:
                    next.variant === 'destructive'
                        ? 'error'
                        : next.variant === 'success'
                          ? 'success'
                          : next.variant === 'warning'
                            ? 'warning'
                          : 'default',
                autoClose:
                    typeof next.duration === 'number'
                        ? Math.max(next.duration, 5000)
                        : 7000,
            }),
    };
}

function useToast() {
    return {
        toasts: [],
        toast,
        dismiss: (toastId?: string) => notify.dismiss(toastId),
    };
}

function dismissAll() {
    notify.dismiss();
}

export { useToast, toast, dismissAll };
