import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import React, { useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface StepTab {
    id: string;
    name: string;
    icon: LucideIcon;
    route: string;
    isEssential?: boolean;
}

interface StepTabsProps {
    tabs: StepTab[];
    activeTab: string;
    stepStatus?: Record<string, string | boolean>;
    projectId?: number | null;
    basePath: string; // e.g., '/hr-manager/diagnosis' or '/hr-manager/job-analysis'
    isTabCompleted?: (tabId: string) => boolean;
    isTabEnabled?: (tabId: string, tabIndex: number) => boolean;
}

export default function StepTabs({ 
    tabs, 
    activeTab, 
    stepStatus = {}, 
    projectId,
    basePath,
    isTabCompleted,
    isTabEnabled
}: StepTabsProps) {
    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const activeTabRef = useRef<HTMLAnchorElement>(null);
    
    useLayoutEffect(() => {
        if (activeTabRef.current && tabsContainerRef.current) {
            const container = tabsContainerRef.current;
            const activeTabElement = activeTabRef.current;
            const containerRect = container.getBoundingClientRect();
            const tabRect = activeTabElement.getBoundingClientRect();
            const scrollLeft = activeTabElement.offsetLeft - containerRect.width / 2 + tabRect.width / 2;
            container.scrollTo({
                left: Math.max(0, scrollLeft),
                behavior: 'smooth',
            });
        }
    }, [activeTab]);
    
    // Generate route for a tab based on projectId
    const getTabRoute = (tab: StepTab): string => {
        if (projectId) {
            return `${basePath}/${projectId}/${tab.id}`;
        }
        return `${basePath}/${tab.id}`;
    };

    const checkTabCompleted = (tabId: string): boolean => {
        if (isTabCompleted) {
            return isTabCompleted(tabId);
        }
        if (!stepStatus || typeof stepStatus !== 'object') {
            return false;
        }
        const status = stepStatus[tabId];
        return status && (
            status === true || 
            status === 'completed' ||
            status === 'submitted' || 
            status === 'approved' ||
            status === 'locked'
        );
    };
    
    const checkTabEnabled = (tabId: string, tabIndex: number): boolean => {
        if (isTabEnabled) {
            return isTabEnabled(tabId, tabIndex);
        }
        // First tab is always enabled
        if (tabIndex === 0 || tabId === 'overview') return true;
        
        // Get current tab index
        const currentTabIndex = tabs.findIndex(tab => tab && tab.id === activeTab);
        
        // If going backwards (to a previous tab), always allow
        if (currentTabIndex >= 0 && tabIndex < currentTabIndex) {
            return true;
        }
        
        // If the tab is already completed, allow navigation to it
        if (checkTabCompleted(tabId)) {
            return true;
        }
        
        // Check if all previous tabs are completed
        if (!tabs || !Array.isArray(tabs)) {
            return false;
        }
        
        for (let i = 0; i < tabIndex; i++) {
            const prevTab = tabs[i];
            if (!prevTab || !prevTab.id) continue;
            if (prevTab.id === 'overview') continue;
            
            if (!checkTabCompleted(prevTab.id)) {
                return false;
            }
        }
        
        return true;
    };
    
    const handleTabClick = (e: React.MouseEvent, tabId: string, tabRoute: string, tabIndex: number) => {
        // If clicking on first tab or overview, allow navigation
        if (tabIndex === 0 || tabId === 'overview') {
            return; // Allow navigation
        }
        
        // Get current tab index
        const currentTabIndex = tabs.findIndex(tab => tab && tab.id === activeTab);
        
        // If going backwards or tab is completed, always allow
        if (currentTabIndex >= 0 && (tabIndex < currentTabIndex || checkTabCompleted(tabId))) {
            return; // Allow navigation
        }
        
        // Check if tab is enabled
        if (!checkTabEnabled(tabId, tabIndex)) {
            e.preventDefault();
            // Find the first incomplete previous tab
            if (!tabs || !Array.isArray(tabs)) {
                return;
            }
            
            let incompleteTab = null;
            for (let i = 0; i < tabIndex; i++) {
                const prevTab = tabs[i];
                if (!prevTab || !prevTab.id) continue;
                if (prevTab.id === 'overview') continue;
                if (!checkTabCompleted(prevTab.id)) {
                    incompleteTab = prevTab;
                    break;
                }
            }
            
            if (incompleteTab) {
                const targetTab = tabs.find(t => t && t.id === tabId);
                alert(`Please complete "${incompleteTab.name || incompleteTab.id}" step before navigating to "${targetTab?.name || tabId}". All required fields must be filled.`);
            }
            return;
        }
    };

    return (
        <div 
            ref={tabsContainerRef}
            className="flex gap-2 overflow-x-auto pb-2 scroll-smooth mb-6"
            style={{ scrollbarWidth: 'thin' }}
        >
            {tabs && tabs.length > 0 ? tabs.map((tab, index) => {
                if (!tab || !tab.id) {
                    return null;
                }
                const enabled = checkTabEnabled(tab.id, index);
                const completed = checkTabCompleted(tab.id);
                const isActive = tab.id === activeTab;
                const TabIcon = completed ? Check : tab.icon;
                const tabRoute = getTabRoute(tab);

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
                        ref={isActive ? activeTabRef : null}
                        href={tabRoute}
                        onClick={(e) => handleTabClick(e, tab.id, tabRoute, index)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer relative",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2"
                                : completed && tab.id !== 'overview'
                                ? "bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                    >
                        {completed && tab.id !== 'overview' && !isActive && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                        <TabIcon className={cn(
                            "w-4 h-4 flex-shrink-0",
                            isActive && "text-primary-foreground",
                            completed && !isActive && tab.id !== 'overview' && "text-green-600"
                        )} />
                        <span className="hidden sm:inline">{tab.name}</span>
                    </Link>
                );
            }).filter(Boolean) : null}
        </div>
    );
}
