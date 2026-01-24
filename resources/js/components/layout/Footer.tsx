import { Link } from '@inertiajs/react';
import { ArrowRight, Building2, FileText, HelpCircle, Mail, Phone, Shield, Target, Users, Wallet } from 'lucide-react';
import { dashboard, login, register } from '@/routes';

interface FooterProps {
    canRegister?: boolean;
}

export function Footer({ canRegister = true }: FooterProps) {
    const productLinks = [
        { name: 'Organization Design', href: '#', icon: Building2 },
        { name: 'Performance System', href: '#', icon: Target },
        { name: 'Compensation System', href: '#', icon: Wallet },
        { name: 'CEO Philosophy', href: '#', icon: Users },
    ];

    const resources = [
        { name: 'Documentation', href: '#' },
        { name: 'API Reference', href: '#' },
        { name: 'Case Studies', href: '#' },
        { name: 'Best Practices', href: '#' },
    ];

    const company = [
        { name: 'About Us', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Contact', href: '#' },
    ];

    const legal = [
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
        { name: 'Cookie Policy', href: '#' },
        { name: 'Security', href: '#' },
    ];

    return (
        <footer className="border-t border-border bg-background">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                                <span className="text-white font-bold text-sm">HR</span>
                            </div>
                            <div>
                                <span className="font-display font-bold text-lg">HR Path-Finder</span>
                                <p className="text-xs text-muted-foreground">by BetterCompany</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Transform how SMBs build HR frameworks. Our step-by-step guided approach
                            replicates professional consulting engagements inside a modern SaaS platform.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <a
                                href="mailto:contact@hrpathfinder.com"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Mail className="size-4" />
                                <span>Contact Us</span>
                            </a>
                            <a
                                href="tel:+1234567890"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Phone className="size-4" />
                                <span>Support</span>
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="font-semibold text-sm mb-4">Product</h3>
                        <ul className="space-y-3">
                            {productLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                                    >
                                        <link.icon className="size-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <span>{link.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold text-sm mb-4">Resources</h3>
                        <ul className="space-y-3">
                            {resources.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                                    >
                                        <FileText className="size-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <span>{link.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company & Legal */}
                    <div>
                        <h3 className="font-semibold text-sm mb-4">Company</h3>
                        <ul className="space-y-3 mb-6">
                            {company.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <h3 className="font-semibold text-sm mb-4">Legal</h3>
                        <ul className="space-y-3">
                            {legal.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                                    >
                                        <Shield className="size-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <span>{link.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="mt-12 pt-8 border-t border-border">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">Stay Updated</h3>
                            <p className="text-sm text-muted-foreground">
                                Get the latest HR design insights and platform updates delivered to your inbox.
                            </p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 md:flex-none md:w-64 px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            />
                            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2">
                                Subscribe
                                <ArrowRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border bg-muted/30">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span>© 2025 BetterCompany. All rights reserved.</span>
                            <span className="hidden md:inline">•</span>
                            <span className="hidden md:inline">Made with ❤️ for HR professionals</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href={canRegister ? register() : login()}
                                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                            >
                                Get Started
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
