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
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        <TabsList className="!h-auto !justify-start !bg-transparent !p-0 my-3 flex w-full flex-nowrap gap-2 rounded-none border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-4 py-3 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 min-h-0 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            'flex items-center gap-2 shrink-0 rounded-full border border-slate-200/80 bg-white/70 text-slate-600 transition-all duration-150',
                            'dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300',
                            'hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                            'data-[state=active]:border-blue-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-indigo-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm',
                            'dark:data-[state=active]:border-blue-900/70 dark:data-[state=active]:from-blue-950/50 dark:data-[state=active]:to-indigo-950/50 dark:data-[state=active]:text-blue-300',
                            'px-3.5 py-2 text-xs sm:text-sm',
                            isActive && 'font-semibold'
                        )}
                    >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="whitespace-nowrap">{tab.label}</span>
                    </TabsTrigger>
                );
            })}
        </TabsList>
    );
}
