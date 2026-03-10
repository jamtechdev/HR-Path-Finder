import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Building2,
    Users,
    UserCog,
    UserCheck,
    BriefcaseBusiness,
    Upload,
    Network,
    Layers,
    AlertTriangle,
    History,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Same tab order and labels as HR diagnosis (company-info through hr-issues), plus Change History for CEO
interface Tab {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
    { id: 'company-info', label: 'Basic Info', icon: Building2 },
    { id: 'workforce', label: 'Workforce', icon: Users },
    { id: 'executives', label: 'Executives', icon: UserCog },
    { id: 'leaders', label: 'Leaders', icon: UserCheck },
    { id: 'job-grades', label: 'Job Grades', icon: BriefcaseBusiness },
    { id: 'organizational-charts', label: 'Org Charts', icon: Upload },
    { id: 'organizational-structure', label: 'Org Structure', icon: Network },
    { id: 'job-structure', label: 'Job Structure', icon: Layers },
    { id: 'hr-issues', label: 'HR Issues', icon: AlertTriangle },
    { id: 'history', label: 'Change History', icon: History },
];

interface DiagnosisTabsProps {
    activeTab: string;
    onTabChange: (value: string) => void;
}

export default function DiagnosisTabs({ activeTab, onTabChange }: DiagnosisTabsProps) {
    return (
        <TabsList className="flex w-full flex-wrap gap-1.5 bg-muted/50 p-2 min-h-0 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            'flex items-center gap-1.5 shrink-0 data-[state=active]:bg-white data-[state=active]:shadow-sm',
                            'px-3 py-2 text-xs sm:text-sm',
                            isActive && 'font-semibold'
                        )}
                    >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{tab.label}</span>
                    </TabsTrigger>
                );
            })}
        </TabsList>
    );
}
