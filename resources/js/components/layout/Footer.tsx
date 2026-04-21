import { Link } from '@inertiajs/react';
import { ArrowRight, Building2, FileText, HelpCircle, Mail, Phone, Shield, Target, Users, Wallet } from 'lucide-react';
import { dashboard, login } from '@/routes';
import { useTranslation } from 'react-i18next';

interface FooterProps {
    canRegister?: boolean;
}

export function Footer({ canRegister = true }: FooterProps) {
    const { t } = useTranslation();
    const productLinks = [
        { name: t('site_footer.product.organization_design', 'Organization Design'), href: '#', icon: Building2 },
        { name: t('site_footer.product.performance_system', 'Performance System'), href: '#', icon: Target },
        { name: t('site_footer.product.compensation_system', 'Compensation System'), href: '#', icon: Wallet },
        { name: t('site_footer.product.ceo_philosophy', 'CEO Philosophy'), href: '#', icon: Users },
    ];

    const resources = [
        { name: t('site_footer.resources.documentation', 'Documentation'), href: '#' },
        { name: t('site_footer.resources.api_reference', 'API Reference'), href: '#' },
        { name: t('site_footer.resources.case_studies', 'Case Studies'), href: '#' },
        { name: t('site_footer.resources.best_practices', 'Best Practices'), href: '#' },
    ];

    const company = [
        { name: t('site_footer.company.about_us', 'About Us'), href: '#' },
        { name: t('site_footer.company.careers', 'Careers'), href: '#' },
        { name: t('site_footer.company.blog', 'Blog'), href: '#' },
        { name: t('site_footer.company.contact', 'Contact'), href: '#' },
    ];

    const legal = [
        { name: t('site_footer.legal.privacy_policy', 'Privacy Policy'), href: '#' },
        { name: t('site_footer.legal.terms_of_service', 'Terms of Service'), href: '#' },
        { name: t('site_footer.legal.cookie_policy', 'Cookie Policy'), href: '#' },
        { name: t('site_footer.legal.security', 'Security'), href: '#' },
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
                                <span className="font-display font-bold text-lg">{t('auth.brand_title_hyphen', 'HR Path-Finder')}</span>
                                <p className="text-xs text-muted-foreground">{t('auth.brand_by', 'by BetterCompany')}</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            {t('site_footer.brand_description', 'Transform how SMBs build HR frameworks. Our step-by-step guided approach replicates professional consulting engagements inside a modern SaaS platform.')}
                        </p>
                        <div className="flex items-center gap-4 flex-wrap pt-2">
                            <a
                                href="mailto:contact@hrpathfinder.com"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Mail className="size-4" />
                                <span>{t('site_footer.contact_us', 'Contact Us')}</span>
                            </a>
                            <a
                                href="tel:+1234567890"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Phone className="size-4" />
                                <span>{t('site_footer.support', 'Support')}</span>
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="font-semibold text-sm mb-4">{t('site_footer.section_product', 'Product')}</h3>
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
                        <h3 className="font-semibold text-sm mb-4">{t('site_footer.section_resources', 'Resources')}</h3>
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
                        <h3 className="font-semibold text-sm mb-4">{t('site_footer.section_company', 'Company')}</h3>
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
                        <h3 className="font-semibold text-sm mb-4">{t('site_footer.section_legal', 'Legal')}</h3>
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
                            <h3 className="font-semibold text-lg mb-2">{t('site_footer.newsletter_title', 'Stay Updated')}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t('site_footer.newsletter_desc', 'Get the latest HR design insights and platform updates delivered to your inbox.')}
                            </p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <input
                                type="email"
                                placeholder={t('site_footer.newsletter_placeholder', 'Enter your email')}
                                className="flex-1 md:flex-none w-full md:w-64 px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            />
                            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2">
                                {t('site_footer.newsletter_subscribe', 'Subscribe')}
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
                            <span>{t('site_footer.copyright', '© 2025 BetterCompany. All rights reserved.')}</span>
                            <span className="hidden md:inline">•</span>
                            <span className="hidden md:inline">{t('site_footer.made_for', 'Made with ❤️ for HR professionals')}</span>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <Link
                                href={login()}
                                className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                            >
                                {t('landing.header.get_started', 'Get Started')}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
