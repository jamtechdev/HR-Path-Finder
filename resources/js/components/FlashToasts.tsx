import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import type { SharedData } from '@/types';

const FLASH_DEDUPE_WINDOW_MS = 4000;
const flashShownAt = new Map<string, number>();

/**
 * Shows session flash messages as toasts once per distinct flash payload (AppLayout / HR shell).
 */
export function FlashToasts() {
    const page = usePage<SharedData>();
    const flash = page.props.flash;
    const lastSig = useRef<string>('');

    useEffect(() => {
        const sig = [
            flash?.success ?? '',
            flash?.error ?? '',
            flash?.warning ?? '',
            flash?.info ?? '',
            flash?.message ?? '',
        ].join('\x1e');

        if (!sig.replace(/\x1e/g, '').length) {
            return;
        }
        if (lastSig.current === sig) {
            return;
        }

        const now = Date.now();
        const lastShown = flashShownAt.get(sig) ?? 0;
        if (now - lastShown < FLASH_DEDUPE_WINDOW_MS) {
            return;
        }

        lastSig.current = sig;
        flashShownAt.set(sig, now);

        if (flash?.success) {
            toast({ title: flash.success, variant: 'success' });
        } else if (flash?.message) {
            toast({ title: flash.message, variant: 'success' });
        }
        if (flash?.error) {
            toast({ title: flash.error, variant: 'destructive' });
        }
        if (flash?.warning) {
            toast({ title: flash.warning, variant: 'warning' });
        }
        if (flash?.info) {
            toast({ title: flash.info, variant: 'default' });
        }
    }, [flash?.success, flash?.error, flash?.warning, flash?.info, flash?.message]);

    return null;
}
