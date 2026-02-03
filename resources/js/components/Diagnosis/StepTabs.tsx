import type { ComponentType } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepTabItem {
    id: string;
    name: string;
    icon?: ComponentType<{ className?: string }>;
}

interface StepTabsProps {
    tabs: StepTabItem[];
    activeTab: string;
    onSelect: (id: string) => void;
    isLocked: (id: string) => boolean;
    isComplete: (id: string) => boolean;
}

export function StepTabs({ tabs, activeTab, onSelect, isLocked, isComplete }: StepTabsProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => {
                const locked = isLocked(tab.id);
                const isActive = tab.id === activeTab;
                const complete = isComplete(tab.id);
                const Icon = complete ? Check : tab.icon;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        disabled={locked}
                        onClick={() => onSelect(tab.id)}
                        className={cn(
                            'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-colors',
                            isActive
                                ? 'bg-primary text-primary-foreground'
                                : locked
                                ? 'cursor-not-allowed bg-muted/50 text-muted-foreground/60'
                                : complete
                                ? 'bg-success/10 text-success hover:bg-success/20'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                    >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span className="whitespace-nowrap">{tab.name}</span>
                    </button>
                );
            })}
        </div>
    );
}
