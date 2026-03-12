import React from 'react';

interface TrustItem {
    text: string;
    icon?: React.ReactNode;
}

const defaultShield = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#2ECFAB] shrink-0">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const defaultClock = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#2ECFAB] shrink-0">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
    </svg>
);
const defaultDollar = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#2ECFAB] shrink-0">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
);
const defaultChart = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#2ECFAB] shrink-0">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

interface TrustBarProps {
    items?: TrustItem[];
}

const defaultItems: TrustItem[] = [
    { text: '전문 HR컨설팅펌 베러컴퍼니가 만든 제도설계 플랫폼', icon: defaultShield },
    { text: '평균 1개월 내 제도설계 완료', icon: defaultClock },
    { text: '컨설팅펌 대비 압도적인 가격 경쟁력', icon: defaultDollar },
    { text: '경쟁사 보상지수 벤치마크', icon: defaultChart },
];

const defaultIcons = [defaultShield, defaultClock, defaultDollar, defaultChart];

export function TrustBar({ items = defaultItems }: TrustBarProps) {
    return (
        <div className="bg-[#132847] border-t border-b border-[#2ECFAB]/10 py-5 px-12 md:px-20 flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {items.map((item, i) => (
                <React.Fragment key={i}>
                    <div className="flex items-center gap-2.5 text-white/55 text-[13px] font-medium">
                        {item.icon ?? defaultIcons[i % defaultIcons.length]}
                        {item.text}
                    </div>
                    {i < items.length - 1 && (
                        <div className="hidden md:block w-px h-5 bg-white/10" aria-hidden />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
