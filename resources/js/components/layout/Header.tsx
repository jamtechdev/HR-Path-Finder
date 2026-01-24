import { Button } from '@/components/ui/button';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, ChevronDown, Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

interface HeaderProps {
    canRegister?: boolean;
}

export function Header({ canRegister = true }: HeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const { appearance, updateAppearance } = useAppearance();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Resources', href: '#resources' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 dark:bg-[hsl(var(--background))]/95 backdrop-blur-md border-b border-border transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center transition-transform group-hover:scale-105">
                        <span className="text-white font-bold text-sm">HR</span>
                    </div>
                    <div>
                        <span className="font-display font-bold text-foreground">HR Path-Finder</span>
                        <span className="text-muted-foreground text-xs ml-2">by BetterCompany</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    {/* Dark Mode Toggle */}
                    {mounted && (
                        <button
                            onClick={() => updateAppearance(appearance === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-lg hover:bg-muted transition-colors hidden md:flex"
                            aria-label="Toggle theme"
                        >
                            {appearance === 'dark' ? (
                                <Sun className="size-5" />
                            ) : (
                                <Moon className="size-5" />
                            )}
                        </button>
                    )}

                    {/* Auth Buttons */}
                    {auth.user ? (
                        <Button asChild variant="ghost" className="hidden md:flex h-10 px-4">
                            <Link href={dashboard()}>Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild variant="ghost" className="hidden md:flex h-10 px-4">
                                <Link href={login()}>Sign in</Link>
                            </Button>
                            {canRegister && (
                                <Button asChild className="h-10 px-4">
                                    <Link href={register()}>
                                        Get Started
                                        <ArrowRight className="ml-2 size-4" />
                                    </Link>
                                </Button>
                            )}
                        </>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background">
                    <div className="px-6 py-4 space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-border space-y-2">
                            {auth.user ? (
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href={login()}>Sign in</Link>
                                    </Button>
                                    {canRegister && (
                                        <Button asChild className="w-full">
                                            <Link href={register()}>
                                                Get Started
                                                <ArrowRight className="ml-2 size-4" />
                                            </Link>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
