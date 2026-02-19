import React, { useMemo, useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { HeroSectionKo } from '@/components/landing/HeroSectionKo';
import { CTASectionKo } from '@/components/landing/CTASectionKo';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';
import { CheckCircle2, Sparkles, Target, Users, TrendingUp, Shield, Zap, ArrowRight, Building2, BarChart3, Coins, UserCog } from 'lucide-react';
import { LanguageToggle } from '@/components/LanguageToggle';
import TranslationLoader from '@/components/TranslationLoader';
import { useTranslation } from 'react-i18next';

interface LandingPageSection {
    content: string;
    type: string;
    metadata?: any;
}

interface Props {
    canRegister?: boolean;
    sections?: {
        ko?: Record<string, LandingPageSection>;
        en?: Record<string, LandingPageSection>;
    } | Record<string, LandingPageSection>; // Support both old and new format
}

export default function LandingPage({ canRegister = true, sections = {} }: Props) {
    const { i18n } = useTranslation();
    const [currentLang, setCurrentLang] = useState(i18n.language || 'ko');

    // Listen for language changes
    useEffect(() => {
        const handleLanguageChange = (e: CustomEvent) => {
            setCurrentLang(e.detail.language);
        };
        
        const updateLang = () => {
            setCurrentLang(i18n.language || 'ko');
        };

        window.addEventListener('languageChanged', handleLanguageChange as EventListener);
        i18n.on('languageChanged', updateLang);

        return () => {
            window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
            i18n.off('languageChanged', updateLang);
        };
    }, [i18n]);

    // Memoize sections based on current language - this will recalculate when language changes
    const currentSections = useMemo(() => {
        // Check if sections is in new format (object with ko/en keys)
        if (sections && typeof sections === 'object' && ('ko' in sections || 'en' in sections)) {
            const langSections = sections[currentLang as 'ko' | 'en'] || sections['ko'] || {};
            return langSections as Record<string, LandingPageSection>;
        }
        // Old format: single object (assumed to be Korean)
        return sections as Record<string, LandingPageSection>;
    }, [sections, currentLang]);

    // Helper function to get section content with fallback
    const getSection = (key: string, fallback: string): string => {
        return currentSections[key]?.content || fallback;
    };

    // Helper function to parse JSON sections
    const getJsonSection = (key: string, fallback: any[]): any[] => {
        if (currentSections[key]?.content) {
            try {
                return JSON.parse(currentSections[key].content);
            } catch (e) {
                return fallback;
            }
        }
        return fallback;
    };

    // Default "Everything you need" section cards (4 cards)
    const defaultEverythingCards = [
        {
            icon: Building2,
            title: 'Organization Design',
            description: 'Structure your company with functional, team-based, divisional, or matrix organizations.',
        },
        {
            icon: Target,
            title: 'Performance System',
            description: 'Design KPI, MBO, OKR, or BSC-based performance evaluation frameworks.',
        },
        {
            icon: Coins,
            title: 'Compensation System',
            description: 'Build competitive pay structures with merit, incentives, and role-based differentiation.',
        },
        {
            icon: UserCog,
            title: 'CEO Philosophy',
            description: 'Align HR systems with leadership style through structured management philosophy surveys.',
        },
    ];

    // Default "Why HR Path-Finder?" checkmark items
    const defaultWhyItems = [
        'Sequential, consulting-grade workflow',
        'Rule-based recommendations (no AI guesswork)',
        'CEO and HR Manager collaboration',
        'Complete audit trail for all decisions',
        'Professional HR system dashboard',
        'Export-ready reports and policies',
    ];

    // Default feature cards (4 cards)
    const defaultFeatureCards = [
        {
            icon: Shield,
            title: 'Role-Based Access',
            description: 'CEO, HR Manager, and Consultant each have specific permissions and views.',
        },
        {
            icon: BarChart3,
            title: 'Visual Dashboard',
            description: 'See your entire HR system at a glance with professional visualizations.',
        },
        {
            icon: Target,
            title: 'Logical Validation',
            description: 'System blocks incompatible selections ensuring consistent HR design.',
        },
        {
            icon: Users,
            title: 'Collaborative Flow',
            description: 'CEO and HR Manager work together with clear handoffs and approvals.',
        },
    ];

    // Get "Everything you need" cards from database or use default
    const everythingCardsData = getJsonSection('everything_cards', defaultEverythingCards);
    const everythingCards = everythingCardsData.map((f: any, idx: number) => ({
        icon: [Building2, Target, Coins, UserCog][idx] || Building2,
        title: f.title || defaultEverythingCards[idx]?.title || '',
        description: f.description || defaultEverythingCards[idx]?.description || '',
    }));

    // Get "Why" items from database or use default
    const whyItemsData = getJsonSection('why_items', defaultWhyItems);
    const whyItems = whyItemsData.length > 0 ? whyItemsData : defaultWhyItems;

    // Get feature cards from database or use default
    const featureCardsData = getJsonSection('feature_cards', defaultFeatureCards);
    const featureCards = featureCardsData.map((f: any, idx: number) => ({
        icon: [Shield, BarChart3, Target, Users][idx] || Shield,
        title: f.title || defaultFeatureCards[idx]?.title || '',
        description: f.description || defaultFeatureCards[idx]?.description || '',
    }));


    return (
        <>
            <TranslationLoader />
            <Head title={getSection('page_title', currentLang === 'en' ? 'HR Copilot - Professional-Grade HR System Design Platform' : 'HR Copilot - 전문가급 HR 시스템 설계 플랫폼')} />
            <div className="min-h-screen bg-background" key={currentLang}>
                {/* Header Navigation */}
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-[#0a1629] text-white font-bold text-lg">
                                    HR
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-gray-900">{getSection('header_logo_text', 'HR Copilot')}</span>
                                    <span className="text-xs text-gray-600">{getSection('header_company_text', 'by BetterCompany')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <LanguageToggle />
                                <Link href={login()} className="text-sm font-medium text-gray-700 hover:text-[#0a1629]">
                                    {getSection('header_sign_in', '로그인')}
                                </Link>
                                <Button asChild className="bg-[#0a1629] hover:bg-[#0d1b35] text-white font-medium px-4 py-2 rounded-lg text-sm h-auto shadow-sm">
                                    <Link href={canRegister ? register() : login()}>
                                        {getSection('header_get_started', '시작하기')}
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="border-b bg-gradient-to-b from-background to-muted/20">
                    <HeroSectionKo 
                        canRegister={canRegister}
                        badge={getSection('hero_badge_text', '컨설팅급 HR 설계 플랫폼')}
                        title={getSection('hero_title', '정밀한 HR 시스템을 설계하세요.')}
                        description={getSection('hero_description', '중소기업의 HR 프레임워크 구축 방식을 혁신합니다. 단계별 가이드 접근 방식으로 전문 컨설팅 업무를 현대적인 SaaS 플랫폼 안에서 재현합니다.')}
                        primaryButton={getSection('hero_cta_primary', '무료 체험 시작하기')}
                        secondaryButton={getSection('hero_cta_secondary', '데모 보기')}
                        trustText={getSection('hero_trust_text', '100개 이상의 기업이 HR Copilot을 신뢰합니다')}
                        overviewTitle={getSection('overview_title', 'HR 시스템 개요')}
                        overviewProgress={getSection('overview_progress', '4/4 완료')}
                        overviewSteps={getJsonSection('overview_steps', [
                            { id: 1, name: '진단', completed: true },
                            { id: 2, name: '조직 설계', completed: true },
                            { id: 3, name: '성과 관리', completed: true },
                            { id: 4, name: '보상 체계', completed: true },
                        ])}
                        alignmentLabel={getSection('alignment_label', 'CEO 정렬도')}
                        alignmentScore={getSection('alignment_score', '높음')}
                        alignmentDescription={getSection('alignment_description', 'HR 시스템 설계가 CEO의 경영 철학과 잘 일치합니다')}
                    />
                </section>

                {/* Everything You Need Section */}
                <section className="border-b py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-bold">
                                {getSection('everything_title', 'Everything you need to build a complete HR system')}
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                {getSection('everything_description', 'Our platform guides you through each step with consulting-grade logic and rule-based recommendations.')}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {everythingCards.map((card, idx) => (
                                <FeatureCard
                                    key={idx}
                                    icon={card.icon}
                                    title={card.title}
                                    description={card.description}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why HR Path-Finder Section */}
                <section className="border-b bg-muted/30 py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="mb-4 text-3xl md:text-4xl font-bold text-center">
                                {getSection('why_title', 'Why HR Path-Finder?')}
                            </h2>
                            <p className="mb-8 text-lg text-muted-foreground text-center">
                                {getSection('why_description', 'We replicate the structured approach of professional HR consulting, making it accessible to companies without dedicated HR planning teams.')}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {whyItems.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="mt-0.5 size-5 flex-shrink-0 text-brand-green" />
                                        <span className="text-base">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Cards Section */}
                <section className="border-b py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {featureCards.map((card, idx) => (
                                <FeatureCard
                                    key={idx}
                                    icon={card.icon}
                                    title={card.title}
                                    description={card.description}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <CTASectionKo 
                    canRegister={canRegister}
                    title={getSection('cta_title', 'HR 시스템을 설계할 준비가 되셨나요?')}
                    description={getSection('cta_description', '오늘 무료 체험을 시작하고 프로토타입부터 전체 구현까지 확장 가능한 컨설팅급 HR 설계를 경험해보세요.')}
                    buttonText={getSection('cta_button', '무료로 시작하기')}
                />

                {/* Footer */}
                <footer className="border-t bg-background py-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="flex items-center gap-2 mb-4 md:mb-0">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-[#0a1629] text-white font-bold text-lg">
                                    HR
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-gray-900">{getSection('header_logo_text', 'HR Copilot')}</span>
                                    <span className="text-xs text-gray-600">{getSection('header_company_text', 'by BetterCompany')}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                {getSection('footer_copyright', '© 2025 BetterCompany. All rights reserved.')}
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
