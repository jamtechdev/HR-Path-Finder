import { ReactNode } from 'react';
import AppLayout from './AppLayout';

interface AppWithSidebarLayoutProps {
    children: ReactNode;
    showWorkflowSteps?: boolean;
    stepStatuses?: Record<string, string>;
    projectId?: number;
}

export default function AppWithSidebarLayout({ 
    children,
    showWorkflowSteps = false,
    stepStatuses = {},
    projectId
}: AppWithSidebarLayoutProps) {
    return (
        <AppLayout
            showWorkflowSteps={showWorkflowSteps}
            stepStatuses={stepStatuses}
            projectId={projectId}
        >
            {children}
        </AppLayout>
    );
}
