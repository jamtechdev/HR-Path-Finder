import React from 'react';

interface ROITableSectionProps {
    eyebrow?: string;
    title?: React.ReactNode;
    description?: string;
}

const checkIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#2ECFAB] shrink-0">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const crossIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20 shrink-0">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export function ROITableSection({
    eyebrow = 'ROI 비교',
    title = '일반 컨설팅 대비 Pathfinder',
    description,
}: ROITableSectionProps) {
    const rows = [
        { label: '제도 설계 기간', us: '평균 1개월', them: '2~3개월', usGood: true },
        { label: '비용', us: 'SaaS 요금', them: '고액 컨설팅비', usGood: true },
        { label: '내부 역량 축적', us: '직접 설계 참여', them: '외부 의존', usGood: true },
        { label: '컨설턴트 검수', us: '포함', them: '포함', usGood: true },
    ];

    return (
        <section className="bg-[#0B1E3D] py-[100px] px-5 md:px-20">
            <div className="text-center mb-14">
                <div className="text-[11px] font-semibold text-[#2ECFAB] tracking-[0.14em] uppercase mb-4 font-sans">
                    {eyebrow}
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white leading-snug mb-4">
                    {title}
                </h2>
                {description && (
                    <p className="text-base text-white/55 leading-relaxed max-w-[580px] mx-auto font-sans">
                        {description}
                    </p>
                )}
            </div>
            <div className="overflow-x-auto rounded-2xl border border-[#2ECFAB]/15 shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
                <table className="w-full border-collapse text-[15px]">
                    <thead>
                        <tr className="bg-[#1E3A5F]">
                            <th className="py-5 px-7 text-left font-bold text-sm text-white/70 border-b border-white/5">구분</th>
                            <th className="py-5 px-7 text-left font-bold text-sm text-[#2ECFAB] bg-[#2ECFAB]/10 border-b border-white/5">HR Pathfinder</th>
                            <th className="py-5 px-7 text-left font-bold text-sm text-white/70 border-b border-white/5">일반 컨설팅</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i}>
                                <td className="py-4 px-7 text-white/70 border-b border-white/5 bg-[#132847] font-semibold text-[13px]">
                                    {row.label}
                                </td>
                                <td className="py-4 px-3 md:px-7 border-b border-white/5 bg-[#2ECFAB]/[0.06] text-white font-semibold">
                                    {row.usGood ? (
                                        <span className="flex items-center gap-2">
                                            {checkIcon}
                                            <span className="text-[#2ECFAB] font-bold">{row.us}</span>
                                        </span>
                                    ) : (
                                        <span className="text-white/35">{row.us}</span>
                                    )}
                                </td>
                                <td className="py-4 px-7 text-white/70 border-b border-white/5 bg-[#132847]">
                                    {row.usGood ? (
                                        <span className="flex items-center gap-2 text-white/35">
                                            {crossIcon}
                                            {row.them}
                                        </span>
                                    ) : (
                                        row.them
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-center mt-8 text-[13px] text-white/35">
                * 제도 설계 범위와 컨설팅펌에 따라 상이할 수 있습니다.
            </p>
        </section>
    );
}
