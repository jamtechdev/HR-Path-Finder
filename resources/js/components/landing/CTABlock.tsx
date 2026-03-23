import { Link } from '@inertiajs/react';
import React from 'react';
import { login, register, dashboard } from '@/routes';

interface CTABlockProps {
    canRegister?: boolean;
    isAuthenticated?: boolean;
    eyebrow?: string;
    title?: string;
    description?: string;
    buttonText?: string;
}

export function CTABlock({
    canRegister = true,
    isAuthenticated = false,
    eyebrow = '지금 시작하세요',
    title = '우리 회사 HR 시스템, 지금 바로 설계를 시작하세요.',
    description = '10분 진단 후, 조직의 HR 현황 스코어와 우선 개선 포인트를 즉시 확인할 수 있습니다.',
    buttonText = '서비스 문의하기 →',
}: CTABlockProps) {
    return (
        <section className="bg-gradient-to-br from-[#0B1E3D] via-[#1E3A5F] to-[#0B1E3D] text-center py-[120px] px-8 md:px-20 relative overflow-hidden">
            <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,rgba(46,207,171,0.12)_0%,transparent_70%)] pointer-events-none" />
            <div className="relative">
                <div className="text-[11px] font-semibold text-[#C8A84B] tracking-[0.14em] uppercase mb-5 font-sans">
                    {eyebrow}
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white leading-snug mb-5">
                    {title}
                </h2>
                <p className="mx-auto mb-12 max-w-[580px] text-base text-white/60 leading-relaxed font-sans">
                    {description}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-5">
                    <Link
                        href={isAuthenticated ? dashboard() : (canRegister ? register() : login())}
                        className="inline-flex items-center bg-[#2ECFAB] text-[#0B1E3D] font-extrabold px-10 py-4 rounded-xl text-[17px] no-underline shadow-[0_16px_48px_rgba(46,207,171,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_64px_rgba(46,207,171,0.5)]"
                    >
                        {buttonText}
                    </Link>
                </div>
                <p className="mt-8 text-[13px] text-white/30">
                    무료 체험 가능 · 별도 약정 없음
                </p>
            </div>
        </section>
    );
}
