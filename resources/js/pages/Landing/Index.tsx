import React, { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroRevision } from '@/components/landing/HeroRevision';
import { TrustBar } from '@/components/landing/TrustBar';
import { ProcessSection } from '@/components/landing/ProcessSection';
import { TrustCardsSection } from '@/components/landing/TrustCardsSection';
import { BenchmarkSection } from '@/components/landing/BenchmarkSection';
import { ROITableSection } from '@/components/landing/ROITableSection';
import { CTABlock } from '@/components/landing/CTABlock';
import { LandingFooter } from '@/components/landing/LandingFooter';
import TranslationLoader from '@/components/TranslationLoader';
import { useTranslation } from 'react-i18next';

interface Props {
    canRegister?: boolean;
}

export default function LandingPage({ canRegister = true }: Props) {
    const { t, i18n } = useTranslation();
    const { props } = usePage<{ auth?: { user?: unknown } }>();
    const isAuthenticated = Boolean(props.auth?.user);
    const [currentLang, setCurrentLang] = useState(i18n.language || 'ko');

    useEffect(() => {
        const handleLanguageChange = (e: CustomEvent) => setCurrentLang(e.detail?.language || i18n.language);
        const updateLang = () => setCurrentLang(i18n.language || 'ko');
        window.addEventListener('languageChanged', handleLanguageChange as EventListener);
        i18n.on('languageChanged', updateLang);
        return () => {
            window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
            i18n.off('languageChanged', updateLang);
        };
    }, [i18n]);

    const get = (key: string, fallback: string) => t(`landing.${key}`, { defaultValue: fallback });

    const trustBarItems = [
        { text: get('trust_bar.item1', '전문 HR컨설팅펌 베러컴퍼니가 만든 제도설계 플랫폼') },
        { text: get('trust_bar.item2', '평균 1개월 내 제도설계 완료') },
        { text: get('trust_bar.item3', '컨설팅펌 대비 압도적인 가격 경쟁력') },
        { text: get('trust_bar.item4', '경쟁사 보상지수 벤치마크') },
    ];

    const trustCards = [
        { icon: '📋' as const, iconBg: 'mint' as const, title: get('trust_cards.card1_title', '귀사가 직접 진단합니다'), description: get('trust_cards.card1_desc', '조직 구조, 직무 정의, 성과 체계, 보상 기준을 단계적으로 입력합니다. 외부 컨설턴트에게 자료를 넘기는 것보다 훨씬 빠릅니다.') },
        { icon: '🧠' as const, iconBg: 'gold' as const, title: get('trust_cards.card2_title', 'HR 컨설턴트가 분석합니다'), description: get('trust_cards.card2_desc', '입력된 데이터를 바탕으로 12년 차 HR 컨설턴트가 귀사의 산업·규모·문화에 맞게 체계를 설계합니다.') },
        { icon: '📝' as const, iconBg: 'navy' as const, title: get('trust_cards.card3_title', 'HR 시스템 리포트로 납품됩니다'), description: get('trust_cards.card3_desc', '컨설턴트가 서명한 HR 시스템 리포트가 PDF로 제공됩니다. 즉시 사내에서 실행 가능한 수준의 완성도를 보장합니다.') },
    ];

    return (
        <>
            <TranslationLoader />
            <Head title={currentLang === 'en' ? 'HR Pathfinder - Professional-Grade HR System Design Platform' : 'HR Pathfinder — 전문가 수준의 HR 설계'} />
            <div className="min-h-screen bg-[#FAF8F3] text-[#0D1B2A] overflow-x-hidden" data-landing-revision key={currentLang}>
                <LandingNav
                    isAuthenticated={isAuthenticated}
                    canRegister={canRegister}
                    logoText={get('header.logo', 'HR Pathfinder')}
                    navProcess={get('nav.process', '프로세스')}
                    navTrust={get('nav.trust', '전문가 검수')}
                    navBenchmark={get('nav.benchmark', '보상 벤치마크')}
                    ctaLabel={get('nav.cta_label', '서비스 문의하기')}
                    signInLabel={get('header.sign_in', '로그인')}
                    getStartedLabel={get('header.get_started', '시작하기')}
                    dashboardLabel={get('header.dashboard', '대시보드')}
                />

                <HeroRevision
                    canRegister={canRegister}
                    isAuthenticated={isAuthenticated}
                    dashboardUrl={dashboard()}
                    badge={get('hero_revision.badge', '조직성장의 속도를 견인하는 HR정책설계 파워 엔진')}
                    sub={get('hero_revision.sub', '일반 컨설팅의 1/4 금액으로 내부 HR 역량 육성과 전문 제도설계 서비스를 모두 받아보세요.')}
                    primaryButton={get('hero_revision.primary_button', '서비스 문의하기')}
                    firmSub={get('hero_revision.firm_sub', '전문 컨설팅펌이 만든 SaaS')}
                    firmName={get('hero_revision.firm_name', '베러컴퍼니 →')}
                    firmUrl="https://better.odw.co.kr"
                />

                <TrustBar items={trustBarItems} />

                <ProcessSection
                    eyebrow={get('process.eyebrow', 'HR 데이터 빌드업 프로세스')}
                    description={get('process.description', '')}
                    resultTitle={get('process.result_title', 'HR 컨설턴트의 HR 시스템 리포트')}
                    resultSub={get('process.result_sub', '컨설턴트 검수 완료 · PDF 제공')}
                />

                <TrustCardsSection
                    eyebrow={get('trust_cards.eyebrow', '왜 신뢰할 수 있는가')}
                    description={get('trust_cards.description', '')}
                    cards={trustCards}
                />

                <BenchmarkSection
                    eyebrow={get('benchmark_section.eyebrow', '보상 수준 벤치마크')}
                    description={get('benchmark_section.description', 'Pathfinder는 귀사의 직급·직무별 연봉을 업종 전체·타깃 경쟁사·유사 제조업 기준과 비교합니다.')}
                    insight={get('benchmark_section.insight', '귀사의 보상 수준은 업종 전체 대비 78%, 타깃 경쟁사 대비 85% 수준입니다.')}
                />

                <ROITableSection />

                <CTABlock
                    canRegister={canRegister}
                    isAuthenticated={isAuthenticated}
                    eyebrow={get('cta_block.eyebrow', '지금 시작하세요')}
                    title={get('cta_block.title', '우리 회사 HR 시스템, 지금 바로 설계를 시작하세요.')}
                    description={get('cta_block.description', '10분 진단 후, 조직의 HR 현황 스코어와 우선 개선 포인트를 즉시 확인할 수 있습니다.')}
                    buttonText={get('cta_block.button', '서비스 문의하기 →')}
                />

                <LandingFooter
                    logoText={get('header.logo', 'HR Pathfinder')}
                    companySub={get('footer.company_sub', 'powered by BetterCompany')}
                    copyright={get('footer.copyright', '© 2026 (주)Everthere. All rights reserved.')}
                />
            </div>
        </>
    );
}
