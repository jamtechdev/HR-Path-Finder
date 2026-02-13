import { Link, router, usePage } from '@inertiajs/react';
import {
    Settings,
    User,
    LogOut,
    ChevronDown,
    Bell,
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

export default function AppHeader() {
    const { auth } = usePage<any>().props;
    const user = auth?.user;
    
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

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                {/* Left Side - Sidebar Toggle & Logo/Branding */}
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="md:flex hidden size-9 h-7 w-7 -ml-1" />
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-sm">HR</span>
                        </div>
                        <div className="hidden sm:block">
                            <span className="font-display font-semibold text-foreground">HR Path-Finder</span>
                            <span className="text-muted-foreground text-xs ml-2">by BetterCompany</span>
                        </div>
                    </Link>
                </div>

                {/* Right Side - User Profile & Actions */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                    </Button>

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 h-auto py-2 px-3 hover:bg-muted">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-primary font-semibold text-sm">
                                        {user?.name ? getInitials(user.name) : 'U'}
                                    </span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium hover:text-black">{user?.name || 'User'}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                                </div>
                                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                            align="end" 
                            className="w-56 bg-primary text-white border-primary/20 shadow-lg [&>*]:text-white"
                        >
                            <DropdownMenuLabel className="text-white">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                                    <p className="text-xs text-white/80">{user?.email || ''}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/20" />
                            <DropdownMenuItem 
                                asChild 
                                className="text-white focus:bg-primary/80 focus:text-white data-[highlighted]:bg-primary/80 data-[highlighted]:text-white [&_svg]:text-white"
                            >
                                <Link href="/settings/index" className="flex items-center cursor-pointer text-white">
                                    <Settings className="mr-2 h-4 w-4 text-white" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                asChild 
                                className="text-white focus:bg-primary/80 focus:text-white data-[highlighted]:bg-primary/80 data-[highlighted]:text-white [&_svg]:text-white"
                            >
                                <Link href="/settings/profile" className="flex items-center cursor-pointer text-white">
                                    <User className="mr-2 h-4 w-4 text-white" />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/20" />
                            <DropdownMenuItem 
                                onClick={handleLogout} 
                                className="text-white focus:bg-primary/80 focus:text-white data-[highlighted]:bg-primary/80 data-[highlighted]:text-white cursor-pointer [&_svg]:text-white"
                            >
                                <LogOut className="mr-2 h-4 w-4 text-white" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
