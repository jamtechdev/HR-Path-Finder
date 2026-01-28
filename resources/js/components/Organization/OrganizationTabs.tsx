import { Link } from '@inertiajs/react';
import { FileText, Building2, Layers, Link2, Users, Check, LucideIcon } from 'lucide-react';

export type TabId = 'overview' | 'organization-structure' | 'job-grade-structure' | 'grade-title-relationship' | 'managerial-definition' | 'review';

interface Tab {
    id: TabId;
    name: string;
    icon: LucideIcon;
    route: string;
}

interface OrganizationTabsProps {
    tabs: Tab[];
    activeTab: TabId;
    stepStatus: Record<string, boolean>;
    stepOrder: readonly string[];
    projectId?: number | null;
}

export default function OrganizationTabs({ 
    tabs, 
    activeTab, 
    stepStatus, 
    stepOrder 
}: OrganizationTabsProps) {
    const isTabEnabled = (tabId: TabId) => {
        if (tabId === 'overview') return true;
        if (tabId === 'organization-structure') return true; // Always enabled
        const tabIndex = stepOrder.indexOf(tabId);
        if (tabIndex === -1) return false;
        if (tabIndex === 0) return true;
        const previousStep = stepOrder[tabIndex - 1];
        return stepStatus[previousStep];
    };

    return (
        <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => {
                const enabled = isTabEnabled(tab.id);
                // Overview is completed if organization-structure is completed
                const completed = tab.id === 'overview' 
                    ? stepStatus['organization-structure'] 
                    : stepStatus[tab.id];
                const isActive = tab.id === activeTab;
                const TabIcon = completed ? Check : tab.icon;

                if (!enabled) {
                    return (
                        <button
                            key={tab.id}
                            disabled
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
                        >
                            <TabIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.name}</span>
                        </button>
                    );
                }

                return (
                    <Link
                        key={tab.id}
                        href={tab.route}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                            isActive
                                ? 'bg-primary text-primary-foreground'
                                : completed
                                ? 'bg-success/10 text-success hover:bg-success/20'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                        <TabIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.name}</span>
                    </Link>
                );
            })}
        </div>
    );
}
