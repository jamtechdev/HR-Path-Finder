import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import { login, register, dashboard } from '@/routes';

interface HeroRevisionProps {
    canRegister?: boolean;
    isAuthenticated?: boolean;
    dashboardUrl?: string;
    badge?: string;
    headline?: React.ReactNode;
    sub?: string;
    primaryButton?: string;
    firmSub?: string;
    firmName?: string;
    firmUrl?: string;
}

export function HeroRevision({
    canRegister = true,
    isAuthenticated = false,
    dashboardUrl = '/hr-manager/dashboard',
    badge = '조직성장의 속도를 견인하는 HR정책설계 파워 엔진',
    headline,
    sub = '일반 컨설팅의 1/4 금액으로 내부 HR 역량 육성과 전문 제도설계 서비스를 모두 받아보세요.',
    primaryButton = '서비스 문의하기',
    firmSub = '전문 컨설팅펌이 만든 SaaS',
    firmName = '베러컴퍼니 →',
    firmUrl = 'https://better.odw.co.kr',
}: HeroRevisionProps) {
    const defaultHeadline = (
        <>
            조직은 커지는데
            <br />
            제도가 없으면
            <br />
            불필요한 갈등이
            <br />
            <em className="not-italic text-[#2ECFAB]">조직 역량을 갉아 먹습니다.</em>
        </>
    );

    return (
        <section className="min-h-screen bg-[#0B1E3D] grid grid-cols-1 lg:grid-cols-2 items-center pt-24 pb-20 px-12 md:px-20 gap-12 relative overflow-hidden">
            <div className="absolute top-[-200px] right-[-200px] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(46,207,171,0.08)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(200,168,75,0.06)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#2ECFAB]/30 bg-[#2ECFAB]/10 px-4 py-1.5 text-xs font-semibold text-[#2ECFAB] tracking-wide mb-7">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2ECFAB] animate-pulse" />
                    {badge}
                </div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-white mb-6">
                    {headline ?? defaultHeadline}
                </h1>
                <p className="text-[17px] text-white/65 leading-relaxed mb-10 max-w-[480px]">
                    {sub}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                    <Link
                        href={isAuthenticated ? dashboardUrl : (canRegister ? register() : login())}
                        className="inline-flex items-center gap-2 bg-[#2ECFAB] text-[#0B1E3D] font-bold px-8 py-4 rounded-lg text-base no-underline transition-all shadow-[0_8px_32px_rgba(46,207,171,0.3)] hover:bg-[#7EE8D0] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(46,207,171,0.4)]"
                    >
                        {primaryButton}
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                    <a
                        href={firmUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col justify-center border border-[#2ECFAB]/35 bg-[#2ECFAB]/[0.06] text-white/90 py-3.5 px-5 rounded-lg no-underline transition-colors hover:bg-[#2ECFAB]/10 hover:border-[#2ECFAB]/60 leading-snug"
                    >
                        <span className="text-[11px] font-normal text-white/45 uppercase tracking-wider mb-1">{firmSub}</span>
                        <span className="text-base font-bold text-[#2ECFAB] tracking-wide">{firmName}</span>
                    </a>
                </div>
            </div>

            <div className="relative hidden lg:block">
                <div className="bg-white rounded-2xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)] transform perspective-[1000px] rotate-y-[-4deg] rotate-x-[2deg] transition-transform duration-300 hover:rotate-y-[-1deg] hover:rotate-x-0">
                    <div className="bg-[#0B1E3D] px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#2ECFAB]" />
                            <span className="text-white text-[13px] font-semibold">HR Pathfinder · 분석 리포트</span>
                        </div>
                        <span className="bg-[#2ECFAB]/15 border border-[#2ECFAB] text-[#2ECFAB] text-[10px] font-bold py-0.5 px-2.5 rounded-full tracking-wider">
                            EXPERT REVIEWED
                        </span>
                    </div>
                    <div className="p-6">
                        <div className="font-serif text-xl font-bold text-[#0B1E3D] mb-1">㈜베터컴퍼니</div>
                        <div className="text-xs text-[#6B82A0] mb-5">HR 시스템 설계 분석 리포트 · 2025년 2분기 · 74인 규모</div>
                        <div className="text-[11px] font-bold text-[#2ECFAB] uppercase tracking-widest mb-3">조직 진단 스코어</div>
                        {[
                            { label: '조직 구조 명확성', value: 78 },
                            { label: '직무 정의 완성도', value: 61 },
                            { label: '성과 측정 체계', value: 45 },
                            { label: '보상 공정성 지수', value: 52 },
                        ].map((row) => (
                            <div key={row.label} className="flex items-center justify-between mb-2.5">
                                <span className="text-[13px] text-[#3D5068] font-medium">{row.label}</span>
                                <div className="flex-1 mx-3 h-1.5 bg-[#EEF0F4] rounded-sm overflow-hidden">
                                    <div className="h-full rounded-sm bg-gradient-to-r from-[#2ECFAB] to-[#7EE8D0]" style={{ width: `${row.value}%` }} />
                                </div>
                                <span className="text-[13px] font-bold text-[#0B1E3D] min-w-[30px] text-right">{row.value}</span>
                            </div>
                        ))}
                        <hr className="border-0 border-t border-[#EEF0F4] my-4" />
                        <div className="text-[11px] font-bold text-[#2ECFAB] uppercase tracking-widest mb-3">전문가 핵심 인사이트</div>
                        <div className="bg-[#F4FBF9] border-l-4 border-[#2ECFAB] rounded px-3.5 py-3 text-xs text-[#3D5068] leading-relaxed mb-3.5">
                            현 보상 구조는 성과 기여도와 연동이 약합니다. OKR 기반 성과급 밴드를 재설계하면 상위 20% 인재 유지율을 약 30% 개선할 수 있을 것으로 분석됩니다.
                        </div>
                        <div className="text-[11px] font-bold text-[#2ECFAB] uppercase tracking-widest mb-3">직급별 Pay Band 권고안</div>
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr>
                                    <th className="bg-[#0B1E3D] text-white/80 py-2 px-2.5 text-left font-semibold">직급</th>
                                    <th className="bg-[#0B1E3D] text-white/80 py-2 px-2.5 text-left font-semibold">하한 (만원)</th>
                                    <th className="bg-[#0B1E3D] text-white/80 py-2 px-2.5 text-left font-semibold">상한 (만원)</th>
                                    <th className="bg-[#0B1E3D] text-white/80 py-2 px-2.5 text-left font-semibold">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td className="py-2 px-2.5 border-b border-[#EEF0F4] text-[#3D5068]">G1 · 사원</td><td className="py-2 px-2.5 border-b border-[#EEF0F4] text-[#3D5068]">3,200</td><td className="py-2 px-2.5 border-b border-[#EEF0F4] text-[#3D5068]">3,800</td><td className="py-2 px-2.5 border-b border-[#EEF0F4]"><span className="bg-[#E6FAF6] text-[#1A8C6F] text-[10px] font-bold py-0.5 px-2 rounded-full">적정</span></td></tr>
                                <tr><td className="py-2 px-2.5 border-b border-[#EEF0F4] text-[#3D5068]">G3 · 대리</td><td className="py-2 px-2.5 border-b border-[#EEF0F4] text-[#3D5068]">4,100</td><td className="py-2 px-2.5 border-b border-[#EEF0F4] text-[#3D5068]">5,200</td><td className="py-2 px-2.5 border-b border-[#EEF0F4]"><span className="bg-[#FFF8E7] text-[#8B6A1A] text-[10px] font-bold py-0.5 px-2 rounded-full">재검토</span></td></tr>
                                <tr><td className="py-2 px-2.5 text-[#3D5068]">G5 · 팀장</td><td className="py-2 px-2.5 text-[#3D5068]">6,500</td><td className="py-2 px-2.5 text-[#3D5068]">8,400</td><td className="py-2 px-2.5"><span className="bg-[#E6FAF6] text-[#1A8C6F] text-[10px] font-bold py-0.5 px-2 rounded-full">적정</span></td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-[#F8F9FB] px-6 py-3.5 flex items-center justify-between border-t border-[#EEF0F4]">
                        <span className="text-[11px] text-[#6B82A0]">컨설턴트 검수 완료 · 2025.06</span>
                        <span className="text-[11px] font-bold text-[#0B1E3D]">HR Pathfinder</span>
                    </div>
                </div>
                <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 bg-[#1E3A5F] border border-[#2ECFAB]/15 text-white/60 text-[11px] font-medium py-1.5 px-4 rounded-full whitespace-nowrap">
                    실제 리포트 미리보기 (샘플)
                </div>
            </div>
        </section>
    );
}
