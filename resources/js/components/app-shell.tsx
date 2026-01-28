import { SidebarProvider } from '@/components/ui/sidebar';
import SuccessMessage from '@/components/SuccessMessage';
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    variant?: 'header' | 'sidebar';
};

export function AppShell({ children, variant = 'header' }: Props) {
    const page = usePage<SharedData & { flash?: SharedData['flash'] }>();
    const { sidebarOpen, flash: sharedFlash } = page.props;
    
    // Check for page-specific flash prop first, then fall back to shared flash
    const flash = (page.props as any).flash || sharedFlash;

    if (variant === 'header') {
        return (
            <>
                <div className="flex min-h-screen w-full flex-col">{children}</div>
                {flash && (flash.success || flash.message) && (
                    <SuccessMessage
                        message={flash.success || flash.message}
                        nextStep={flash.nextStep}
                        nextStepRoute={flash.nextStepRoute}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <SidebarProvider defaultOpen={sidebarOpen}>{children}</SidebarProvider>
            {flash && (flash.success || flash.message) && (
                <SuccessMessage
                    message={flash.success || flash.message}
                    nextStep={flash.nextStep}
                    nextStepRoute={flash.nextStepRoute}
                />
            )}
        </>
    );
}
