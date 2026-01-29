import { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { Badge } from '@/components/ui/badge';

interface UserDropdownProps {
    user: {
        id: number;
        name: string;
        email: string;
        roles?: Array<{ name: string }>;
    } | null;
    getInitials: (name: string) => string;
}

export default function UserDropdown({ user, getInitials }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const roleName = user?.roles?.[0]?.name || '';
    const roleLabel = roleName === 'ceo' ? 'CEO' : 
                     roleName === 'hr_manager' ? 'HR Manager' : 
                     roleName === 'consultant' ? 'Consultant' : 
                     'User';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-200"
            >
                <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                        {user ? getInitials(user.name) : 'U'}
                    </span>
                </span>
                <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                        {user?.email || 'user@company.com'}
                    </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-sidebar-foreground/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden">
                    {/* User Info Section */}
                    <div className="p-4 border-b border-border">
                        <p className="font-semibold text-sm text-foreground">{user?.name || 'User'}</p>
                        <Badge className="mt-1 bg-primary text-primary-foreground text-xs">
                            {roleLabel}
                        </Badge>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <Link
                            href={edit().url}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                        </Link>
                        <Link
                            href={edit().url}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                        </Link>
                        <div className="border-t border-border my-1" />
                        <Link
                            href={logout().url}
                            method="post"
                            as="button"
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Log out</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
