import { Link, usePage } from '@inertiajs/react';
import { Settings, LayoutGrid, HelpCircle, FileText, Building2, AlertCircle, Database, Layers, Target, DollarSign, Languages, ChevronRight, ChevronDown, Users, Eye, Mail } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
    isCollapsed?: boolean;
}

interface Project {
    id: number;
    company?: { name: string } | null;
    step_statuses?: Record<string, string>;
    kpi_review_status?: string;
    kpi_total?: number;
    kpi_approved?: number;
}

export default function AdminSidebar({ isCollapsed = false }: AdminSidebarProps) {
    const { url, props } = usePage();
    const currentPath = url.split('?')[0];
    const [clientOpsOpen, setClientOpsOpen] = useState(true);
    const [contentMgmtOpen, setContentMgmtOpen] = useState(true);
    const [systemConfigOpen, setSystemConfigOpen] = useState(true);
    const [translationsOpen, setTranslationsOpen] = useState(currentPath.startsWith('/admin/translations'));
    
    // Get user roles to determine if admin
    const user = (props as any).auth?.user;
    const isAdmin = user?.roles?.some((role: { name: string }) => role.name === 'admin') || false;
    
    // Get projects from shared props (with step_statuses and kpi_review_status for KPI list)
    const projects: Project[] = (props as any).projects || [];
    const appName = (props as any).appConfig?.name || 'HR Path-Finder';
    const appLogo = (props as any).appConfig?.logo || '/logo.svg';

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
        if (path === '/admin/kpi-review') {
            return currentPath.startsWith('/admin/kpi-review/');
        }
        if (path === '/') {
            return currentPath === '/';
        }
        if (path === '/admin/dashboard') {
            return currentPath === '/admin/dashboard' || currentPath.startsWith('/admin/dashboard/');
        }
        return currentPath === path || currentPath.startsWith(`${path}/`);
    };

    const menuBtnClass =
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200";
    const sectionTitleClass = "text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 px-4 pt-2 pb-1";
    const sectionWrapClass = "space-y-1";

    return (
        <div className="flex flex-col h-full w-full">
            <div className={cn(
                "flex items-center border-b border-sidebar-border/30 gap-3 transition-all duration-200",
                isCollapsed ? "h-16 px-4 justify-center" : "h-20 px-6"
            )}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-sm transition-all duration-200 overflow-hidden">
                    <img src={appLogo} alt={appName} className="w-9 h-9 object-contain" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sidebar-foreground text-lg leading-none">{appName}</span>
                        <span className="text-xs text-sidebar-foreground/60 leading-none">by BetterCompany</span>
                    </div>
                )}
            </div>
            
            <nav className="flex-1 overflow-y-auto">
                <div className={cn("transition-all duration-200", isCollapsed ? "px-3 py-6" : "px-6 py-8")}>
                    <div className={cn("transition-all duration-200", isCollapsed ? "space-y-2" : "space-y-2")}>
                        {isAdmin && (
                            <>
                                <Link
                                    href="/admin/dashboard"
                                    className={cn(
                                        menuBtnClass,
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
                                    href="/admin/contact-us"
                                    className={cn(
                                        menuBtnClass,
                                        isActive('/admin/contact-us')
                                            ? "bg-sidebar-accent text-sidebar-primary"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                        isCollapsed && "justify-center px-3"
                                    )}
                                >
                                    <Mail className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">Contact Us</span>}
                                </Link>

                                {!isCollapsed && (
                                    <div className={sectionTitleClass}>Client Ops</div>
                                )}
                                <div className={sectionWrapClass}>
                                    <button
                                        onClick={() => !isCollapsed && setClientOpsOpen((prev) => !prev)}
                                        className={cn(menuBtnClass, "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}
                                    >
                                        <Database className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 text-left truncate">Client Ops</span>
                                                {clientOpsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </>
                                        )}
                                    </button>
                                    {!isCollapsed && clientOpsOpen && (
                                        <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border/30 pl-4">
                                            <Link href="/admin/ceo" className={cn(menuBtnClass, "py-2 text-xs", isActive('/admin/ceo') ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
                                                <Users className="w-4 h-4" />
                                                <span className="truncate">Users & Beta Access</span>
                                            </Link>
                                            <Link href="/admin/project-tree" className={cn(menuBtnClass, "py-2 text-xs", isActive('/admin/project-tree') ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
                                                <Eye className="w-4 h-4" />
                                                <span className="truncate">All Projects</span>
                                            </Link>
                                            <Link href="/admin/hr-projects" className={cn(menuBtnClass, "py-2 text-xs", isActive('/admin/hr-projects') ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
                                                <Building2 className="w-4 h-4" />
                                                <span className="truncate">All Companies</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {!isCollapsed && (
                                    <div className={sectionTitleClass}>Content Mgmt</div>
                                )}
                                <div className={sectionWrapClass}>
                                    <button
                                        onClick={() => !isCollapsed && setContentMgmtOpen((prev) => !prev)}
                                        className={cn(menuBtnClass, "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}
                                    >
                                        <FileText className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 text-left truncate">Content Mgmt</span>
                                                {contentMgmtOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </>
                                        )}
                                    </button>
                                    {!isCollapsed && contentMgmtOpen && (
                                        <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border/30 pl-4">
                                            <Link href="/admin/questions/ceo" className={cn(menuBtnClass, "py-2 text-xs", isActive('/admin/questions/ceo') ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}><HelpCircle className="w-4 h-4" /><span>CEO Questions</span></Link>
                                            <Link href="/admin/policy-snapshot" className={cn(menuBtnClass, "py-2 text-xs", isActive('/admin/policy-snapshot') ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}><FileText className="w-4 h-4" /><span>Policy Snapshot</span></Link>
                                            <Link href="/admin/performance-snapshot" className={cn(menuBtnClass, "py-2 text-xs", isActive('/admin/performance-snapshot') ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}><Target className="w-4 h-4" /><span>Performance Snapshot</span></Link>
                                            <Link href="/admin/compensation-snapshot" className={cn(menuBtnClass, "py-2 text-xs", isActive('/admin/compensation-snapshot') ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}><DollarSign className="w-4 h-4" /><span>Compensation Snapshot</span></Link>
                                            <Link href="/admin/kpi-templates" className={cn(menuBtnClass, "py-2 text-xs", isActive('/admin/kpi-templates') ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}><Target className="w-4 h-4" /><span>KPI Templates</span></Link>
                                        </div>
                                    )}
                                </div>
                                
                                {/* KPI Review - all projects with KPIs */}
                                {(() => {
                                    const projectsWithKpis = projects.filter((p) => (p.kpi_total ?? 0) > 0);
                                    const kpiStatusLabel = (status: string) => {
                                        if (status === 'approved') return 'Approved';
                                        if (status === 'revision_requested') return 'Revision requested';
                                        if (status === 'pending') return 'Pending';
                                        if (status === 'in_progress') return 'In Progress';
                                        return '—';
                                    };
                                    if (isCollapsed && projectsWithKpis.length > 0) {
                                        return (
                                            <Link
                                                href={`/admin/kpi-review/${projectsWithKpis[0].id}`}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                                    isActive('/admin/kpi-review') ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                                    "justify-center px-3"
                                                )}
                                            >
                                                <Target className="w-6 h-6 flex-shrink-0" />
                                            </Link>
                                        );
                                    }
                                    if (!isCollapsed && projectsWithKpis.length > 0) {
                                        return (
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 px-4 pt-2 pb-1">KPI Review (all)</div>
                                                {projectsWithKpis.map((project) => {
                                                    const href = `/admin/kpi-review/${project.id}`;
                                                    const active = currentPath === href || currentPath.startsWith(href + '/');
                                                    const status = project.kpi_review_status ?? 'none';
                                                    const label = project.company?.name ?? `Project ${project.id}`;
                                                    return (
                                                        <Link
                                                            key={project.id}
                                                            href={href}
                                                            className={cn(
                                                                "w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                                                active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                <Target className="w-4 h-4 flex-shrink-0 opacity-70" />
                                                                <span className="truncate">{label}</span>
                                                            </div>
                                                            <span
                                                                className={cn(
                                                                    "flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded",
                                                                    status === 'approved' && "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                                                                    status === 'revision_requested' && "bg-orange-500/20 text-orange-600 dark:text-orange-400",
                                                                    status === 'pending' && "bg-amber-500/20 text-amber-600 dark:text-amber-400",
                                                                    (status === 'in_progress' || status === 'none') && "bg-muted text-muted-foreground"
                                                                )}
                                                            >
                                                                {kpiStatusLabel(status)}
                                                            </span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }
                                    if (!isCollapsed) {
                                        return (
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 px-4 pt-2 pb-1">KPI Review (all)</div>
                                                <p className="text-xs text-sidebar-foreground/50 px-4 py-2">No KPIs yet</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                {!isCollapsed && (
                                    <div className={sectionTitleClass}>System Config</div>
                                )}
                                <div className={sectionWrapClass}>
                                    <button
                                        onClick={() => !isCollapsed && setSystemConfigOpen(!systemConfigOpen)}
                                        className={cn(
                                            menuBtnClass,
                                            "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                        )}
                                    >
                                        <Settings className={cn("flex-shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 text-left truncate">System Config</span>
                                                {systemConfigOpen ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </>
                                        )}
                                    </button>
                                    {!isCollapsed && systemConfigOpen && (
                                        <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border/30 pl-4">
                                            <Link href="/admin/hr-issues" className={cn(menuBtnClass, "py-2 text-xs", isActive('/admin/hr-issues') ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}><AlertCircle className="w-4 h-4" /><span>HR Issues</span></Link>
                                            <Link href="/admin/industries" className={cn(menuBtnClass, "py-2 text-xs", isActive('/admin/industries') ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}><Building2 className="w-4 h-4" /><span>Industries</span></Link>
                                            <Link href="/admin/subcategories" className={cn(menuBtnClass, "py-2 text-xs", isActive('/admin/subcategories') ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}><Layers className="w-4 h-4" /><span>Subcategories</span></Link>
                                            <button
                                                onClick={() => setTranslationsOpen((prev) => !prev)}
                                                className={cn(menuBtnClass, "py-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}
                                            >
                                                <Languages className="w-4 h-4" />
                                                <span className="flex-1 text-left truncate">Translations</span>
                                                {translationsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </button>
                                            {translationsOpen && (
                                                <div className="ml-2 mt-1 space-y-1 border-l border-sidebar-border/30 pl-3">
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
                                    )}
                                </div>
                            </>
                        )}

                        <Link
                            href="/settings"
                            className={cn(
                                `${menuBtnClass} mt-4`,
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
