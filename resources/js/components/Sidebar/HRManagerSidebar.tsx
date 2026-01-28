import { Link, usePage } from '@inertiajs/react';
import { ClipboardCheck, Building2, Target, Wallet, FileText } from 'lucide-react';
import UserDropdown from './UserDropdown';

interface User {
    id: number;
    name: string;
    email: string;
    roles?: Array<{ name: string }>;
}

interface PageProps extends Record<string, unknown> {
    auth: {
        user: User | null;
    };
}

export default function HRManagerSidebar() {
    const { url, props } = usePage<PageProps>();
    const currentPath = url.split('?')[0];
    const user = props.auth?.user;

    const isActive = (path: string) => {
        if (path === '/') {
            return currentPath === '/';
        }
        return currentPath === path || currentPath.startsWith(`${path}/`);
    };


    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <aside className="hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 w-64">
            <div className="flex flex-col h-full">
                <div className="flex items-center h-16 px-4 border-b border-sidebar-border gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">HR</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-display font-semibold text-sidebar-foreground text-sm">HR Path-Finder</span>
                        <span className="text-[10px] text-sidebar-foreground/60">by BetterCompany</span>
                    </div>
                </div>
                
                <nav className="flex-1 py-4 px-2 overflow-y-auto">
                    <div className="space-y-1">
                        <Link
                            href="/hr-manager/dashboard"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive('/hr-manager/dashboard')
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            }`}
                        >
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect width="7" height="9" x="3" y="3" rx="1"/>
                                <rect width="7" height="5" x="14" y="3" rx="1"/>
                                <rect width="7" height="9" x="14" y="12" rx="1"/>
                                <rect width="7" height="5" x="3" y="16" rx="1"/>
                            </svg>
                            <span className="flex-1 text-left truncate">Dashboard</span>
                        </Link>
                        
                        <Link
                            href="/diagnosis"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive('/diagnosis')
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            }`}
                        >
                            <ClipboardCheck className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">Step 1: Diagnosis</span>
                        </Link>
                        
                        <Link
                            href="/step2"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive('/step2')
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            }`}
                        >
                            <Building2 className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">Step 2: Organization</span>
                        </Link>
                        
                        <Link
                            href="/step3"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive('/step3')
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            }`}
                        >
                            <Target className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">Step 3: Performance</span>
                        </Link>
                        
                        <Link
                            href="/step4"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive('/step4')
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            }`}
                        >
                            <Wallet className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">Step 4: Compensation</span>
                        </Link>
                        
                        <Link
                            href="/hr-system-output"
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive('/hr-system-output')
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            }`}
                        >
                            <FileText className="w-5 h-5 flex-shrink-0" />
                            <span className="flex-1 text-left truncate">HR System Output</span>
                        </Link>
                    </div>
                </nav>
                
                <div className="p-3 border-t border-sidebar-border">
                    <UserDropdown user={user} getInitials={getInitials} />
                </div>
            </div>
        </aside>
    );
}