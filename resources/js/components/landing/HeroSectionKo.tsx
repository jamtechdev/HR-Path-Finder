import React from 'react';
import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { CompensationBenchmarkPreview } from './CompensationBenchmarkPreview';

interface HeroSectionKoProps {
    canRegister?: boolean;
    badge?: string;
    title?: string;
    description?: string;
    primaryButton?: string;
    secondaryButton?: string;
    trustText?: string;
    benchmarkTitle?: string;
    benchmarks?: Array<{
        label: string;
        value: number;
        isOurCompany?: boolean;
    }>;
    benchmarkSummary?: string;
}

export function HeroSectionKo({ 
    canRegister = true,
    badge = '컨설팅급 HR 설계 플랫폼',
    title = '정밀한 HR 시스템을 설계하세요.',
    description = '중소기업의 HR 프레임워크 구축 방식을 혁신합니다. 단계별 가이드 접근 방식으로 전문 컨설팅 업무를 현대적인 SaaS 플랫폼 안에서 재현합니다.',
    primaryButton = 'HR설계 시작하기',
    secondaryButton = '데모 보기',
    trustText = '100개 이상의 기업이 HR Copilot을 신뢰합니다',
    benchmarkTitle = '보상 수준 상대지수',
    benchmarks = [
        { label: '화장품업 전체', value: 55 },
        { label: '타겟 경쟁사', value: 51 },
        { label: '화장품 제조업', value: 49 },
        { label: '우리 회사', value: 43, isOurCompany: true },
    ],
    benchmarkSummary = '귀사의 보상 수준은 업종 전체 대비 78% 타겟 경쟁사 대비 84% 수준입니다.',
}: HeroSectionKoProps) {
    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Side - Hero Content */}
                    <div className="text-left">
                        {badge && (
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-4 py-1.5 text-sm font-medium text-[#10b981] mb-6 dark:border-[#10b981]/30 dark:bg-[#10b981]/15">
                                {badge}
                            </div>
                        )}
                        
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight dark:text-white">
                            {title.includes('HR 시스템') ? (
                                <>
                                    {title.split('HR 시스템')[0]}
                                    <span className="text-[#0a1629] dark:text-white">HR 시스템</span>
                                    {title.split('HR 시스템')[1]}
                                </>
                            ) : (
                                title
                            )}
                        </h1>
                        
                        <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed dark:text-gray-400">
                            {description}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <Button asChild className="bg-[#0a1629] hover:bg-[#0d1b35] text-white font-medium px-6 py-3 rounded-lg text-base h-auto shadow-sm">
                                <Link href={canRegister ? register() : login()}>
                                    {primaryButton}
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium px-6 py-3 rounded-lg text-base h-auto dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600">
                                <Link href="#demo">{secondaryButton}</Link>
                            </Button>
                        </div>
                        
                        {trustText && trustText.trim() && (
                            <div className="flex items-center gap-6">
                                <div className="flex -space-x-2">
                                    {['A', 'B', 'C', 'D'].map((letter, i) => (
                                        <div
                                            key={i}
                                            className="flex size-12 items-center justify-center rounded-full border-2 border-white dark:border-gray-800 bg-muted text-sm font-semibold shadow-sm"
                                        >
                                            {letter}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{trustText}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Side - Compensation Benchmark Preview */}
                    <div className="lg:sticky lg:top-24">
                        <CompensationBenchmarkPreview 
                            title={benchmarkTitle}
                            benchmarks={benchmarks}
                            summaryText={benchmarkSummary}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
