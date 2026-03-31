import { Head, Link } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import { LandingNav } from '@/components/landing/LandingNav';

type PayBand = {
    lbl: string;
    min: number;
    tgt: number;
    max: number;
};

const contactHref = '/contact';
const registerHref = '/register';

function calcBands(a: number, b: number): PayBand[] {
    const anchor = { min: 4000, tgt: 4720, max: 5200, sMax: 11000 };
    const labels = ['Grade A', 'Grade B', 'Grade C', 'Grade D', 'Grade E'];
    const steps = 5;
    const raw = [{ min: anchor.min, tgt: anchor.tgt, max: anchor.max }];

    for (let i = 1; i < steps; i += 1) {
        const t = Math.round(raw[i - 1].tgt * (1 + a));
        raw.push({ min: Math.round(t * b), tgt: t, max: Math.round(t * (1 + a)) });
    }

    const scale = anchor.sMax / raw[steps - 1].max;
    const bands = raw.map((row, i) => {
        if (i === 0) return { lbl: labels[i], min: row.min, tgt: row.tgt, max: row.max };
        return {
            lbl: labels[i],
            min: Math.round(row.min * scale),
            tgt: Math.round(row.tgt * scale),
            max: Math.round(row.max * scale),
        };
    });
    bands[steps - 1].max = anchor.sMax;
    return bands;
}

function fmt(v: number): string {
    return Math.round(v).toLocaleString();
}

function fmtAx(v: number): string {
    return v >= 10000 ? `${(v / 10000).toFixed(1)}억` : `${(v / 1000).toFixed(0)}천`;
}

function PayBandChart({ bands }: { bands: PayBand[] }) {
    const width = 900;
    const height = 360;
    const pad = { top: 28, right: 20, bottom: 54, left: 72 };
    const cW = width - pad.left - pad.right;
    const cH = height - pad.top - pad.bottom;
    const vals = bands.flatMap((row) => [row.min, row.max]);
    const dMin = Math.min(...vals);
    const dMax = Math.max(...vals);
    const span = dMax - dMin || 1;
    const yMin = Math.max(0, dMin - span * 0.18);
    const yMax = dMax + span * 0.16;

    const yS = (v: number) => cH - ((v - yMin) / (yMax - yMin)) * cH;
    const rowScale = (yMax - yMin) / 5;
    const mag = Math.pow(10, Math.floor(Math.log10(rowScale)));
    const tickStep = Math.ceil(rowScale / mag) * mag;
    const ticks: number[] = [];
    for (let t = Math.ceil(yMin / tickStep) * tickStep; t <= yMax + tickStep * 0.01; t += tickStep) ticks.push(t);

    const n = bands.length;
    const stepW = cW / n;
    const barW = Math.min(52, stepW * 0.38);
    const xC = (i: number) => pad.left + stepW * (i + 0.5);
    const points = bands.map((row, i) => `${xC(i)},${pad.top + yS(row.tgt)}`).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Pay band chart">
            <text x={pad.left} y={pad.top - 8} textAnchor="start" fontSize="10" fill="#9CA3AF">
                단위: 만원
            </text>
            {ticks.map((t) => {
                const y = pad.top + yS(t);
                return (
                    <g key={`tick-${t}`}>
                        <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="rgba(27,46,75,.06)" strokeWidth="0.8" />
                        <text x={pad.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9CA3AF">
                            {fmtAx(t)}
                        </text>
                    </g>
                );
            })}
            <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + cH} stroke="rgba(27,46,75,.14)" strokeWidth="0.8" />

            {bands.map((row, i) => {
                const cx = xC(i);
                const bx = cx - barW / 2;
                const by = pad.top + yS(row.max);
                const bh = yS(row.min) - yS(row.max);
                const ty = pad.top + yS(row.tgt);
                return (
                    <g key={row.lbl}>
                        <rect x={bx} y={by} width={barW} height={bh} fill="rgba(219,230,245,.85)" stroke="#3b6ea5" strokeWidth="1.3" rx="3" />
                        <line x1={bx + 2} y1={ty} x2={bx + barW - 2} y2={ty} stroke="#1b2e4b" strokeWidth="1" strokeDasharray="3,2" opacity=".35" />
                        <circle cx={cx} cy={ty} r="4.5" fill="#fff" stroke="#1b2e4b" strokeWidth="2" />
                        <text x={cx} y={by - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1b2e4b">
                            {fmt(row.max)}
                        </text>
                        <text x={cx} y={height - pad.bottom + 18} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1B2E4B">
                            {row.lbl}
                        </text>
                        <text x={cx} y={by + bh + 13} textAnchor="middle" fontSize="10" fontWeight="700" fill="#6b7280">
                            {fmt(row.min)}
                        </text>
                    </g>
                );
            })}

            <polyline points={points} fill="none" stroke="#1b2e4b" strokeWidth="1.8" strokeLinejoin="round" opacity=".8" />
            {bands.map((row, i) => (
                <circle key={`dot-${row.lbl}`} cx={xC(i)} cy={pad.top + yS(row.tgt)} r="4.5" fill="#fff" stroke="#1b2e4b" strokeWidth="2" />
            ))}
        </svg>
    );
}

export default function LandingPage({ canRegister }: { canRegister?: boolean }) {
    const theme: 'dark' | 'light' = 'dark';
    const lang: 'ko' | 'en' = 'ko';
    const [factorA, setFactorA] = useState(20);
    const [factorB, setFactorB] = useState(85);

    // Benchmark bar chart: value-proportional bars for clear visual comparison.
    const minBenchmarkWidthPercent = 12;
    const benchmarkCardRows = [
        {
            label: '우리 회사',
            value: 100,
            keyName: 'our',
            isOurCompany: true,
            barBackground: 'linear-gradient(90deg, rgba(255,255,255,0.98), rgba(228,236,249,0.72))',
        },
        {
            label: '업종 전체',
            value: 127,
            keyName: 'industry',
            isOurCompany: false,
            barBackground: 'linear-gradient(90deg, #ff7d7d, #ff4e4e)',
        },
        {
            label: '타깃 경쟁사',
            value: 118,
            keyName: 'comp-a',
            isOurCompany: false,
            barBackground: 'linear-gradient(90deg, #ffc24a, #ff8a1f)',
        },
        {
            label: '유사 제조업',
            value: 108,
            keyName: 'comp-b',
            isOurCompany: false,
            barBackground: 'linear-gradient(90deg, rgba(241,196,15,0.95), rgba(156,163,175,0.85))',
        },
    ];
    const maxBenchmarkValue = Math.max(...benchmarkCardRows.map((r) => r.value), 1);
    const valueToPercent = (value: number) => Math.max(minBenchmarkWidthPercent, (value / maxBenchmarkValue) * 100);

    const bands = useMemo(() => calcBands(factorA / 100, factorB / 100), [factorA, factorB]);

    useEffect(() => {
        document.documentElement.classList.toggle('theme-light', theme === 'light');
    }, [theme]);

    useEffect(() => {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 },
        );
        const nodes = document.querySelectorAll('.reveal');
        nodes.forEach((node) => revealObserver.observe(node));
        return () => revealObserver.disconnect();
    }, []);

    useEffect(() => {
        const barObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.querySelectorAll('.bm-bar-fill').forEach((bar, i) => {
                        window.setTimeout(() => bar.classList.add('animated'), i * 120);
                    });
                    barObserver.unobserve(entry.target);
                });
            },
            { threshold: 0.3 },
        );
        const card = document.getElementById('benchmark-card');
        if (card) barObserver.observe(card);
        return () => barObserver.disconnect();
    }, []);

    return (
        <>
            <Head title="HR Pathfinder — 전문가 수준의 HR 설계" />
            <style>{`
                :root { --navy-deepest:#060d1a; --navy-deep:#0a1628; --navy-mid:#0f2040; --navy-light:#1a3260; --teal:#00c9a7; --teal-dim:#00a087; --gold:#f0b429; --text-primary:#e8edf5; --text-secondary:#8ba3c4; --text-muted:#4a6080; --border:rgba(255,255,255,0.07); --border-teal:rgba(0,201,167,0.3); }
                .theme-light { --navy-deepest:#eef2f8; --navy-deep:#f7f9fc; --navy-mid:#ffffff; --navy-light:#dbe6f5; --text-primary:#10213a; --text-secondary:#385170; --text-muted:#667a95; --border:rgba(20,40,70,0.13); --border-teal:rgba(0,160,135,.35); }
                .landing-wrap * { box-sizing:border-box; } .landing-wrap { font-family:'Pretendard' , sans-serif; background:var(--navy-deepest); color:var(--text-primary); overflow-x:hidden; }
                .section-label{display:inline-flex;align-items:center;gap:6px;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--teal);margin-bottom:16px;}
                .section-label::before{content:'';display:block;width:16px;height:1px;background:var(--teal);}
                .reveal{opacity:0;transform:translateY(24px);transition:opacity .6s ease, transform .6s ease;} .reveal.visible{opacity:1;transform:translateY(0);}
                .bm-bar-fill{transition:width 1.2s cubic-bezier(0.16,1,0.3,1);}
                .bm-bar-fill.animated{opacity:1;}
            `}</style>
            <div className="landing-wrap">
                <LandingNav isAuthenticated={false} canRegister={canRegister ?? false} />

                <section id="hero" className="min-h-screen pt-[120px] pb-20 px-4 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center relative">
                    <div className="absolute inset-0 pointer-events-none [background-image:linear-gradient(rgba(0,201,167,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,201,167,.04)_1px,transparent_1px)] [background-size:48px_48px]" />
                    <div className="absolute top-[10%] left-[45%] w-[600px] h-[600px] pointer-events-none bg-[radial-gradient(circle,rgba(0,201,167,.08)_0%,transparent_70%)]" />
                    <div className="relative z-[1]">
                        <div className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[.72rem] font-semibold mb-7" style={{ borderColor: 'var(--border-teal)', color: 'var(--teal)', background: 'rgba(0,201,167,.08)' }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--teal)' }} />
                            조직성장의 속도를 견인하는 HR 정책설계 파워 엔진
                        </div>
                        <h1 className="text-[clamp(2.2rem,4vw,3.2rem)] font-extrabold leading-[1.18] tracking-[-.04em] mb-5">
                            조직의 외형에 맞는
                            <br />
                            체계가 없으면
                            <br />
                            <span style={{ color: 'var(--teal)' }}>
                                불필요한 갈등으로
                                <br />
                                조직 역량이 분산됩니다.
                            </span>
                        </h1>
                        <p className="text-base leading-[1.75] mb-9 max-w-[460px]" style={{ color: 'var(--text-secondary)' }}>
                            일반 컨설팅의 1/4 금액으로 내부 HR 역량 육성과 전문 제도설계 서비스를 모두 받아보세요.
                        </p>
                        <div className="flex flex-wrap gap-3 items-center mb-12">
                            <Link href={contactHref} className="inline-flex items-center gap-2 rounded-lg px-7 py-3.5 font-bold text-[.92rem] text-white no-underline" style={{ background: 'var(--teal)' }}>
                                서비스 문의하기 →
                            </Link>
                            <Link href="/contact" className="inline-flex items-center rounded-lg px-6 py-3.5 text-[.88rem] font-semibold no-underline border" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                전문 컨설팅펌, 베러컴퍼니가 만든 SaaS →
                            </Link>
                        </div>
                        <div className="flex gap-8 flex-wrap">
                            <div><div className="text-3xl font-extrabold leading-none" style={{ color: 'var(--gold)' }}>1개월</div><div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>평균 제도설계 완료</div></div>
                            <div><div className="text-3xl font-extrabold leading-none" style={{ color: 'var(--gold)' }}>1/4</div><div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>일반 컨설팅 대비 비용</div></div>
                            <div><div className="text-3xl font-extrabold leading-none" style={{ color: 'var(--gold)' }}>5</div><div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>단계 순차 HR 설계</div></div>
                        </div>
                    </div>

                    <div id="benchmark-card" className="relative z-[1]">
                        <div className="rounded-2xl overflow-hidden border shadow-[0_40px_80px_rgba(0,0,0,.5)]" style={{ background: 'var(--navy-deep)', borderColor: 'var(--border)' }}>
                            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_var(--teal)]" style={{ background: 'var(--teal)' }} />
                                    <div className="text-[.8rem] font-bold tracking-[.03em]" style={{ color: 'var(--text-secondary)' }}>보상지수 벤치마크 · HR Pathfinder</div>
                                </div>
                                <span className="text-[.62rem] font-bold tracking-[.1em] px-2 py-1 rounded border" style={{ color: 'var(--gold)', borderColor: 'rgba(240,180,41,.3)' }}>
                                    BENCHMARK
                                </span>
                            </div>
                            <div className="p-6">
                                <div className="text-[.78rem] font-bold mb-5" style={{ color: 'var(--text-secondary)' }}>연간 총보상 수준 (Annual Total Pay Level) — 귀사 기준 100, 시장 비교</div>
                                {benchmarkCardRows.map((row) => (
                                    <div key={row.keyName} className="mb-4">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span
                                                className={`text-[.78rem] font-semibold ${row.isOurCompany ? '' : 'opacity-90'}`}
                                                style={{ color: row.isOurCompany ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                                            >
                                                {row.label}
                                            </span>
                                            <span
                                                className={`text-[.85rem] font-extrabold ${row.isOurCompany ? '' : 'opacity-75'}`}
                                                style={{ color: row.isOurCompany ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                                            >
                                                {row.value}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded relative" style={{ background: 'rgba(255,255,255,.06)' }}>
                                            <div
                                                className={`bm-bar-fill ${row.keyName}`}
                                                style={{
                                                    borderRadius: '5px',
                                                    height: '100%',
                                                    width: `${Math.round(valueToPercent(row.value))}%`,
                                                    background: row.barBackground,
                                                    opacity: 0.98,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-5 p-4 rounded-lg border text-[.76rem] leading-relaxed" style={{ background: 'rgba(0,201,167,.06)', borderColor: 'var(--border-teal)', color: 'var(--text-secondary)' }}>
                                    <strong style={{ color: 'var(--teal)' }}>업종 대비 보상 경쟁력 약 22% 부족</strong> — 이 분석이 HR 시스템 리포트에 포함되어 납품됩니다.
                                </div>
                            </div>
                            <div className="px-6 py-3.5 border-t flex justify-between text-[.68rem]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                <span>2025년 2분기 기준 · 74인 규모</span>
                                <span className="font-bold">HR Pathfinder</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="px-4 md:px-12 border-y" style={{ borderColor: 'var(--border)', background: 'var(--navy-deep)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            '전문 HR 컨설팅팀 베러컴퍼니가 만든 제도설계 플랫폼',
                            '평균 1개월 내 제도설계 완료',
                            '컨설팅팀 대비 압도적인 가격 경쟁력',
                            '경쟁사 보상지수 벤치마크 포함',
                        ].map((item) => (
                            <div key={item} className="px-5 py-4 border-r text-[.78rem]" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <section id="roi" className="py-24 px-4 md:px-12">
                    <div className="max-w-[960px] mx-auto reveal">
                        <div className="section-label">ROI 비교</div>
                        <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold tracking-[-.04em] mb-3">일반 컨설팅 대비 Pathfinder</h2>
                        <p className="text-[.95rem] mb-12 max-w-[520px]" style={{ color: 'var(--text-secondary)' }}>산출물의 품질은 동일합니다. 비용과 시간, 그리고 내부 역량이 달라집니다.</p>
                        <table className="w-full border-collapse border overflow-hidden rounded-xl" style={{ borderColor: 'var(--border)' }}>
                            <thead>
                                <tr>
                                    <th className="p-4 text-left text-[.78rem] font-bold" style={{ color: 'var(--text-muted)', background: 'var(--navy-deep)' }}>구분</th>
                                    <th className="p-4 text-left text-[.78rem] font-bold border-x-2" style={{ color: 'var(--teal)', background: 'rgba(0,201,167,.09)', borderColor: 'var(--teal)' }}>HR Pathfinder</th>
                                    <th className="p-4 text-left text-[.78rem] font-bold" style={{ color: 'var(--text-muted)', background: 'var(--navy-mid)' }}>일반 컨설팅</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['제도 설계 기간', '평균 1개월', '2~8개월'],
                                    ['비용', 'SaaS 요금', '수천만원~수억원'],
                                    ['내부 역량 축적', '직접 설계 참여', '외부 의존'],
                                    ['산출물', '정책 대시보드 + 종합 리포트', 'PPT 장표'],
                                    ['보상 벤치마크', '업종·경쟁사 비교', '별도 비용'],
                                ].map(([label, good, bad]) => (
                                    <tr key={label}>
                                        <td className="p-4 border-t text-[.8rem]" style={{ borderColor: 'var(--border)', background: 'var(--navy-deep)', color: 'var(--text-secondary)' }}>{label}</td>
                                        <td className="p-4 border-t border-x-2 font-bold text-[.85rem]" style={{ borderColor: 'rgba(0,201,167,.2)', background: 'rgba(0,201,167,.05)', color: 'var(--teal)' }}>✓ {good}</td>
                                        <td className="p-4 border-t text-[.85rem]" style={{ borderColor: 'var(--border)', background: 'var(--navy-mid)', color: 'var(--text-muted)' }}>✕ {bad}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="mt-3 text-center text-[.68rem]" style={{ color: 'var(--text-muted)' }}>* 제도 설계 범위와 컨설팅팀에 따라 상이할 수 있습니다.</p>
                    </div>
                </section>

                <section id="process" className="py-24 px-4 md:px-12" style={{ background: 'var(--navy-deep)' }}>
                    <div className="max-w-[1100px] mx-auto">
                        <div className="reveal mb-14">
                            <div className="section-label">HR 데이터 빌드업 프로세스</div>
                            <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold tracking-[-.04em] leading-tight">
                                단순한 입력이 아닙니다.
                                <br />
                                <span style={{ color: 'var(--teal)' }}>우리 회사의 HR 데이터를 정교하게 정렬</span>하는 과정입니다.
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 reveal">
                            {[
                                ['01', '조직 진단', '현재 조직 구조, 직무 분포, 인력 구성을 진단합니다.'],
                                ['02', '경영 철학', '조직의 핵심 가치와 경영 방향성을 구체화합니다.'],
                                ['03', '직무 분석', '사내 직군과 직무를 체계적으로 정렬합니다.'],
                                ['04', '성과 체계 설계', '평가 프로세스와 목표 관리를 직무 특성 기반으로 설계합니다.'],
                                ['05', '보상 구조 설계', '보상 벤치마크를 기반으로 경쟁력 있는 보상 구조를 완성합니다.'],
                            ].map(([num, title, desc]) => (
                                <div key={num}>
                                    <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center mb-4" style={{ borderColor: 'var(--teal)', background: 'var(--navy-deepest)' }}>
                                        <span className="text-xs font-extrabold" style={{ color: 'var(--teal)' }}>{num}</span>
                                    </div>
                                    <h3 className="text-[.95rem] font-bold mb-2">{title}</h3>
                                    <p className="text-[.8rem] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="payband-showcase" className="py-24 px-4 md:px-12 bg-[#f0f2f5]">
                    <div className="max-w-[960px] mx-auto reveal">
                        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
                            <div>
                                <div className="section-label !text-[#1d9e75] before:!bg-[#1d9e75]">산출물 미리보기</div>
                                <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] text-[#1b2e4b] font-extrabold tracking-[-.04em]">이렇게 <span className="text-[#1d9e75]">Pay Band</span>가 만들어집니다.</h2>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-[.7rem] font-bold uppercase tracking-[.06em] text-[#92400e] border border-[rgba(217,119,6,.3)] bg-[#fef3c7]">
                                인터랙티브 샘플
                            </span>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-white border border-[rgba(27,46,75,.18)] shadow-[0_4px_24px_rgba(27,46,75,.1)]">
                            <div className="p-4 border-b border-[rgba(27,46,75,.10)] bg-[#f7f8fa] grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="rounded-lg bg-[#1b2e4b] p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[.6rem] font-bold tracking-[.09em] text-white/45 uppercase">Factor A</span>
                                        <span className="text-[1.6rem] leading-none font-extrabold text-white">{factorA}%</span>
                                    </div>
                                    <input type="range" min={5} max={45} value={factorA} onChange={(e) => setFactorA(Number(e.target.value))} className="w-full" />
                                </div>
                                <div className="rounded-lg bg-[#1b2e4b] p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[.6rem] font-bold tracking-[.09em] text-white/45 uppercase">Factor B</span>
                                        <span className="text-[1.6rem] leading-none font-extrabold text-white">{factorB}%</span>
                                    </div>
                                    <input type="range" min={60} max={95} value={factorB} onChange={(e) => setFactorB(Number(e.target.value))} className="w-full" />
                                </div>
                            </div>
                            <div className="p-4">
                                <PayBandChart bands={bands} />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="trust" className="py-24 px-4 md:px-12">
                    <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="reveal">
                            <div className="section-label">왜 신뢰할 수 있는가</div>
                            <h2 className="text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold tracking-[-.04em] leading-tight">
                                전문 HR 컨설턴트가
                                <br />
                                <span style={{ color: 'var(--teal)' }}>전체 설계를 직접 검수합니다.</span>
                            </h2>
                            <p className="mt-4 text-[.9rem] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                시스템이 설계하고, 컨설턴트가 리포트로 보증합니다.
                            </p>
                        </div>
                        <div className="reveal">
                            {[
                                ['귀사가 직접 진단합니다', '조직 구조, 직무 정의, 성과 체계, 보상 기준을 단계적으로 입력합니다.'],
                                ['HR 컨설턴트가 분석합니다', '입력된 데이터를 바탕으로 산업·규모·문화에 맞게 체계를 설계합니다.'],
                                ['HR 시스템 리포트로 납품됩니다', '컨설턴트가 서명한 리포트가 PDF로 제공됩니다.'],
                            ].map(([title, desc]) => (
                                <div key={title} className="py-6 border-b" style={{ borderColor: 'var(--border)' }}>
                                    <h3 className="text-[.88rem] font-bold mb-1">{title}</h3>
                                    <p className="text-[.78rem] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="cta" className="py-24 px-4 md:px-12 text-center" style={{ background: 'var(--navy-deep)' }}>
                    <div className="max-w-[680px] mx-auto reveal">
                        <div className="section-label justify-center">지금 시작하세요</div>
                        <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-[-.05em] leading-tight mb-3">
                            HR 제도설계,
                            <br />
                            <span style={{ color: 'var(--teal)' }}>지금 바로 시작할 수 있습니다.</span>
                        </h2>
                        <p className="text-[.95rem] mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            20~300인 규모의 기업이라면 패스파인더가 가장 빠르고 전문적인 HR 제도설계 경로입니다.
                        </p>
                        <Link href={contactHref} className="inline-flex items-center rounded-lg px-8 py-3.5 font-bold text-white no-underline" style={{ background: 'var(--teal)' }}>
                            서비스 문의하기 →
                        </Link>
                    </div>
                </section>

                <footer className="py-8 px-4 md:px-12 border-t flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderColor: 'var(--border)', background: 'var(--navy-deepest)' }}>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>HR <span style={{ color: 'var(--teal)' }}>Pathfinder</span> by BetterCompany</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2025 (주)에버데어. All rights reserved.</div>
                    <Link href={contactHref} className="text-xs no-underline" style={{ color: 'var(--text-muted)' }}>
                        문의하기
                    </Link>
                </footer>
            </div>
        </>
    );
}
