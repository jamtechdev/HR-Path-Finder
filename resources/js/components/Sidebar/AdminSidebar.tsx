import { Link, usePage } from '@inertiajs/react';
import { Settings, LayoutGrid, FolderOpen, HelpCircle, FileText, Building2, AlertCircle, Database, Layers, Target, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
    isCollapsed?: boolean;
}

interface Project {
    id: number;
    company?: {
        name: string;
    };
}

export default function AdminSidebar({ isCollapsed = false }: AdminSidebarProps) {
    const { url, props } = usePage();
    const currentPath = url.split('?')[0];
    
    // Get user roles to determine if admin
    const user = (props as any).auth?.user;
    const isAdmin = user?.roles?.some((role: { name: string }) => role.name === 'admin') || false;
    
    // Get projects from shared props or page-specific props
    const projects = (props as any).projects || [];
    const currentProjectId = (props as any).project?.id || (props as any).hrProject?.id;

    const isActive = (path: string) => {
        if (path === '/') {
            return currentPath === '/';
        }
        if (path === '/admin/dashboard') {
            return currentPath === '/admin/dashboard' || currentPath.startsWith('/admin/dashboard/');
        }
        return currentPath === path || currentPath.startsWith(`${path}/`);
    };

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
                        {/* Dashboard - Admin only */}
                        {isAdmin && (
                            <>
                                <Link
                                    href="/admin/dashboard"
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive('/admin/dashboard')
                                            ? "bg-sidebar-accent text-sidebar-primary"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                >
                                    <LayoutGrid className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">Dashboard</span>}
                                </Link>
                                
                                <Link
                                    href="/admin/questions/ceo"
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive('/admin/questions/ceo')
                                            ? "bg-sidebar-accent text-sidebar-primary"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                >
                                    <HelpCircle className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">CEO Questions</span>}
                                </Link>
                                
                                <Link
                                    href="/admin/policy-snapshot"
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive('/admin/policy-snapshot')
                                            ? "bg-sidebar-accent text-sidebar-primary"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                >
                                    <FileText className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">Policy Snapshot</span>}
                                </Link>
                                
                                <Link
                                    href="/admin/hr-issues"
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive('/admin/hr-issues')
                                            ? "bg-sidebar-accent text-sidebar-primary"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                >
                                    <AlertCircle className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">HR Issues</span>}
                                </Link>
                                
                                <Link
                                    href="/admin/industries"
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive('/admin/industries')
                                            ? "bg-sidebar-accent text-sidebar-primary"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                >
                                    <Building2 className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">Industries</span>}
                                </Link>
                                
                                <Link
                                    href="/admin/subcategories"
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive('/admin/subcategories')
                                            ? "bg-sidebar-accent text-sidebar-primary"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                >
                                    <Layers className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">Subcategories</span>}
                                </Link>
                                
                                <Link
                                    href="/hr-projects"
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive('/hr-projects')
                                            ? "bg-sidebar-accent text-sidebar-primary"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                >
                                    <Database className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">All Projects</span>}
                                </Link>
                                
                                {!isCollapsed && (
                                    <div className="px-4 mt-4 mb-2">
                                        <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                                            Recommendations
                                        </span>
                                    </div>
                                )}
                                
                                <div className={cn("text-xs text-sidebar-foreground/50 px-4 mb-2", isCollapsed && "hidden")}>
                                    <p className="text-xs text-sidebar-foreground/50 italic">
                                        Access via project review or dashboard
                                    </p>
                                </div>
                            </>
                        )}
                        
                        {/* Projects Section - Admin can see all projects */}
                        {isAdmin && projects.length > 0 && (
                            <div className={cn("mt-6", isCollapsed && "mt-4")}>
                                {!isCollapsed && (
                                    <div className="px-4 mb-2">
                                        <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                                            Projects
                                        </span>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {projects.map((project: Project) => {
                                        const projectActive = currentProjectId === project.id;
                                        const projectPath = `/admin/review/${project.id}`;
                                        
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
                        )}
                        
                        <Link
                            href="/settings"
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mt-4",
                                isActive('/settings')
                                    ? "bg-sidebar-accent text-sidebar-primary"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                isCollapsed && "justify-center px-3"
                            )}
                        >
                            <Settings className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                            {!isCollapsed && <span className="flex-1 text-left truncate">Settings</span>}
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    );
}
