import React from 'react';

interface TrustCard {
    icon: string;
    iconBg: 'mint' | 'gold' | 'navy';
    title: string;
    description: string;
}

interface TrustCardsSectionProps {
    eyebrow?: string;
    title?: React.ReactNode;
    description?: string;
    cards?: TrustCard[];
}

const defaultCards: TrustCard[] = [
    { icon: '📋', iconBg: 'mint', title: '귀사가 직접 진단합니다', description: '조직 구조, 직무 정의, 성과 체계, 보상 기준을 단계적으로 입력합니다. 외부 컨설턴트에게 자료를 넘기는 것보다 훨씬 빠릅니다.' },
    { icon: '🧠', iconBg: 'gold', title: 'HR 컨설턴트가 분석합니다', description: '입력된 데이터를 바탕으로 12년 차 HR 컨설턴트가 귀사의 산업·규모·문화에 맞게 체계를 설계합니다.' },
    { icon: '📝', iconBg: 'navy', title: 'HR 시스템 리포트로 납품됩니다', description: '컨설턴트가 서명한 HR 시스템 리포트가 PDF로 제공됩니다. 즉시 사내에서 실행 가능한 수준의 완성도를 보장합니다.' },
];

export function TrustCardsSection({
    eyebrow = '왜 신뢰할 수 있는가',
    title,
    description = '패스파인더는 단순한 폼 작성 도구가 아닙니다. 귀사의 답변이 HR 컨설턴트의 설계 기반이 되고, 그 결과가 검수된 HR 시스템 리포트로 돌아옵니다.\n\n"시스템이 설계하고, 컨설턴트가 리포트로 보증합니다."',
    cards = defaultCards,
}: TrustCardsSectionProps) {
    const defaultTitle = (
        <>
            전문 HR컨설턴트가
            <br />
            <em className="not-italic text-[#2ECFAB]">전체 설계를 직접 검수합니다.</em>
        </>
    );

    const iconBgClass = {
        mint: 'bg-[#E6FAF6]',
        gold: 'bg-[#FFF8E7]',
        navy: 'bg-[#EEF2F8]',
    };

    return (
        <section id="trust" className="bg-[#FAF8F3] py-8 md:py-[100px] px-8 md:px-20 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div>
                <div className="text-[11px] font-semibold text-[#2ECFAB] tracking-[0.14em] uppercase mb-4 font-sans">
                    {eyebrow}
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#0B1E3D] leading-snug mb-4">
                    {title ?? defaultTitle}
                </h2>
                <p className="text-base text-[#3D5068] leading-relaxed max-w-[580px] font-sans whitespace-pre-line">
                    {description}
                </p>
            </div>
            <div className="flex flex-col gap-4">
                {cards.map((card, i) => (
                    <React.Fragment key={i}>
                        <div className="bg-white rounded-xl p-6 border border-[#EEF0F4] flex items-start gap-4 transition-all shadow-sm hover:translate-x-1 hover:border-[#2ECFAB] hover:shadow-[0_8px_32px_rgba(46,207,171,0.1)]">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[22px] shrink-0 ${iconBgClass[card.iconBg]}`}>
                                {card.icon}
                            </div>
                            <div>
                                <h4 className="text-[15px] font-bold text-[#0B1E3D] mb-1.5">{card.title}</h4>
                                <p className="text-[13px] text-[#3D5068] leading-relaxed">{card.description}</p>
                            </div>
                        </div>
                        {i < cards.length - 1 && (
                            <div className="text-center text-2xl text-[#2ECFAB] opacity-40 my-1 ml-4">↓</div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </section>
    );
}
