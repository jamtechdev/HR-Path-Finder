import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, FolderOpen, FileText, CheckCircle2, User } from 'lucide-react';
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
        if (path === '/ceo/review') {
            return currentPath.startsWith('/ceo/review/');
        }
        if (path === '/ceo/philosophy') {
            return currentPath.startsWith('/ceo/philosophy/');
        }
        if (path === '/ceo/final-review') {
            return currentPath.startsWith('/ceo/final-review/');
        }
        return currentPath === path || currentPath.startsWith(`${path}/`);
    };

    const menuItems = [
        {
            href: '/ceo/dashboard',
            label: 'Dashboard',
            icon: LayoutGrid,
        },
    ];

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
                        
                        {/* Projects Section */}
                        {projects.length > 0 ? (
                            <div className={cn("mt-6", isCollapsed && "mt-4")}>
                                {!isCollapsed && (
                                    <div className="px-4 mb-2">
                                        <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                                            My Projects
                                        </span>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {projects.map((project: Project) => {
                                        const projectActive = currentProjectId === project.id;
                                        const projectPath = `/ceo/review/diagnosis/${project.id}`;
                                        
                                        return (
                                            <Link
                                                key={project.id}
                                                href={projectPath}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200",
                                                    projectActive
                                                        ? "bg-sidebar-accent text-sidebar-primary"
                                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                                    isCollapsed && "justify-center px-3"
                                                )}
                                            >
                                                <FolderOpen className={cn("flex-shrink-0", isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
                                                {!isCollapsed && (
                                                    <span className="flex-1 text-left truncate text-xs">
                                                        {project.company?.name || `Project #${project.id}`}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            !isCollapsed && (
                                <div className="mt-6 px-4">
                                    <p className="text-xs text-sidebar-foreground/50 text-center py-4">
                                        No projects available
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}
