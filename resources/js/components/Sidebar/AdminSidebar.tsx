import { Link, usePage } from '@inertiajs/react';
import { Settings, LayoutGrid, HelpCircle, FileText, Building2, AlertCircle, Database, Layers, Target, DollarSign, Languages, ChevronRight, ChevronDown, Users, Eye, Mail } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
    isCollapsed?: boolean;
}

export default function AdminSidebar({ isCollapsed = false }: AdminSidebarProps) {
    const { t } = useTranslation();
    const { url, props } = usePage();
    const currentPath = url.split('?')[0];
    const [clientOpsOpen, setClientOpsOpen] = useState(true);
    const [contentMgmtOpen, setContentMgmtOpen] = useState(true);
    const [systemConfigOpen, setSystemConfigOpen] = useState(true);
    const [translationsOpen, setTranslationsOpen] = useState(
        currentPath.startsWith('/admin/translations') || currentPath === '/admin/hr-translations',
    );

    const user = (props as any).auth?.user;
    const isAdmin = user?.roles?.some((role: { name: string }) => role.name === 'admin') || false;

    const appName = (props as any).appConfig?.name || t('admin_ui.sidebar.app_name');
    const appLogo = (props as any).appConfig?.logo || '/logo.svg';

    const translationPages = [
        { key: 'all', label: t('admin_ui.sidebar.menu.translations'), path: '/admin/translations?page=all' },
    ];

    const isActivePath = (path: string) => {
        if (path === '/admin/kpi-review') {
            return currentPath === '/admin/kpi-review' || currentPath.startsWith('/admin/kpi-review/');
        }
        if (path === '/admin/project-view') {
            return currentPath === '/admin/project-view' || currentPath === '/admin/project-tree';
        }
        if (path === '/admin/review') {
            return currentPath === '/admin/review' || currentPath.startsWith('/admin/review/');
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
        'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200';
    const sectionTitleClass =
        'text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 px-4 pt-2 pb-1';
    const sectionWrapClass = 'space-y-1';

    return (
        <div className="flex flex-col h-full w-full">
            <div
                className={cn(
                    'flex items-center border-b border-sidebar-border/30 gap-3 transition-all duration-200',
                    isCollapsed ? 'h-16 px-4 justify-center' : 'h-20 px-6',
                )}
            >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-sm transition-all duration-200 overflow-hidden">
                    <img src={appLogo} alt={appName} className="w-9 h-9 object-contain" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sidebar-foreground text-lg leading-none">{appName}</span>
                        <span className="text-xs text-sidebar-foreground/60 leading-none">{t('admin_ui.sidebar.by_bettercompany')}</span>
                    </div>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto">
                <div className={cn('transition-all duration-200', isCollapsed ? 'px-3 py-6' : 'px-6 py-8')}>
                    <div className={cn('transition-all duration-200', isCollapsed ? 'space-y-2' : 'space-y-2')}>
                        {isAdmin && (
                            <>
                                {!isCollapsed && <div className={sectionTitleClass}>{t('admin_ui.sidebar.sections.dashboard')}</div>}
                                <Link
                                    href="/admin/dashboard"
                                    className={cn(
                                        menuBtnClass,
                                        isActivePath('/admin/dashboard')
                                            ? 'bg-sidebar-accent text-sidebar-primary'
                                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                        isCollapsed && 'justify-center px-3',
                                    )}
                                >
                                    <LayoutGrid className={cn('flex-shrink-0', isCollapsed ? 'w-6 h-6' : 'w-5 h-5')} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">{t('admin_ui.sidebar.menu.dashboard')}</span>}
                                </Link>

                                <Link
                                    href="/admin/contact-us"
                                    className={cn(
                                        menuBtnClass,
                                        isActivePath('/admin/contact-us')
                                            ? 'bg-sidebar-accent text-sidebar-primary'
                                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                        isCollapsed && 'justify-center px-3',
                                    )}
                                >
                                    <Mail className={cn('flex-shrink-0', isCollapsed ? 'w-6 h-6' : 'w-5 h-5')} />
                                    {!isCollapsed && <span className="flex-1 text-left truncate">{t('admin_ui.sidebar.menu.contact_us')}</span>}
                                </Link>

                                {!isCollapsed && <div className={sectionTitleClass}>{t('admin_ui.sidebar.sections.client_ops')}</div>}
                                <div className={sectionWrapClass}>
                                    <button
                                        type="button"
                                        onClick={() => !isCollapsed && setClientOpsOpen((prev) => !prev)}
                                        className={cn(
                                            menuBtnClass,
                                            'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                        )}
                                    >
                                        <Database className={cn('flex-shrink-0', isCollapsed ? 'w-6 h-6' : 'w-5 h-5')} />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 text-left truncate">{t('admin_ui.sidebar.menu.client_ops')}</span>
                                                {clientOpsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </>
                                        )}
                                    </button>
                                    {!isCollapsed && clientOpsOpen && (
                                        <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border/30 pl-4">
                                            <Link
                                                href="/admin/ceo"
                                                className={cn(
                                                    menuBtnClass,
                                                    'py-2 text-xs',
                                                    isActivePath('/admin/ceo')
                                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                )}
                                            >
                                                <Users className="w-4 h-4" />
                                                <span className="truncate">{t('admin_ui.sidebar.menu.users_beta_access')}</span>
                                            </Link>
                                            <Link
                                                href="/admin/project-view"
                                                className={cn(
                                                    menuBtnClass,
                                                    'py-2 text-xs',
                                                    isActivePath('/admin/project-view')
                                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                )}
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span className="truncate">{t('admin_ui.sidebar.menu.all_projects')}</span>
                                            </Link>
                                            <Link
                                                href="/admin/hr-projects"
                                                className={cn(
                                                    menuBtnClass,
                                                    'py-2 text-xs',
                                                    isActivePath('/admin/hr-projects')
                                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                )}
                                            >
                                                <Building2 className="w-4 h-4" />
                                                <span className="truncate">{t('admin_ui.sidebar.menu.all_companies')}</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {!isCollapsed && <div className={sectionTitleClass}>{t('admin_ui.sidebar.sections.content_mgmt')}</div>}
                                <div className={sectionWrapClass}>
                                    <button
                                        type="button"
                                        onClick={() => !isCollapsed && setContentMgmtOpen((prev) => !prev)}
                                        className={cn(
                                            menuBtnClass,
                                            'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                            isCollapsed && 'justify-center px-3',
                                        )}
                                    >
                                        <FileText className={cn('flex-shrink-0', isCollapsed ? 'w-6 h-6' : 'w-5 h-5')} />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 text-left truncate">{t('admin_ui.sidebar.menu.content_mgmt')}</span>
                                                {contentMgmtOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </>
                                        )}
                                    </button>
                                    {!isCollapsed && contentMgmtOpen && (
                                        <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border/30 pl-4">
                                            <Link
                                                href="/admin/questions/ceo"
                                                className={cn(
                                                    menuBtnClass,
                                                    'py-2 text-xs',
                                                    isActivePath('/admin/questions/ceo')
                                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                )}
                                            >
                                                <HelpCircle className="w-4 h-4" />
                                                <span>{t('admin_ui.sidebar.menu.ceo_questions')}</span>
                                            </Link>
                                            <Link
                                                href="/admin/policy-snapshot"
                                                className={cn(
                                                    menuBtnClass,
                                                    'py-2 text-xs',
                                                    isActivePath('/admin/policy-snapshot')
                                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                )}
                                            >
                                                <FileText className="w-4 h-4" />
                                                <span>{t('admin_ui.sidebar.menu.policy_snapshot')}</span>
                                            </Link>
                                            <Link
                                                href="/admin/performance-snapshot"
                                                className={cn(
                                                    menuBtnClass,
                                                    'py-2 text-xs',
                                                    isActivePath('/admin/performance-snapshot')
                                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                )}
                                            >
                                                <Target className="w-4 h-4" />
                                                <span>{t('admin_ui.sidebar.menu.performance_snapshot')}</span>
                                            </Link>
                                            <Link
                                                href="/admin/compensation-snapshot"
                                                className={cn(
                                                    menuBtnClass,
                                                    'py-2 text-xs',
                                                    isActivePath('/admin/compensation-snapshot')
                                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                )}
                                            >
                                                <DollarSign className="w-4 h-4" />
                                                <span>{t('admin_ui.sidebar.menu.compensation_snapshot')}</span>
                                            </Link>
                                            <Link
                                                href="/admin/kpi-templates"
                                                className={cn(
                                                    menuBtnClass,
                                                    'py-2 text-xs',
                                                    isActivePath('/admin/kpi-templates')
                                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                )}
                                            >
                                                <Target className="w-4 h-4" />
                                                <span>{t('admin_ui.sidebar.menu.kpi_templates')}</span>
                                            </Link>
                                            <Link
                                                href="/admin/kpi-review"
                                                className={cn(
                                                    menuBtnClass,
                                                    'py-2 text-xs',
                                                    isActivePath('/admin/kpi-review')
                                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                )}
                                            >
                                                <Target className="w-4 h-4" />
                                                <span>{t('admin_ui.sidebar.menu.kpi_review')}</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {!isCollapsed && <div className={sectionTitleClass}>{t('admin_ui.sidebar.sections.system_config')}</div>}
                                <div className={sectionWrapClass}>
                                    <button
                                        type="button"
                                        onClick={() => !isCollapsed && setSystemConfigOpen(!systemConfigOpen)}
                                        className={cn(
                                            menuBtnClass,
                                            'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                            isCollapsed && 'justify-center px-3',
                                        )}
                                    >
                                        <Settings className={cn('flex-shrink-0', isCollapsed ? 'w-6 h-6' : 'w-5 h-5')} />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 text-left truncate">{t('admin_ui.sidebar.menu.system_config')}</span>
                                                {systemConfigOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </>
                                        )}
                                    </button>
                                    {!isCollapsed && systemConfigOpen && (
                                        <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border/30 pl-4">
                                            <Link
                                                href="/admin/industries"
                                                className={cn(
                                                    menuBtnClass,
                                                    'py-2 text-xs',
                                                    isActivePath('/admin/industries')
                                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                )}
                                            >
                                                <Building2 className="w-4 h-4" />
                                                <span>{t('admin_ui.sidebar.menu.industries')}</span>
                                            </Link>
                                            <Link
                                                href="/admin/subcategories"
                                                className={cn(
                                                    menuBtnClass,
                                                    'py-2 text-xs',
                                                    isActivePath('/admin/subcategories')
                                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                )}
                                            >
                                                <Layers className="w-4 h-4" />
                                                <span>{t('admin_ui.sidebar.menu.subcategories')}</span>
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => setTranslationsOpen((prev) => !prev)}
                                                className={cn(
                                                    menuBtnClass,
                                                    'py-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                )}
                                            >
                                                <Languages className="w-4 h-4" />
                                                <span className="flex-1 text-left truncate">{t('admin_ui.sidebar.menu.translations')}</span>
                                                {translationsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                            </button>
                                            {translationsOpen && (
                                                <div className="ml-2 mt-1 space-y-1 border-l border-sidebar-border/30 pl-3">
                                                    {translationPages.map((page) => {
                                                        const translationLinkActive =
                                                            currentPath === page.path.split('?')[0] &&
                                                            (page.key === 'all' || url.includes(`page=${page.key}`));

                                                        return (
                                                            <Link
                                                                key={page.key}
                                                                href={page.path}
                                                                className={cn(
                                                                    'w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-all duration-200',
                                                                    translationLinkActive
                                                                        ? 'bg-sidebar-accent/50 text-sidebar-primary font-medium'
                                                                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground',
                                                                )}
                                                            >
                                                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                                                                <span className="truncate">{page.label}</span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            <Link
                                                href="/settings"
                                                className={cn(
                                                    menuBtnClass,
                                                    'py-2 text-xs',
                                                    isActivePath('/settings')
                                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                )}
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span className="truncate">{t('admin_ui.sidebar.menu.app_account_settings')}</span>
                                            </Link>
                                            <Link
                                                href="/admin/hr-issues"
                                                className={cn(
                                                    menuBtnClass,
                                                    'py-2 text-xs',
                                                    isActivePath('/admin/hr-issues')
                                                        ? 'bg-sidebar-accent text-sidebar-primary'
                                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                                )}
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{t('admin_ui.sidebar.menu.hr_issues')}</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <Link
                            href="/settings"
                            className={cn(
                                `${menuBtnClass} mt-4`,
                                isActivePath('/settings')
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                isCollapsed && 'justify-center px-3',
                            )}
                        >
                            <Settings className={cn('flex-shrink-0', isCollapsed ? 'w-6 h-6' : 'w-5 h-5')} />
                            {!isCollapsed && <span className="flex-1 text-left truncate">{t('admin_ui.sidebar.menu.app_account')}</span>}
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    );
}
