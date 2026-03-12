import React from 'react';

interface Step {
    num: string;
    icon: string;
    title: string;
    sub: string;
}

interface ProcessSectionProps {
    eyebrow?: string;
    title?: React.ReactNode;
    description?: string;
    steps?: Step[];
    buildupText?: React.ReactNode;
    resultTitle?: string;
    resultSub?: string;
}

const defaultSteps: Step[] = [
    { num: '01', icon: '🔍', title: '조직 진단', sub: '현재 조직 구조, 직무 분포, 인력 구성을 진단합니다. 경영철학과 방향성을 함께 정의합니다.' },
    { num: '02', icon: '📋', title: '직무 분석', sub: '사내 직군과 직무를 체계적으로 정렬합니다.' },
    { num: '03', icon: '🎯', title: '성과 체계 설계', sub: '평가 프로세스는 운영의 효율성으로, 목표의 수립과 관리는 직무의 특성에 기반하여 설계합니다.' },
    { num: '04', icon: '💰', title: '보상 구조 설계', sub: '임금체계, 성과급, 복지의 근간을 마련합니다.' },
];

export function ProcessSection({
    eyebrow = 'HR 데이터 빌드업 프로세스',
    title,
    description = '각 단계는 다음 단계의 인풋이 됩니다. 4단계를 완료하면 HR 컨설턴트가 맞춤 HR 시스템 리포트로 전체 체계를 보증합니다.',
    steps = defaultSteps,
    buildupText,
    resultTitle = 'HR 컨설턴트의 HR 시스템 리포트',
    resultSub = '컨설턴트 검수 완료 · PDF 제공',
}: ProcessSectionProps) {
    const defaultTitle = (
        <>
            단순한 입력이 아닙니다.
            <br />
            <em className="not-italic text-[#2ECFAB]">우리 회사의 HR 데이터를 정교하게 정렬</em>하는 과정입니다.
        </>
    );
    const defaultBuildup = (
        <>
            4단계 완료 후, Pathfinder가 정리한 데이터를 바탕으로
            <br />
            <strong className="text-[#2ECFAB] font-bold">HR 컨설턴트가 직접 리포트를 작성하고 서명합니다.</strong>
            <br />
            &quot;시스템이 설계하고, 컨설턴트가 리포트로 보증합니다.&quot;
        </>
    );

    return (
        <section id="process" className="bg-[#0B1E3D] py-[100px] px-12 md:px-20">
            <div className="text-center mb-16">
                <div className="text-[11px] font-semibold text-[#C8A84B] tracking-[0.14em] uppercase mb-4 font-sans">
                    {eyebrow}
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white leading-snug mb-4">
                    {title ?? defaultTitle}
                </h2>
                <p className="text-base text-white/55 leading-relaxed max-w-[580px] mx-auto font-sans">
                    {description}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 relative">
                <div className="absolute top-[52px] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#2ECFAB] via-[#C8A84B] to-[#2ECFAB] opacity-30 hidden lg:block" aria-hidden />
                {steps.map((step, i) => (
                    <div key={i} className="flex flex-col items-center text-center py-0 px-6 relative group">
                        <div className="w-14 h-14 rounded-full bg-[#1E3A5F] border-2 border-[#2ECFAB]/25 flex items-center justify-center font-serif text-xl font-bold text-[#2ECFAB] mb-5 relative z-10 transition-all group-hover:bg-[#2ECFAB] group-hover:text-[#0B1E3D] group-hover:border-[#2ECFAB] group-hover:scale-110">
                            {step.num}
                        </div>
                        <div className="text-[28px] mb-4" aria-hidden>{step.icon}</div>
                        <div className="text-base font-bold text-white mb-2">{step.title}</div>
                        <div className="text-[13px] text-white/45 leading-relaxed">{step.sub}</div>
                        {i < steps.length - 1 && (
                            <span className="absolute top-7 right-[-12px] text-[#2ECFAB]/40 text-lg z-[2] hidden lg:inline">→</span>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-14 bg-[#2ECFAB]/[0.06] border border-[#2ECFAB]/15 rounded-2xl py-7 px-8 md:px-9 flex flex-wrap items-center justify-between gap-6">
                <div className="text-[15px] text-white/70 leading-relaxed font-sans">
                    {buildupText ?? defaultBuildup}
                </div>
                <div className="flex items-center gap-3 bg-[#1E3A5F] rounded-xl py-4 px-6 border border-[#2ECFAB]/20 whitespace-nowrap">
                    <span className="text-[28px]" aria-hidden>📄</span>
                    <div>
                        <div className="text-sm font-bold text-white">{resultTitle}</div>
                        <div className="text-xs text-white/45 mt-0.5">{resultSub}</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
