import { Link, usePage } from '@inertiajs/react';
import { FileText, Clock, CheckCircle, Star } from 'lucide-react';

interface ConsultantSidebarProps {
    isCollapsed?: boolean;
}

export default function ConsultantSidebar({ isCollapsed = false }: ConsultantSidebarProps) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    const isActive = (path: string) => {
        if (path === '/') {
            return currentPath === '/';
        }
        // Special handling for dashboard - check both /dashboard and /dashboard/consultant
        if (path === '/dashboard') {
            return currentPath === '/dashboard' || currentPath === '/dashboard/consultant' || currentPath.startsWith('/dashboard/consultant/');
        }
        return currentPath === path || currentPath.startsWith(`${path}/`);
    };

    return (
        <div className="flex flex-col h-full w-full">
            <div className={`flex items-center h-16 px-4 border-b border-sidebar-border gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">HR</span>
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="font-display font-semibold text-sidebar-foreground text-sm">HR Path-Finder</span>
                        <span className="text-[10px] text-sidebar-foreground/60">by BetterCompany</span>
                    </div>
                )}
            </div>
            
            <nav className="flex-1 py-4 px-2 overflow-y-auto">
                <div className="space-y-1">
                    <Link 
                        href="/dashboard" 
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive('/dashboard')
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
                            {!isCollapsed && <span className="flex-1 text-left truncate">Dashboard</span>}
                        </Link>
                        
                        <Link 
                            href="/dashboard/consultant/reviews" 
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive('/dashboard/consultant/reviews')
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            }`}
                        >
                            <Clock className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="flex-1 text-left truncate">Pending Reviews</span>}
                        </Link>
                        
                        <Link 
                            href="/consultant-reviews" 
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive('/consultant-reviews')
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            }`}
                        >
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="flex-1 text-left truncate">Completed Reviews</span>}
                        </Link>
                        
                        <Link 
                            href="/review-templates" 
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive('/review-templates')
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            }`}
                        >
                            <Star className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="flex-1 text-left truncate">Review Templates</span>}
                        </Link>
                        
                        <Link 
                            href="/reports" 
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive('/reports')
                                    ? 'bg-sidebar-accent text-sidebar-primary'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            }`}
                        >
                            <FileText className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="flex-1 text-left truncate">Reports</span>}
                        </Link>
                    </div>
                </nav>
        </div>
    );
}