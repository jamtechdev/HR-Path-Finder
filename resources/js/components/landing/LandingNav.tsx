import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { login, register, dashboard } from '@/routes';

interface LandingNavProps {
    isAuthenticated?: boolean;
    canRegister?: boolean;
    logoText?: string;
    navProcess?: string;
    navTrust?: string;
    navBenchmark?: string;
    ctaLabel?: string; // optional override (kept for compatibility)
    signInLabel?: string; // optional override (kept for compatibility)
    getStartedLabel?: string; // optional override (kept for compatibility)
    dashboardLabel?: string;
}

export function LandingNav({
    isAuthenticated = false,
    canRegister = true,
    logoText = 'HR Pathfinder',
    navProcess = '프로세스',
    navTrust = '전문가 검수',
    navBenchmark = '보상 벤치마크',
    ctaLabel = '',
    signInLabel = '',
    getStartedLabel = '',
    dashboardLabel = 'Dashboard',
}: LandingNavProps) {
    const { i18n } = useTranslation();
    const lang = i18n.language?.startsWith('en') ? 'en' : 'ko';

    const contactLabel = ctaLabel || (lang === 'ko' ? '문의하기 →' : 'Inquiry →');
    const startLabel = getStartedLabel || (lang === 'ko' ? '시작하기' : 'Get Started');
    const signInText = signInLabel || (lang === 'ko' ? '로그인' : 'Log in');
    const contactUsText = 'Contact Us';
    const externalInquiryHref = 'https://better.odw.co.kr';

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between h-16 px-6 md:px-12 bg-[#0B1E3D]/95 backdrop-blur-md border-b border-[#2ECFAB]/10">
            <a href="#" className="flex items-center gap-2.5 font-serif text-lg font-bold text-white no-underline">
                HR <span className="text-[#2ECFAB]">Pathfinder</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                    {isAuthenticated ? (
                        <Button asChild className="bg-[#2ECFAB] text-[#0B1E3D] hover:bg-[#7EE8D0] font-bold px-5 py-2.5 rounded-md text-sm h-auto transition-all">
                            <Link href={dashboard()}>
                                {dashboardLabel}
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>
                    ) : (
                        <>
                            <Link
                                href={canRegister ? register() : login()}
                                className="text-sm font-medium text-white/70 hover:text-[#2ECFAB] no-underline transition-colors"
                            >
                                {canRegister ? startLabel : signInText}
                            </Link>
                            <a
                                href={externalInquiryHref}
                                className="text-sm font-medium text-white/70 hover:text-[#2ECFAB] no-underline transition-colors"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {contactUsText}
                            </a>
                        </>
                    )}
                </div>
            </div>
            <div className="flex md:hidden items-center gap-2">
                <LanguageToggle />
                {isAuthenticated ? (
                    <Button asChild size="sm" className="bg-[#2ECFAB] text-[#0B1E3D] font-bold">
                        <Link href={dashboard()}>{dashboardLabel}</Link>
                    </Button>
                ) : (
                    <>
                        <a
                            href={externalInquiryHref}
                            className="text-xs font-semibold text-white/70 hover:text-[#2ECFAB] no-underline transition-colors"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {contactUsText}
                        </a>
                    </>
                )}
            </div>
        </nav>
    );
}
