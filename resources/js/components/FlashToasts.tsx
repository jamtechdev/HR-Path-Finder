import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export function FlashToasts() {
    useEffect(() => {
        const unsubscribe = router.on('navigate', (event) => {
            const flash = (event.detail.page.props as any)?.flash;
            if (!flash) return;

            if (flash.success) {
                toast({ title: flash.success, variant: 'success' });
            } else if (flash.message) {
                toast({ title: flash.message, variant: 'success' });
            }
            if (flash.error) {
                toast({ title: flash.error, variant: 'destructive' });
            }
            if (flash.warning) {
                toast({ title: flash.warning, variant: 'warning' });
            }
            if (flash.info) {
                toast({ title: flash.info });
            }
        });

        return unsubscribe;
    }, []);

    return null;
}
