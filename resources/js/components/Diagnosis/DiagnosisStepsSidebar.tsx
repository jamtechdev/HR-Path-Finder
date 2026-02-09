import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    SidebarGroup, 
    SidebarGroupLabel, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton,
} from '@/components/ui/sidebar';
import { diagnosisTabs } from '@/config/diagnosisTabs';
import { TabId } from './DiagnosisTabs';
import { Check, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiagnosisStepsSidebarProps {
    activeTab: TabId;
    stepStatuses: Record<string, string | boolean>;
    diagnosisStatus?: 'not_started' | 'in_progress' | 'submitted';
    projectId?: number | null;
    diagnosis?: {
        industry_category?: string;
        [key: string]: any;
    };
}

export default function DiagnosisStepsSidebar({
    activeTab,
    stepStatuses,
    diagnosisStatus = 'not_started',
    projectId,
    diagnosis
}: DiagnosisStepsSidebarProps) {
    const getTabRoute = (tabId: TabId): string => {
        const basePath = '/hr-manager/diagnosis';
        if (projectId) {
            return `${basePath}/${projectId}/${tabId}`;
        }
        return `${basePath}/${tabId}`;
    };

    const isTabEnabled = (tabId: TabId) => {
        if (tabId === 'overview') return true;
        if (tabId === 'company-info') return true;
        
        const companyInfoCompleted = diagnosis?.industry_category && diagnosis.industry_category.trim() !== '';
        if (!companyInfoCompleted && tabId !== 'company-info') {
            return false;
        }
        
        if (diagnosisStatus === 'in_progress' || diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked') {
            return true;
        }
        
        const hasAnyTabStarted = Object.keys(stepStatuses).length > 0 && 
            Object.values(stepStatuses).some(status => 
                status && status !== 'not_started' && status !== false && status !== ''
            );
        
        if (hasAnyTabStarted) {
            return true;
        }
        
        return false;
    };

    const getStepStatus = (tabId: TabId) => {
        const status = tabId === 'overview' 
            ? stepStatuses['company-info'] 
            : stepStatuses[tabId];
        
        if (!status || status === 'not_started' || status === false) {
            return 'not_started';
        }
        if (status === 'locked' || status === 'approved') {
            return 'completed';
        }
        if (status === 'submitted') {
            return 'submitted';
        }
        return 'in_progress';
    };

    // Group tabs into sections
    const overviewTab = diagnosisTabs.find(tab => tab.id === 'overview');
    const mainSteps = diagnosisTabs.filter(tab => tab.id !== 'overview' && tab.id !== 'review');
    const reviewTab = diagnosisTabs.find(tab => tab.id === 'review');

    return (
        <>
            {/* Overview Section */}
            {overviewTab && (
                <SidebarGroup>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={activeTab === 'overview'}
                            className={cn(
                                activeTab === 'overview' && 'bg-primary text-primary-foreground'
                            )}
                        >
                            <Link href={getTabRoute('overview')}>
                                <overviewTab.icon className="w-4 h-4" />
                                <span>{overviewTab.name}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarGroup>
            )}

            {/* Main Steps Section */}
            <SidebarGroup>
                <SidebarGroupLabel>Diagnosis Steps</SidebarGroupLabel>
                <SidebarMenu>
                    {mainSteps.map((tab, index) => {
                        const enabled = isTabEnabled(tab.id);
                        const status = getStepStatus(tab.id);
                        const isActive = tab.id === activeTab;
                        const isCompleted = status === 'completed' || status === 'submitted';
                        const isInProgress = status === 'in_progress';

                        return (
                            <SidebarMenuItem key={tab.id}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    disabled={!enabled}
                                    className={cn(
                                        isActive && 'bg-primary text-primary-foreground',
                                        !enabled && 'opacity-50 cursor-not-allowed',
                                        isCompleted && !isActive && 'text-success',
                                        isInProgress && !isActive && 'text-primary'
                                    )}
                                >
                                    <Link href={enabled ? getTabRoute(tab.id) : '#'}>
                                        <div className="flex items-center gap-2 w-full">
                                            <div className="flex items-center gap-2 flex-1">
                                                {isCompleted ? (
                                                    <Check className="w-4 h-4 text-success" />
                                                ) : (
                                                    <Circle className={cn(
                                                        "w-4 h-4",
                                                        isActive && "fill-current",
                                                        isInProgress && "text-primary"
                                                    )} />
                                                )}
                                                <tab.icon className="w-4 h-4" />
                                                <span>{tab.name}</span>
                                            </div>
                                            {!enabled && (
                                                <Lock className="w-3 h-3 text-muted-foreground" />
                                            )}
                                        </div>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroup>

            {/* Review Section */}
            {reviewTab && (
                <SidebarGroup>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={activeTab === 'review'}
                            className={cn(
                                activeTab === 'review' && 'bg-primary text-primary-foreground',
                                getStepStatus('review') === 'submitted' && 'text-success'
                            )}
                        >
                            <Link href={getTabRoute('review')}>
                                <reviewTab.icon className="w-4 h-4" />
                                <span>{reviewTab.name}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarGroup>
            )}
        </>
    );
}
