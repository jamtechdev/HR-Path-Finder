import React, { useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'overview' | 'company-info' | 'workforce' | 'executives' | 'leaders' | 'job-grades' | 'organizational-charts' | 'organizational-structure' | 'job-structure' | 'hr-issues' | 'review';

interface Tab {
    id: TabId;
    name: string;
    icon: LucideIcon;
    route: string;
}

interface DiagnosisTabsProps {
    tabs: Tab[];
    activeTab: TabId;
    stepStatus: Record<string, string | boolean>;
    stepOrder: readonly string[];
    projectId?: number | null;
    diagnosisStatus?: 'not_started' | 'in_progress' | 'submitted';
    diagnosis?: {
        industry_category?: string;
        [key: string]: any;
    };
}

// Validation functions for each step
const validateStepCompletion = (tabId: TabId, diagnosis: any): boolean => {
    if (!diagnosis) return false;

    switch (tabId) {
        case 'company-info':
            // Required: industry_category
            return !!(diagnosis.industry_category && diagnosis.industry_category.trim() !== '');
        
        case 'workforce':
            // Required: present_headcount
            return !!(diagnosis.present_headcount && diagnosis.present_headcount > 0);
        
        case 'organizational-charts':
            // Required: at least one chart uploaded
            if (diagnosis.organizational_charts) {
                if (Array.isArray(diagnosis.organizational_charts)) {
                    return diagnosis.organizational_charts.length > 0;
                }
                return Object.keys(diagnosis.organizational_charts).length > 0;
            }
            return false;
        
        case 'organizational-structure':
            // Required: at least one structure type selected
            const structure = diagnosis.org_structure_types || diagnosis.organizational_structure;
            if (structure) {
                if (Array.isArray(structure)) {
                    return structure.length > 0;
                }
                return Object.keys(structure).length > 0;
            }
            return false;
        
        case 'job-structure':
            // Required: at least one job category or function
            return !!((diagnosis.job_categories && diagnosis.job_categories.length > 0) ||
                     (diagnosis.job_functions && diagnosis.job_functions.length > 0));
        
        case 'hr-issues':
            // At least one issue selected or custom issue added
            return !!(diagnosis.hr_issues && 
                     (Array.isArray(diagnosis.hr_issues) ? diagnosis.hr_issues.length > 0 : false)) ||
                   !!(diagnosis.custom_hr_issues && diagnosis.custom_hr_issues.trim() !== '');
        
        case 'executives':
        case 'leaders':
        case 'job-grades':
            // These are optional, but check if they have any data
            if (tabId === 'executives') {
                return !!(diagnosis.total_executives && diagnosis.total_executives > 0) ||
                       !!(diagnosis.executive_positions && 
                          ((Array.isArray(diagnosis.executive_positions) && diagnosis.executive_positions.length > 0) ||
                           (typeof diagnosis.executive_positions === 'object' && Object.keys(diagnosis.executive_positions).length > 0)));
            }
            if (tabId === 'leaders') {
                return !!(diagnosis.leadership_count && diagnosis.leadership_count > 0);
            }
            if (tabId === 'job-grades') {
                return !!(diagnosis.job_grade_names && 
                          Array.isArray(diagnosis.job_grade_names) && diagnosis.job_grade_names.length > 0);
            }
            return true; // Allow navigation, but mark as incomplete if empty
        
        case 'review':
            // Review is accessible if all previous steps are completed
            return true;
        
        default:
            return true;
    }
};

export default function DiagnosisTabs({ 
    tabs, 
    activeTab, 
    stepStatus, 
    stepOrder,
    projectId,
    diagnosisStatus = 'not_started',
    diagnosis
}: DiagnosisTabsProps) {
    // Normalize activeTab to ensure it matches TabId type
    const normalizedActiveTab = activeTab as TabId;
    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const activeTabRef = useRef<HTMLAnchorElement>(null);
    
    // Auto-scroll to active tab
    useEffect(() => {
        if (activeTabRef.current && tabsContainerRef.current) {
            const container = tabsContainerRef.current;
            const activeTabElement = activeTabRef.current;
            
            const containerRect = container.getBoundingClientRect();
            const tabRect = activeTabElement.getBoundingClientRect();
            
            // Calculate scroll position to center the active tab
            const scrollLeft = activeTabElement.offsetLeft - (containerRect.width / 2) + (tabRect.width / 2);
            
            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }, [activeTab]);
    
    // Generate route for a tab based on projectId
    const getTabRoute = (tab: Tab): string => {
        const basePath = '/hr-manager/diagnosis';
        // If projectId exists, use the route with projectId
        if (projectId) {
            return `${basePath}/${projectId}/${tab.id}`;
        }
        // Otherwise use the simple route
        return `${basePath}/${tab.id}`;
    };

    const isTabCompleted = (tabId: TabId): boolean => {
        // Overview is completed if company-info is completed
        if (tabId === 'overview') {
            return validateStepCompletion('company-info', diagnosis);
        }
        
        const status = stepStatus[tabId];
        const isStatusCompleted = status && (
            status === true || 
            status === 'completed' ||
            status === 'submitted' || 
            status === 'approved' || 
            status === 'locked'
        );
        
        // Also check if the step has required fields filled
        return isStatusCompleted || validateStepCompletion(tabId, diagnosis);
    };

    const isTabEnabled = (tabId: TabId, tabIndex: number): boolean => {
        // Overview is always enabled
        if (tabId === 'overview') return true;
        
        // Company-info is always enabled (first step)
        if (tabId === 'company-info') return true;
        
        // Check if all previous tabs are completed
        for (let i = 0; i < tabIndex; i++) {
            const prevTab = tabs[i];
            if (prevTab.id === 'overview') continue; // Skip overview
            
            if (!isTabCompleted(prevTab.id)) {
                return false;
            }
        }
        
        return true;
    };
    
    const handleTabClick = (e: React.MouseEvent, tabId: TabId, tabRoute: string, tabIndex: number) => {
        // If clicking on company-info or overview, allow navigation
        if (tabId === 'company-info' || tabId === 'overview') {
            return; // Allow navigation
        }
        
        // Check if tab is enabled
        if (!isTabEnabled(tabId, tabIndex)) {
            e.preventDefault();
            // Find the first incomplete previous tab
            let incompleteTab = null;
            for (let i = 0; i < tabIndex; i++) {
                const prevTab = tabs[i];
                if (prevTab.id === 'overview') continue;
                if (!isTabCompleted(prevTab.id)) {
                    incompleteTab = prevTab;
                    break;
                }
            }
            
            if (incompleteTab) {
                alert(`Please complete "${incompleteTab.name}" step before navigating to "${tabs.find(t => t.id === tabId)?.name}". All required fields must be filled.`);
            }
            return;
        }
    };

    return (
        <div 
            ref={tabsContainerRef}
            className="flex gap-2 overflow-x-auto pb-2 scroll-smooth"
            style={{ scrollbarWidth: 'thin' }}
        >
            {tabs.map((tab, index) => {
                const enabled = isTabEnabled(tab.id, index);
                const completed = isTabCompleted(tab.id);
                const isActive = tab.id === normalizedActiveTab;
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
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-md"
                                : completed
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                    >
                        <TabIcon className={cn(
                            "w-4 h-4 flex-shrink-0",
                            completed && !isActive && "text-green-600"
                        )} />
                        <span className="hidden sm:inline">{tab.name}</span>
                    </Link>
                );
            })}
        </div>
    );
}
