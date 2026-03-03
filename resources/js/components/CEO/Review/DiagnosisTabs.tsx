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
    History 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
    { id: 'company-info', label: 'Company Info', icon: Building2 },
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
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 gap-2 bg-muted/50 p-1 h-auto">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                    <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm",
                            "px-3 py-2 text-sm",
                            isActive && "font-semibold"
                        )}
                    >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden lg:inline">{tab.label}</span>
                        <span className="lg:hidden text-xs">{tab.label.split(' ')[0]}</span>
                    </TabsTrigger>
                );
            })}
        </TabsList>
    );
}
