import { Link, usePage } from '@inertiajs/react';
import { CheckCircle, FileText, Menu } from 'lucide-react';
import { useState } from 'react';
import UserDropdown from './UserDropdown';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

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

export default function CEOSidebar() {
    const { url, props } = usePage<PageProps>();
    const currentPath = url.split('?')[0];
    const user = props.auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    const SidebarContent = () => (
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
                        href="/ceo/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive('/ceo/dashboard')
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
                        href="/ceo/philosophy-survey"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive('/ceo/philosophy-survey')
                                ? 'bg-sidebar-accent text-sidebar-primary'
                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        }`}
                    >
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">Philosophy Survey</span>
                    </Link>
                    
                    <Link 
                        href="/hr-system-output"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive('/hr-system-output')
                                ? 'bg-sidebar-accent text-sidebar-primary'
                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        }`}
                    >
                        <FileText className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">HR System Review</span>
                    </Link>
                </div>
            </nav>
            
            <div className="p-3 border-t border-sidebar-border">
                <UserDropdown user={user} getInitials={getInitials} />
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-14 flex items-center px-4 shadow-sm">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="md:hidden h-10 w-10 hover:bg-muted"
                            aria-label="Toggle menu"
                        >
                            <Menu className="h-6 w-6 text-foreground" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent 
                        side="left" 
                        className="w-64 p-0 bg-sidebar border-r border-sidebar-border overflow-hidden"
                    >
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
                <div className="ml-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                        <span className="text-white font-bold text-xs">HR</span>
                    </div>
                    <span className="font-display font-semibold text-sm">HR Path-Finder</span>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 w-64">
                <SidebarContent />
            </aside>
        </>
    );
}