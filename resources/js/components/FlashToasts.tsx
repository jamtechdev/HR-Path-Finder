import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import type { SharedData } from '@/types';

const FLASH_DEDUPE_WINDOW_MS = 4000;
const flashShownAt = new Map<string, number>();
let flashListenerMounted = false;

/**
 * Shows session flash messages as toasts once per distinct flash payload (AppLayout / HR shell).
 */
export function FlashToasts() {
    const page = usePage<SharedData>();
    const flash = page.props.flash;
    const lastSig = useRef<string>('');
    const isPrimaryInstance = useRef(false);

    useEffect(() => {
        if (!flashListenerMounted) {
            flashListenerMounted = true;
            isPrimaryInstance.current = true;
        }

        return () => {
            if (isPrimaryInstance.current) {
                flashListenerMounted = false;
            }
        };
    }, []);

    useEffect(() => {
        if (!isPrimaryInstance.current) {
            return;
        }

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

        const payload =
            flash?.error
                ? { title: flash.error, variant: 'destructive' as const }
                : flash?.warning
                  ? { title: flash.warning, variant: 'warning' as const }
                  : flash?.success
                    ? { title: flash.success, variant: 'success' as const }
                    : flash?.message
                      ? { title: flash.message, variant: 'success' as const }
                      : flash?.info
                        ? { title: flash.info, variant: 'default' as const }
                        : null;

        if (payload) {
            toast(payload);
        }
    }, [flash?.success, flash?.error, flash?.warning, flash?.info, flash?.message]);

    return null;
}
