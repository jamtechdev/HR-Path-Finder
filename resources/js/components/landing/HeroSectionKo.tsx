import React from 'react';
import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { HRSystemOverviewKo } from './HRSystemOverviewKo';

interface HeroSectionKoProps {
    canRegister?: boolean;
    badge?: string;
    title?: string;
    description?: string;
    primaryButton?: string;
    secondaryButton?: string;
    trustText?: string;
    overviewTitle?: string;
    overviewProgress?: string;
    overviewSteps?: Array<{ id: number; name: string; completed: boolean }>;
    alignmentLabel?: string;
    alignmentScore?: string;
    alignmentDescription?: string;
}

export function HeroSectionKo({ 
    canRegister = true,
    badge = '컨설팅급 HR 설계 플랫폼',
    title = '정밀한 HR 시스템을 설계하세요.',
    description = '중소기업의 HR 프레임워크 구축 방식을 혁신합니다. 단계별 가이드 접근 방식으로 전문 컨설팅 업무를 현대적인 SaaS 플랫폼 안에서 재현합니다.',
    primaryButton = '무료 체험 시작하기',
    secondaryButton = '데모 보기',
    trustText = '100개 이상의 기업이 HR Copilot을 신뢰합니다',
    overviewTitle = 'HR 시스템 개요',
    overviewProgress = '4/4 완료',
    overviewSteps = [
        { id: 1, name: '진단', completed: true },
        { id: 2, name: '조직 설계', completed: true },
        { id: 3, name: '성과 관리', completed: true },
        { id: 4, name: '보상 체계', completed: true },
    ],
    alignmentLabel = 'CEO 정렬도',
    alignmentScore = '높음',
    alignmentDescription = 'HR 시스템 설계가 CEO의 경영 철학과 잘 일치합니다',
}: HeroSectionKoProps) {
    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Side - Hero Content */}
                    <div className="text-left">
                        {badge && (
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-4 py-1.5 text-sm font-medium text-[#10b981] mb-6">
                                {badge}
                            </div>
                        )}
                        
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            {title.includes('HR 시스템') ? (
                                <>
                                    {title.split('HR 시스템')[0]}
                                    <span className="text-[#0a1629]">HR 시스템</span>
                                    {title.split('HR 시스템')[1]}
                                </>
                            ) : (
                                title
                            )}
                        </h1>
                        
                        <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                            {description}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <Button asChild className="bg-[#0a1629] hover:bg-[#0d1b35] text-white font-medium px-6 py-3 rounded-lg text-base h-auto shadow-sm">
                                <Link href={canRegister ? register() : login()}>
                                    {primaryButton}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium px-6 py-3 rounded-lg text-base h-auto">
                                <Link href="#demo">{secondaryButton}</Link>
                            </Button>
                        </div>
                        
                        {trustText && (
                            <div className="flex items-center gap-6">
                                <div className="flex -space-x-2">
                                    {['A', 'B', 'C', 'D'].map((letter, i) => (
                                        <div
                                            key={i}
                                            className="flex size-12 items-center justify-center rounded-full border-2 border-white bg-muted text-sm font-semibold shadow-sm"
                                        >
                                            {letter}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600">{trustText}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Side - HR System Overview Panel */}
                    <div className="lg:sticky lg:top-24">
                        <HRSystemOverviewKo 
                            title={overviewTitle}
                            progressText={overviewProgress}
                            steps={overviewSteps}
                            alignmentLabel={alignmentLabel}
                            alignmentScore={alignmentScore}
                            alignmentDescription={alignmentDescription}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
