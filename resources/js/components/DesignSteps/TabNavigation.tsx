import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
    id: string;
    label: string;
}

interface TabNavigationProps {
    tabs: Tab[];
    activeTab: string;
    completedTabs: string[];
    onTabChange: (tabId: string) => void;
}

export default function TabNavigation({
    tabs,
    activeTab,
    completedTabs,
    onTabChange,
}: TabNavigationProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {tabs.map((tab, index) => {
                const isCompleted = completedTabs.includes(tab.id);
                const isActive = tab.id === activeTab;
                const Icon = isCompleted ? Check : null;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                            isActive
                                ? 'bg-primary text-primary-foreground'
                                : isCompleted
                                ? 'bg-success/10 text-success hover:bg-success/20'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                    >
                        {Icon && <Icon className="w-4 h-4" />}
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
