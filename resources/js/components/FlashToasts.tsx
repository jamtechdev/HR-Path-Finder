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

        const payloads: Array<{
            title: string;
            variant: 'success' | 'destructive' | 'warning' | 'default';
        }> = [];

        // Keep legacy behavior: show all available flash messages
        // (success first, then other severities).
        if (flash?.success) {
            payloads.push({ title: flash.success, variant: 'success' });
        } else if (flash?.message) {
            payloads.push({ title: flash.message, variant: 'success' });
        }
        if (flash?.error) {
            payloads.push({ title: flash.error, variant: 'destructive' });
        }
        if (flash?.warning) {
            payloads.push({ title: flash.warning, variant: 'warning' });
        }
        if (flash?.info) {
            payloads.push({ title: flash.info, variant: 'default' });
        }

        payloads.forEach((payload) => toast(payload));
    }, [flash?.success, flash?.error, flash?.warning, flash?.info, flash?.message]);

    return null;
}
