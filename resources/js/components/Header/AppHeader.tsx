import { Link, router, usePage, useForm } from '@inertiajs/react';
import {
    Settings,
    User,
    LogOut,
    ChevronDown,
    Bell,
    Repeat,
} from 'lucide-react';
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
import { LanguageToggle } from '@/components/LanguageToggle';

function getBreadcrumbLabel(path: string): string {
    if (path.startsWith('/admin')) return 'Admin';
    if (path.startsWith('/ceo')) return 'CEO';
    if (path === '/companies' || path.startsWith('/companies/') || path === '/hr-manager/companies' || path.startsWith('/hr-manager/companies/')) return 'Companies';
    if (path.startsWith('/hr-manager/dashboard') || path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/hr-manager/diagnosis')) return 'Diagnosis';
    if (path.startsWith('/hr-manager/job-analysis')) return 'Job Analysis';
    if (path.startsWith('/hr-manager/performance-system')) return 'Performance System';
    if (path.startsWith('/hr-manager/compensation-system')) return 'Compensation System';
    if (path.startsWith('/hr-manager/hr-policy-os')) return 'HR Policy OS';
    if (path.startsWith('/hr-manager/tree')) return 'Tree';
    if (path.startsWith('/hr-manager/report')) return 'Report';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
}

export default function AppHeader() {
    const page = usePage<any>();
    const { auth, activeRole, canSwitchToHr } = page.props;
    const user = auth?.user;
    const path = (page as { url?: string }).url?.split('?')[0] ?? '';
    const breadcrumbLabel = getBreadcrumbLabel(path);
    
    const switchForm = useForm({});
    
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    
    const handleLogout = () => {
        router.post('/logout');
    };
    
    const handleSwitchToHr = () => {
        switchForm.post('/role/switch-to-hr', {
            onSuccess: () => {
                // Will redirect to HR dashboard
            },
        });
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[var(--hr-gray-200)] bg-white flex-shrink-0 h-[var(--hr-topbar-h)]">
            <div className="flex h-full items-center justify-between px-7 w-full">
                {/* Left Side - Sidebar Toggle & Breadcrumb (match reference) */}
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="md:flex hidden size-9 w-7 h-7 -ml-1" />
                    <div className="flex items-center gap-2 text-[12px] text-[var(--hr-gray-400)]">
                        <span>HR Path-Finder</span>
                        <span>&nbsp;/&nbsp;</span>
                        <strong className="text-[var(--hr-gray-800)] font-semibold">{breadcrumbLabel}</strong>
                    </div>
                </div>

                {/* Right Side - Language, Bell, User (match reference: gap-4, bell 32x32 gray-100, avatar navy + mint) */}
                <div className="flex items-center gap-4">
                    <LanguageToggle iconOnly />
                    <Button variant="ghost" size="icon" className="relative w-8 h-8 rounded-lg bg-[var(--hr-gray-100)] hover:bg-[var(--hr-gray-200)]">
                        <Bell className="h-4 w-4 text-[var(--hr-gray-800)]" />
                        <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[var(--hr-mint)]" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 h-auto py-1 pr-2.5 pl-1 hover:bg-[var(--hr-gray-100)] rounded-lg">
                                <div className="w-[30px] h-[30px] rounded-lg bg-[var(--hr-navy)] flex items-center justify-center flex-shrink-0">
                                    <span className="text-[11px] font-bold text-[var(--hr-mint)]">
                                        {user?.name ? getInitials(user.name) : 'U'}
                                    </span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-[12px] font-semibold text-[var(--hr-gray-800)] leading-tight">{user?.name || 'User'}</p>
                                    <p className="text-[10px] text-[var(--hr-gray-400)]">{user?.email || ''}</p>
                                </div>
                                <ChevronDown className="h-4 w-4 text-[var(--hr-gray-400)] hidden md:block" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                            align="end" 
                            className="w-56"
                        >
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings/index" className="flex items-center cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings/profile" className="flex items-center cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
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
                                        {switchForm.processing ? 'Switching...' : 'Switch to HR Manager'}
                                    </DropdownMenuItem>
                                </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onClick={handleLogout} 
                                className="cursor-pointer"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
