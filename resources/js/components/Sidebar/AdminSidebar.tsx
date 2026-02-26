import { Link, usePage } from '@inertiajs/react';
import { Settings, LayoutGrid, FolderOpen, HelpCircle, FileText, Building2, AlertCircle, Database, Layers, Target, DollarSign, Languages, ChevronRight, ChevronDown, Users, Eye, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
    const [translationsOpen, setTranslationsOpen] = useState(currentPath.startsWith('/admin/translations'));
    
    // Get user roles to determine if admin
    const user = (props as any).auth?.user;
    const isAdmin = user?.roles?.some((role: { name: string }) => role.name === 'admin') || false;
    
    // Get projects from shared props or page-specific props
    const projects = (props as any).projects || [];
    const currentProjectId = (props as any).project?.id || (props as any).hrProject?.id;

    const translationPages = [
        { key: 'all', label: 'All Translations', path: '/admin/translations?page=all' },
        { key: 'landing-page', label: 'Landing Page', path: '/admin/landing-page' },
        { key: 'auth', label: 'Authentication', path: '/admin/translations?page=auth' },
        { key: 'auth.login', label: 'Login Page', path: '/admin/translations?page=auth.login' },
        { key: 'auth.register', label: 'Register Page', path: '/admin/translations?page=auth.register' },
        { key: 'dashboard', label: 'Dashboard', path: '/admin/translations?page=dashboard' },
        { key: 'common', label: 'Common', path: '/admin/translations?page=common' },
        { key: 'navigation', label: 'Navigation', path: '/admin/translations?page=navigation' },
        { key: 'buttons', label: 'Buttons', path: '/admin/translations?page=buttons' },
        { key: 'messages', label: 'Messages', path: '/admin/translations?page=messages' },
    ];

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
                                    href="/admin/ceo"
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive('/admin/ceo')
                                            ? "bg-sidebar-accent text-sidebar-primary"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                >
                                    <Users className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">CEO Management</span>}
                                </Link>

                                <Link
                                    href="/admin/project-tree"
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive('/admin/project-tree')
                                            ? "bg-sidebar-accent text-sidebar-primary"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                >
                                    <Eye className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">Project Tree</span>}
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
                                    href="/admin/performance-snapshot"
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive('/admin/performance-snapshot')
                                            ? "bg-sidebar-accent text-sidebar-primary"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                >
                                    <Target className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">Performance Snapshot</span>}
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
                                
                                {/* Translations Menu */}
                                <div className={cn("mt-2", isCollapsed && "hidden")}>
                                    <button
                                        onClick={() => !isCollapsed && setTranslationsOpen(!translationsOpen)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                            (isActive('/admin/translations') || isActive('/admin/landing-page'))
                                                ? "bg-sidebar-accent text-sidebar-primary"
                                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                        )}
                                    >
                                        <Languages className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 text-left truncate">Translations</span>
                                                {translationsOpen ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </>
                                        )}
                                    </button>
                                    
                                    {!isCollapsed && translationsOpen && (
                                        <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border/30 pl-4">
                                            {translationPages.map((page) => {
                                                const isActive = page.key === 'landing-page' 
                                                    ? currentPath === '/admin/landing-page'
                                                    : currentPath === page.path.split('?')[0] && (page.key === 'all' || url.includes(`page=${page.key}`));
                                                
                                                return (
                                                    <Link
                                                        key={page.key}
                                                        href={page.path}
                                                        className={cn(
                                                            "w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-all duration-200",
                                                            isActive
                                                                ? "bg-sidebar-accent/50 text-sidebar-primary font-medium"
                                                                : "text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
                                                        )}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                                                        <span className="truncate">{page.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                
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
                        {isAdmin && (
                            <div className={cn("mt-6", isCollapsed && "mt-4")}>
                                {!isCollapsed && (
                                    <div className="px-4 mb-2">
                                        <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                                            Projects
                                        </span>
                                    </div>
                                )}
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
