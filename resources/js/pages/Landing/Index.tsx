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
}

export default function LandingPage({ canRegister = true }: Props) {
    const { t, i18n } = useTranslation();
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

    // Helper function to get translation with fallback
    const getTranslation = (key: string, fallback: string): string => {
        const translation = t(`landing.${key}`, { defaultValue: fallback });
        return translation || fallback;
    };


    // Default "Everything you need" section cards (4 cards)
    const defaultEverythingCards = [
        {
            icon: UserCog,
            title: '조직속성 경영철학',
            description: '우리 회사의 운영 원칙과 조직 방향을 정의합니다.',
        },
        {
            icon: Target,
            title: '직무분석',
            description: '각 직무의 역할과 책임, 성과요인을 설정합니다.',
        },
        {
            icon: BarChart3,
            title: '성과관리체계',
            description: '성과평가의 기준과 운영 방식을 정의합니다.',
        },
        {
            icon: Coins,
            title: '보상체계',
            description: '조직 특성에 기반한 보상 기준을 설정합니다.',
        },
    ];

    // Default "Why HR Path-Finder?" checkmark items
    const defaultWhyItems = [
        '업종과 조직규모, 경영철학을 고려한 맞춤형 설계',
        '전문 컨설턴트의 맞춤형 검토, 리포트 제공',
        '컨설턴트 기준에 따른 규칙 기반 설계 (AI추측 없음)',
        '타겟 경쟁사와의 보상 수준 비교',
        '설계된 전체 구조를 한 눈에 볼 수 있는 대시보드',
        '운영지원 및 정기 조직진단 (옵션)',
    ];

    // Default feature cards (4 cards)
    const defaultFeatureCards = [
        {
            icon: Users,
            title: '역할 기반 접근',
            description: 'CEO와 HR담당자가 각자의 역할에 맞게 설계를 진행할 수 있습니다.',
        },
        {
            icon: BarChart3,
            title: 'HR구조를 한눈에 확인',
            description: '초안 설계 직후 직무,평가체계,보상구조를 하나의 화면에서 확인할 수 있습니다.',
        },
        {
            icon: Shield,
            title: '논리적 검증',
            description: '설계 과정의 충돌과 불일치를 방지하고 마지막 단계에서 전문 컨설턴트가 전체 구조를 검토, 제안을 드립니다.',
        },
        {
            icon: TrendingUp,
            title: 'CEO와 HR 협업 기반 설계',
            description: '명확한 승인 구조를 기반으로 공동설계를 진행, 경영진과 인사부서의 생각을 연결합니다.',
        },
    ];

    // Get "Everything you need" cards from translations
    const everythingCardsObj = t('landing.everything.cards', { returnObjects: true });
    let everythingCards = defaultEverythingCards;
    if (everythingCardsObj && typeof everythingCardsObj === 'object') {
        const cardsArray = Object.values(everythingCardsObj);
        if (Array.isArray(cardsArray) && cardsArray.length > 0) {
            everythingCards = cardsArray.map((f: any, idx: number) => ({
                icon: [UserCog, Target, BarChart3, Coins][idx] || UserCog,
                title: f.title || defaultEverythingCards[idx]?.title || '',
                description: f.description || defaultEverythingCards[idx]?.description || '',
            }));
        }
    }

    // Get "Why" items from translations
    const whyItemsData = t('landing.why.items', { returnObjects: true });
    const whyItems = Array.isArray(whyItemsData) && whyItemsData.length > 0 ? whyItemsData : defaultWhyItems;

    // Get feature cards from translations
    const featuresObj = t('landing.features', { returnObjects: true });
    let featureCards = defaultFeatureCards;
    if (featuresObj && typeof featuresObj === 'object') {
        const featuresArray = Object.values(featuresObj);
        if (Array.isArray(featuresArray) && featuresArray.length > 0) {
            featureCards = featuresArray.map((f: any, idx: number) => ({
                icon: [Users, BarChart3, Shield, TrendingUp][idx] || Users,
                title: f.title || defaultFeatureCards[idx]?.title || '',
                description: f.description || defaultFeatureCards[idx]?.description || '',
            }));
        }
    }


    return (
        <>
            <TranslationLoader />
            <Head title={currentLang === 'en' ? 'HR Pathfinder - Professional-Grade HR System Design Platform' : 'HR Pathfinder - 20~300인 기업 특화 HR제도 설계 플랫폼'} />
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
                                    <span className="text-lg font-bold text-gray-900">{getTranslation('header.logo', 'HR Pathfinder')}</span>
                                    <span className="text-xs text-gray-600">{getTranslation('header.company', 'powered by bettercompany')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <LanguageToggle />
                                <Link href={login()} className="text-sm font-medium text-gray-700 hover:text-[#0a1629]">
                                    {getTranslation('header.sign_in', '로그인')}
                                </Link>
                                <Button asChild className="bg-[#0a1629] hover:bg-[#0d1b35] text-white font-medium px-4 py-2 rounded-lg text-sm h-auto shadow-sm">
                                    <Link href={canRegister ? register() : login()}>
                                        {getTranslation('header.get_started', '시작하기')}
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
                        badge={getTranslation('hero.badge', '20~300인 기업 특화 HR제도 설계 플랫폼')}
                        title={getTranslation('hero.title', 'HR컨설팅의 설계 프로세스를 온라인에서 직접 진행하세요')}
                        description={getTranslation('hero.description', '복잡한 HR제도 설계를 단계별 가이드로 따라가며 직접 완성할 수 있습니다. 설계 과정에는 전문 HR컨설팅의 기준과 로직이 반영되어 있으며 고객사의 설계안에 대해 전문 컨설턴트가 종합 리포트를 제공합니다.')}
                        primaryButton={getTranslation('hero.cta_primary', 'HR설계 시작하기')}
                        secondaryButton={getTranslation('hero.cta_secondary', '데모 보기')}
                        trustText={''}
                        overviewTitle={t('dashboard.overview', 'HR 시스템 개요')}
                        overviewProgress={'4/4 완료'}
                        overviewSteps={[
                            { id: 1, name: t('steps.diagnosis', '진단'), completed: true },
                            { id: 2, name: t('steps.job_analysis', '조직 설계'), completed: true },
                            { id: 3, name: t('steps.performance', '성과 관리'), completed: true },
                            { id: 4, name: t('steps.compensation', '보상 체계'), completed: true },
                        ]}
                        alignmentLabel={'CEO 정렬도'}
                        alignmentScore={'높음'}
                        alignmentDescription={'HR 시스템 설계가 CEO의 경영 철학과 잘 일치합니다'}
                    />
                    {/* Better Company Link */}
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                        <a 
                            href="https://better.odw.co.kr" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-gray-600 hover:text-[#0a1629] transition-colors cursor-pointer"
                        >
                            <span>☞ 실무형 HR 컨설팅펌 Better Company의 설계 프레임워크를 기반으로 합니다.</span>
                        </a>
                    </div>
                </section>

                {/* Everything You Need Section */}
                <section className="border-b py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-bold">
                                {getTranslation('everything.title', '성과와 조직 안정을 이끄는 HR체계의 핵심 영역')}
                            </h2>
                            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                                {getTranslation('everything.description', 'Pathfinder는 경영철학 진단, 직무분석, 성과체계, 보상체계의 단계별 설계로 조직 운영 기준을 명확히 정의합니다.')}
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
                                {getTranslation('why.title', 'HR Pathfinder가 제공하는 핵심 가치는?')}
                            </h2>
                            <p className="mb-8 text-lg text-muted-foreground text-center">
                                {getTranslation('why.description', '전문 HR컨설팅의 설계방식을 기반으로 HR전담 조직이 없는 회사도 체계적인 정책 설계를 진행할 수 있습니다.')}
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
                    title={getTranslation('cta.title', '우리 회사의 HR시스템을 설계할 준비가 되셨나요?')}
                    description={getTranslation('cta.description', 'HR-Pathfinder의 기능은 점진적으로 계속 확장됩니다. 인연이 된 고객사의 성공적인 비즈니스를 위해 지속적인 지원을 아끼지 않겠습니다.')}
                    buttonText={getTranslation('cta.button', 'HR Pathfinder 시작하기')}
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
                                    <span className="text-lg font-bold text-gray-900">{getTranslation('header.logo', 'HR Pathfinder')}</span>
                                    <span className="text-xs text-gray-600">{getTranslation('header.company', 'powered by bettercompany')}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                {getTranslation('footer.copyright', '© 2026 Everthere.inc All rights reserved.')}
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
