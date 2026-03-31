import React from 'react';

interface BenchmarkRow {
    label: string;
    value: number;
    barColor?: string;
    isAnchor?: boolean;
}

interface BenchmarkSectionProps {
    eyebrow?: string;
    title?: React.ReactNode;
    description?: string;
    rows?: BenchmarkRow[];
    insight?: React.ReactNode;
}

const defaultRows: BenchmarkRow[] = [
    { label: '우리 회사', value: 100, isAnchor: true, barColor: 'linear-gradient(90deg, rgba(255,255,255,0.98), rgba(228,236,249,0.72))' },
    { label: '업종 전체', value: 127, barColor: 'linear-gradient(90deg, #ff7d7d, #ff4e4e)' },
    { label: '타깃 경쟁사', value: 118, barColor: 'linear-gradient(90deg, #ffc24a, #ff8a1f)' },
    { label: '유사 제조업', value: 108, barColor: 'linear-gradient(90deg, rgba(241,196,15,0.95), rgba(156,163,175,0.85))' },
];

export function BenchmarkSection({
    eyebrow = '보상 수준 벤치마크',
    title,
    description = 'Pathfinder는 귀사의 직급·직무별 연봉을 업종 전체·타깃 경쟁사·유사 제조업 기준과 비교합니다. 귀사의 보상 수준을 100으로 두고, 시장이 어느 위치에 있는지 즉시 파악할 수 있습니다.\n\n이 분석이 HR 시스템 리포트에 포함되어 납품됩니다.',
    rows = defaultRows,
    insight,
}: BenchmarkSectionProps) {
    const maxValue = Math.max(...rows.map((row) => row.value), 1);
    const widthFromValue = (value: number) => `${Math.max(16, (value / maxValue) * 100)}%`;

    const defaultTitle = (
        <>
            우리 회사 보상,
            <br />
            <em className="not-italic text-[#2ECFAB]">어디에 있는지 알고 계십니까?</em>
        </>
    );
    const defaultInsight = (
        <>
            귀사의 보상 수준은 업종 전체 대비 <strong className="text-[#0B1E3D] font-bold">78%</strong>, 타깃 경쟁사 대비 <strong className="text-[#0B1E3D] font-bold">85%</strong> 수준입니다.
        </>
    );

    return (
        <section id="benchmark" className="bg-[#FAF8F3] py-8 md:py-[100px] px-8 md:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-[72px] items-center">
                <div>
                    <div className="text-[11px] font-semibold text-[#2ECFAB] tracking-[0.14em] uppercase mb-4 font-sans">
                        {eyebrow}
                    </div>
                    <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#0B1E3D] leading-snug mb-4">
                        {title ?? defaultTitle}
                    </h2>
                    <p className="text-base text-[#3D5068] leading-relaxed font-sans whitespace-pre-line">
                        {description}
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-[#E4E8EF] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.07)]">
                    <div className="bg-[#0B1E3D] px-5 py-4 flex items-center justify-between">
                        <span className="text-white text-sm font-normal tracking-wide font-sans">보상지수 벤치마크</span>
                        <span className="bg-[#2ECFAB]/15 border border-[#2ECFAB] text-[#2ECFAB] text-[10px] font-bold py-0.5 px-2.5 rounded-full tracking-wider">
                            BENCHMARK
                        </span>
                    </div>
                    <div className="p-5 pt-5 flex flex-col gap-3.5">
                        {rows.map((row, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <span className={`text-xs font-medium w-[76px] shrink-0 font-sans ${row.isAnchor ? 'text-[#0B1E3D] font-bold' : 'text-[#3D5068]'}`}>
                                    {row.label}
                                </span>
                                <div className="flex-1 relative h-2 rounded bg-[#F0F2F6] overflow-hidden">
                                    <div
                                        className="h-full rounded"
                                        style={{
                                            width: widthFromValue(row.value),
                                            background: row.barColor ?? 'linear-gradient(90deg, #8FA6C4, #6B88A8)',
                                        }}
                                    />
                                </div>
                                <span className={`text-[13px] font-bold min-w-[32px] text-right font-sans tracking-tight ${row.isAnchor ? 'text-[#0B1E3D]' : 'text-[#3D5068]'}`}>
                                    {row.value}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mx-5 mb-5 flex items-start gap-2 bg-[#F4F7FB] border-l-4 border-[#0B1E3D] rounded px-3.5 py-2.5 text-xs text-[#3D5068] leading-relaxed font-sans">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0B1E3D] shrink-0 mt-0.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4M12 16h.01" />
                        </svg>
                        {insight ?? defaultInsight}
                    </div>
                </div>
            </div>
        </section>
    );
}
