import { Link, router, usePage, useForm } from '@inertiajs/react';
import {
    Settings,
    User,
    LogOut,
    ChevronDown,
    Bell,
    Repeat,
    Moon,
    Sun,
} from 'lucide-react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import { clearClientDraftCaches } from '@/lib/clientDraftCleanup';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

function getBreadcrumbKey(path: string): string {
    if (path.startsWith('/admin')) return 'admin_ui.header.breadcrumb.admin';
    if (path.startsWith('/ceo')) return 'admin_ui.header.breadcrumb.ceo';
    if (path === '/companies' || path.startsWith('/companies/') || path === '/hr-manager/companies' || path.startsWith('/hr-manager/companies/')) return 'admin_ui.header.breadcrumb.companies';
    if (path.startsWith('/hr-manager/dashboard') || path === '/dashboard') return 'admin_ui.header.breadcrumb.dashboard';
    if (path.startsWith('/hr-manager/diagnosis')) return 'admin_ui.header.breadcrumb.diagnosis';
    if (path.startsWith('/hr-manager/job-analysis')) return 'admin_ui.header.breadcrumb.job_analysis';
    if (path.startsWith('/hr-manager/performance-system')) return 'admin_ui.header.breadcrumb.performance_system';
    if (path.startsWith('/hr-manager/compensation-system')) return 'admin_ui.header.breadcrumb.compensation_system';
    if (path.startsWith('/hr-manager/hr-policy-os')) return 'admin_ui.header.breadcrumb.final_dashboard';
    if (path.startsWith('/hr-manager/tree')) return 'admin_ui.header.breadcrumb.final_dashboard';
    if (path.startsWith('/hr-manager/report')) return 'admin_ui.header.breadcrumb.report';
    if (path.startsWith('/ceo/hr-policy-os')) return 'admin_ui.header.breadcrumb.final_dashboard';
    if (path.startsWith('/ceo/tree')) return 'admin_ui.header.breadcrumb.final_dashboard';
    if (path.startsWith('/ceo/report')) return 'admin_ui.header.breadcrumb.report';
    if (path.startsWith('/admin/hr-policy-os')) return 'admin_ui.header.breadcrumb.final_dashboard';
    if (path.startsWith('/admin/tree')) return 'admin_ui.header.breadcrumb.final_dashboard';
    if (path.startsWith('/admin/report')) return 'admin_ui.header.breadcrumb.report';
    if (path.startsWith('/settings')) return 'admin_ui.header.breadcrumb.settings';
    return 'admin_ui.header.breadcrumb.dashboard';
}

export default function AppHeader() {
    const { t } = useTranslation();
    const page = usePage<any>();
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const { auth, activeRole, canSwitchToHr, notifications, appConfig } = page.props;
    const user = auth?.user;
    const appName = appConfig?.name || t('admin_ui.header.app_name');
    const notificationItems = Array.isArray(notifications?.items) ? notifications.items : [];
    const unreadCount = Number(notifications?.unread_count ?? 0);
    const path = (page as { url?: string }).url?.split('?')[0] ?? '';
    const breadcrumbLabel = t(getBreadcrumbKey(path));
    
    const switchForm = useForm({});
    
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    
    const handleSwitchToHr = () => {
        switchForm.post('/role/switch-to-hr', {
            onSuccess: () => {
                // Will redirect to HR dashboard
            },
        });
    };

return (
        <header className={cn(
            'sticky top-0 z-50 w-full flex-shrink-0 h-[var(--hr-topbar-h)] backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b bg-card/95 border-border dark:bg-card/95'
        )}>
            <div className="flex h-full items-center justify-between px-5 md:px-7 w-full">
                <div className="flex items-center gap-4 flex-wrap">
<SidebarTrigger className="flex size-9 rounded-lg -ml-1 hover:bg-accent/50" />
<div className="flex items-center gap-2 text-[12px] text-muted-foreground hidden sm:hidden">
                        <span>{appName}</span>
                        <span>&nbsp;/&nbsp;</span>
                        <strong className="font-semibold text-foreground">{breadcrumbLabel}</strong>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark')}
                        className="relative h-8 w-8 rounded-lg bg-muted hover:bg-muted/80"
                        aria-label="Toggle theme"
                        title="Toggle theme"
                    >
                        {resolvedAppearance === 'dark' ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                    </Button>
                    <LanguageToggle iconOnly />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative w-8 h-8 rounded-lg bg-muted hover:bg-muted/80">
                                <Bell className="h-4 w-4" />
                                {unreadCount > 0 && <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-primary" />}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-96 max-h-[70vh] overflow-auto">
                            <DropdownMenuLabel className="flex items-center justify-between flex-wrap">
                                <span>{t('admin_ui.header.notifications.title')}</span>
                                <span className="text-xs text-muted-foreground">{t('admin_ui.header.notifications.unread_count', { count: unreadCount })}</span>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {notificationItems.length === 0 ? (
                                <div className="px-3 py-6 text-sm text-muted-foreground text-center">{t('admin_ui.header.notifications.empty')}</div>
                            ) : (
                                notificationItems.map((item: any) => {
                                    const orgName = item?.data?.organization_name;
                                    const companyName = item?.data?.company_name;
                                    const hrProjectId = item?.data?.hr_project_id;
                                    const createdAt = item?.created_at ? new Date(item.created_at).toLocaleString() : '';
                                    const isCeoKpi = item?.type === 'CeoKpiReviewRequestedNotification';
                                    const href = isCeoKpi && hrProjectId ? `/ceo/kpi-review/${hrProjectId}` : undefined;
                                    return (
                                        <DropdownMenuItem key={item.id} asChild={!!href}>
                                            {href ? (
                                                <Link href={href} className="flex flex-col items-start gap-0.5 py-2 cursor-pointer">
                                                    <div className="text-xs font-semibold">
                                                        {isCeoKpi ? t('admin_ui.header.notifications.kpi_review_sent') : item?.type}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {companyName ? `${companyName}` : t('admin_ui.header.notifications.company_fallback')}{orgName ? ` - ${orgName}` : ''}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">{createdAt}</div>
                                                </Link>
                                            ) : (
                                                <div className="flex flex-col items-start gap-0.5 py-2">
                                                    <div className="text-xs font-semibold">{item?.type}</div>
                                                    <div className="text-[11px] text-muted-foreground">{createdAt}</div>
                                                </div>
                                            )}
                                        </DropdownMenuItem>
                                    );
                                })
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 h-auto py-1.5 pr-2.5 pl-1.5 rounded-xl border border-border bg-muted hover:bg-muted/80">
                                <div className="w-[30px] h-[30px] rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <span className="text-[11px] font-bold text-primary-foreground">
                                        {user?.name ? getInitials(user.name) : t('admin_ui.header.user.initial')}
                                    </span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-[12px] font-semibold leading-tight text-foreground">{user?.name || t('admin_ui.header.user.fallback_name')}</p>
                                    <p className="text-[10px] text-muted-foreground">{user?.email || ''}</p>
                                </div>
                                <ChevronDown className="h-4 w-4 hidden md:block text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                            align="end" 
                            className="w-56"
                        >
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{user?.name || t('admin_ui.header.user.fallback_name')}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings/index" className="flex items-center cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    {t('admin_ui.header.menu.settings')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings/profile" className="flex items-center cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    {t('admin_ui.header.menu.profile')}
                                </Link>
                            </DropdownMenuItem>
                            {canSwitchToHr && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                        onClick={handleSwitchToHr}
                                        disabled={switchForm.processing}
                                        className="cursor-pointer"
                                    >
                                        <Repeat className="mr-2 h-4 w-4" />
                                        {switchForm.processing ? t('admin_ui.header.menu.switching') : t('admin_ui.header.menu.switch_to_hr')}
                                    </DropdownMenuItem>
                                </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="flex w-full cursor-pointer items-center text-destructive focus:text-destructive"
                                    onClick={() => {
                                        clearClientDraftCaches();
                                        router.flushAll();
                                    }}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    {t('admin_ui.header.menu.logout')}
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
