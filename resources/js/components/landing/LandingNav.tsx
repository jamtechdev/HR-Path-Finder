import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { login, dashboard } from '@/routes';

interface LandingNavProps {
    isAuthenticated?: boolean;
    canRegister?: boolean;
    logoText?: string;
    navProcess?: string;
    navTrust?: string;
    navBenchmark?: string;
    ctaLabel?: string;
    signInLabel?: string;
    getStartedLabel?: string;
    dashboardLabel?: string;
}

export function LandingNav({
    isAuthenticated = false,
    canRegister = true,
    logoText = 'HR Pathfinder',
    navProcess = '프로세스',
    navTrust = '전문가 검수',
    navBenchmark = '보상 벤치마크',
    ctaLabel = '서비스 문의하기',
    signInLabel = '로그인',
    getStartedLabel = '시작하기',
    dashboardLabel = 'Dashboard',
}: LandingNavProps) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between h-16 px-6 md:px-12 bg-[#0B1E3D]/95 backdrop-blur-md border-b border-[#2ECFAB]/10">
            <a href="#" className="flex items-center gap-2.5 font-serif text-lg font-bold text-white no-underline">
                HR <span className="text-[#2ECFAB]">Pathfinder</span>
            </a>
            <div className="hidden md:flex items-center gap-8">
                <a href="#process" className="text-sm font-medium text-white/70 hover:text-[#2ECFAB] no-underline transition-colors">
                    {navProcess}
                </a>
                <a href="#trust" className="text-sm font-medium text-white/70 hover:text-[#2ECFAB] no-underline transition-colors">
                    {navTrust}
                </a>
                <a href="#benchmark" className="text-sm font-medium text-white/70 hover:text-[#2ECFAB] no-underline transition-colors">
                    {navBenchmark}
                </a>
                <Link href="/contact" className="text-sm font-medium text-white/70 hover:text-[#2ECFAB] no-underline transition-colors">
                    Contact Us
                </Link>
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
                            <Link href={login()} className="text-sm font-medium text-white/70 hover:text-[#2ECFAB] no-underline">
                                {signInLabel}
                            </Link>
                            <Button asChild className="bg-[#2ECFAB] text-[#0B1E3D] hover:bg-[#7EE8D0] font-bold px-5 py-2.5 rounded-md text-sm h-auto transition-all hover:-translate-y-0.5">
                                <Link href="/contact">
                                    {ctaLabel}
                                </Link>
                            </Button>
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
                    <Button asChild size="sm" className="bg-[#2ECFAB] text-[#0B1E3D] font-bold">
                        <Link href="/contact">{ctaLabel}</Link>
                    </Button>
                )}
            </div>
        </nav>
    );
}
