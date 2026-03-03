import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, FolderOpen, FileText, CheckCircle2, User, Target, Network, FileBarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CEOSidebarProps {
    isCollapsed?: boolean;
}

interface Project {
    id: number;
    company?: {
        name: string;
    };
}

export default function CEOSidebar({ isCollapsed = false }: CEOSidebarProps) {
    const { url, props } = usePage();
    const currentPath = url.split('?')[0];
    
    // Get projects from shared props or page-specific props
    const projects = (props as any).projects || [];
    const currentProjectId = (props as any).project?.id || (props as any).hrProject?.id;

    const isActive = (path: string) => {
        if (path === '/') {
            return currentPath === '/';
        }
        if (path === '/ceo/dashboard') {
            return currentPath === '/ceo/dashboard' || currentPath.startsWith('/ceo/dashboard/');
        }
        if (path === '/ceo/projects') {
            return currentPath === '/ceo/projects' || currentPath.startsWith('/ceo/projects/') || currentPath.startsWith('/ceo/review/') || currentPath.startsWith('/ceo/philosophy/') || currentPath.startsWith('/ceo/final-review/');
        }
        if (path === '/ceo/kpi-review') {
            return currentPath.startsWith('/ceo/kpi-review/');
        }
        if (path.startsWith('/ceo/tree/')) {
            return currentPath.startsWith('/ceo/tree/');
        }
        if (path.startsWith('/ceo/report/')) {
            return currentPath.startsWith('/ceo/report/');
        }
        return currentPath === path || currentPath.startsWith(`${path}/`);
    };

    // Get projects with KPIs that need review
    const projectsWithKpiReview = projects.filter((project: Project) => {
        const stepStatuses = (project as any).step_statuses || {};
        const performanceStatus = stepStatuses.performance;
        return performanceStatus && ['in_progress', 'submitted'].includes(performanceStatus);
    });

    const menuItems = [
        {
            href: '/ceo/dashboard',
            label: 'Dashboard',
            icon: LayoutGrid,
        },
        {
            href: '/ceo/projects',
            label: 'Projects',
            icon: FolderOpen,
        },
    ];

    // Add KPI Review section if there are projects with KPIs
    if (projectsWithKpiReview.length > 0 && currentProjectId) {
        menuItems.push({
            href: `/ceo/kpi-review/${currentProjectId}`,
            label: 'KPI Review',
            icon: Target,
        });
    }

    // Add Tree section if there's a current project
    if (currentProjectId) {
        menuItems.push({
            href: `/ceo/tree/${currentProjectId}/overview`,
            label: 'Tree',
            icon: Network,
        });
        menuItems.push({
            href: `/ceo/report/${currentProjectId}`,
            label: 'Report',
            icon: FileBarChart,
        });
    }

    return (
        <div className="flex flex-col h-full w-full">
            <div className={cn(
                "flex items-center border-b border-sidebar-border/30 gap-3 transition-all duration-200",
                isCollapsed ? "h-16 px-4 justify-center" : "h-20 px-6"
            )}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-200">
                    <span className="text-white font-bold text-base">HR</span>
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sidebar-foreground text-lg leading-none">HR Path-Finder</span>
                        <span className="text-xs text-sidebar-foreground/60 leading-none">by BetterCompany</span>
                    </div>
                )}
            </div>
            
            <nav className="flex-1 overflow-y-auto">
                <div className={cn("transition-all duration-200", isCollapsed ? "px-3 py-6" : "px-6 py-8")}>
                    <div className={cn("transition-all duration-200", isCollapsed ? "space-y-2" : "space-y-2")}>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        active
                                            ? "bg-sidebar-accent text-sidebar-primary"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                >
                                    <Icon className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                                </Link>
                            );
                        })}
                        
                    </div>
                </div>
            </nav>
        </div>
    );
}
