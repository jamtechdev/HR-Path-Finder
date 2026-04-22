import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import type { DiagnosisQuestion, QuestionMetadata } from '../types';
import { usePhilosophyText } from '../uiText';

const SCAFFOLDS: Record<string, string> = {
    talent: 'Our company is currently facing challenges in [talent acquisition] due to [compensation competitiveness]. The most urgent pressure point is [key role vacancies], which is directly impacting [team performance / growth targets].',
    performance: 'Our performance system has gaps — specifically around [evaluation criteria clarity]. This has led to [low trust in the review process], and we are concerned about [high performers disengaging].',
    leadership: 'We have a leadership capability issue at the [middle management] level. Despite strong individual contributors, the gap in [people management skills] is causing [team attrition and execution delays].',
    culture: 'Employee engagement has declined significantly, particularly in [specific departments]. The root cause appears to be [unclear values and recognition], and we risk losing [our collaborative culture] as we scale.',
    org: 'Our organizational structure is [not scaling well with growth]. Role overlaps and unclear R&R are causing [decision-making bottlenecks], and we need to redesign [team boundaries and accountability].',
    other: 'Our most pressing concern is [describe your area]. The core issue stems from [root cause], and if left unaddressed, the risk is [describe impact].',
};

const CATEGORY_CHIPS: { id: string; icon: string; label: string }[] = [
    { id: 'talent', icon: '🎯', label: 'Talent Acquisition' },
    { id: 'performance', icon: '📊', label: 'Performance System' },
    { id: 'leadership', icon: '🎖️', label: 'Leadership' },
    { id: 'culture', icon: '🌱', label: 'Culture & Engagement' },
    { id: 'org', icon: '🏛️', label: 'Org Structure' },
    { id: 'other', icon: '🔧', label: 'Other' },
];
const CATEGORY_CHIPS_KO: { id: string; icon: string; label: string }[] = [
    { id: 'talent', icon: '🎯', label: '인재 채용' },
    { id: 'performance', icon: '📊', label: '성과관리 체계' },
    { id: 'leadership', icon: '🎖️', label: '리더십' },
    { id: 'culture', icon: '🌱', label: '조직문화/몰입' },
    { id: 'org', icon: '🏛️', label: '조직 구조' },
    { id: 'other', icon: '🔧', label: '기타' },
];

const JOURNEY_CHIPS = [
    'Vision & Mission',
    'Management Philosophy',
    'Growth Stage',
    'Leadership',
    'General Questions',
    'Org Issues',
];
const JOURNEY_CHIPS_KO = ['비전·미션', '경영 철학', '성장 단계', '리더십', '일반 문항', '조직 이슈'];

const AI_TAGS = ['Talent Strategy', 'Org Design', 'Compensation Model', 'Leadership Capability', 'Culture & Engagement'];
const AI_TAGS_KO = ['인재 전략', '조직 설계', '보상 모델', '리더십 역량', '조직문화/몰입'];

interface ConcernsStepProps {
    question?: DiagnosisQuestion | null;
    value: string;
    onChange: (value: string) => void;
    showError?: boolean;
}

export default function ConcernsStep({ question, value, onChange, showError = false }: ConcernsStepProps) {
    const { isKo } = usePhilosophyText();
    const meta = ((question?.metadata || {}) as QuestionMetadata);
    const [selectedCat, setSelectedCat] = useState<string | null>(null);
    const charCount = value.length;
    const scaffolds = isKo ? (meta.scaffolds_ko || meta.scaffolds || SCAFFOLDS) : (meta.scaffolds || SCAFFOLDS);
    const categoryChips = (() => {
        if (Array.isArray(meta.category_chips) && meta.category_chips.length > 0) {
            return meta.category_chips.map((chip) => ({
                id: chip.id,
                icon: chip.icon || '🔹',
                label: isKo ? (chip.label_ko || chip.label) : chip.label,
            }));
        }
        return isKo ? CATEGORY_CHIPS_KO : CATEGORY_CHIPS;
    })();
    const journeyChips = isKo ? (meta.journey_chips_ko || meta.journey_chips || JOURNEY_CHIPS_KO) : (meta.journey_chips || JOURNEY_CHIPS);
    const aiTags = isKo ? (meta.ai_tags_ko || meta.ai_tags || AI_TAGS_KO) : (meta.ai_tags || AI_TAGS);
    const scaffoldText = selectedCat ? (scaffolds[selectedCat] ?? '') : '';
    const hasError = showError && !value.trim();

    const handleSelectCat = (catId: string) => {
        if (selectedCat === catId) {
            setSelectedCat(null);
            return;
        }
        setSelectedCat(catId);
        if (!value.trim() && scaffolds[catId]) {
            onChange(scaffolds[catId].replace(/\[([^\]]+)\]/g, '$1'));
        }
    };

    return (
        <div className="w-full max-w-none mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Finale hero */}
            <div className="bg-[#0E1628] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-[-60px] right-[-40px] w-[220px] h-[220px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.25)_0%,transparent_65%)] pointer-events-none" />
                <div className="absolute bottom-[-40px] left-[-20px] w-[140px] h-[140px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.1)_0%,transparent_65%)] pointer-events-none" />
                <div className="flex flex-wrap items-center gap-2 mb-4 relative">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/25 rounded-lg px-2.5 py-1">
                        {isKo ? '최종 단계 · 8 / 8' : 'Final Step · 8 of 8'}
                    </span>
                    <span className="text-[10px] font-semibold text-white bg-[#2E9E6B] rounded-lg px-2.5 py-1 flex items-center gap-1">
                        ✓ {isKo ? '모든 단계 완료' : 'All steps complete'}
                    </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-[26px] font-bold text-white leading-tight mb-2.5 relative">
                    {(isKo ? meta.section_title_ko : meta.section_title)
                        ? (isKo ? meta.section_title_ko : meta.section_title)
                        : (isKo ? <>철학 정리가 거의 <span className="text-[#E8C96B]">완료되었습니다.</span></> : <>Your philosophy is nearly <span className="text-[#E8C96B]">on record.</span></>)}
                </h1>
                <p className="text-[13px] text-white/60 font-light leading-relaxed max-w-[520px] relative mb-6">
                    {(isKo ? meta.section_description_ko : meta.section_description) || (isKo
                        ? '8개 단계의 사고를 조직 실행 프레임으로 정리했습니다. 이제 마지막 한 문항만 남았습니다.'
                        : 'Eight stages of thinking, distilled into a framework your organization will be built around. One last question remains — and it may be the most revealing of all.')}
                </p>
                <div className="flex flex-wrap gap-1.5 relative">
                    {journeyChips.map((label) => (
                        <span
                            key={label}
                            className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-[11px] text-white/50 font-light"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2E9E6B] flex-shrink-0" />
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            {/* AI callout */}
            <div className="bg-gradient-to-br from-[#1A2540] to-[#0E1628] border border-[#C9A84C]/30 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row gap-4 relative overflow-hidden animate-in fade-in duration-300">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0E1628] via-[#C9A84C] to-[#0E1628]" />
                <div className="w-11 h-11 flex-shrink-0 rounded-lg bg-[#C9A84C]/15 border border-[#C9A84C]/30 flex items-center justify-center text-xl">
                    🤖
                </div>
                <div className="min-w-0 flex-1">
                    <strong className="block text-[13px] font-medium text-[#E8C96B] mb-1">
                        {(isKo ? meta.section_callout_title_ko : meta.section_callout_title) || (isKo
                            ? 'AI Pathfinder가 응답을 분석해 핵심 우선 실행과제 Top 3를 제안합니다.'
                            : 'AI Pathfinder will analyze your response to generate your Top 3 Priority Actions.')}
                    </strong>
                    <p className="text-[12.5px] text-white/55 font-light leading-relaxed">
                        {(isKo ? meta.section_callout_body_ko : meta.section_callout_body) || (isKo
                            ? '우려사항을 구체적으로 작성할수록 결과가 정밀해집니다. 모호한 답변은 일반적 권고로 이어지며, 이 문항의 정밀도가 최종 리포트의 품질을 결정합니다.'
                            : 'The more specific your concern, the more targeted the output. Vague answers produce generic recommendations — your precision here directly determines the value of your final report.')}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {aiTags.map((tag) => (
                            <span
                                key={tag}
                                className="text-[11px] text-white/40 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Concern card */}
            <div className="bg-white border-[1.5px] border-[#E2DDD4] rounded-xl overflow-hidden animate-in fade-in duration-300 dark:border-slate-700 dark:bg-slate-900">
                <div className="p-4 sm:p-5 border-b border-[#E2DDD4] flex flex-col sm:flex-row sm:items-start gap-3 dark:border-slate-700">
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-[#0E1628] flex items-center justify-center text-lg">
                        💬
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-medium uppercase tracking-wider text-[#9A9EB8] mb-1">
                            {isKo ? 'CEO 최종 입력' : "CEO's Final Input"}
                        </div>
                        <div className="text-sm sm:text-[14.5px] font-normal text-[#1A1A2E] leading-snug dark:text-slate-100">
                            {(isKo ? meta.question_text_ko : meta.question_text_en) ?? question?.question_text ?? (isKo ? '현재 가장 큰 인사/조직 과제는 무엇인가요?' : 'What is the biggest people or organizational challenge you are currently facing?')}
                            <span className="text-red-500 ml-0.5">*</span>
                        </div>
                    </div>
                </div>

                {/* Category chips (optional) */}
                <div className="px-4 sm:px-5 pt-4">
                    <div className="text-[10.5px] font-medium uppercase tracking-wider text-[#9A9EB8] mb-2.5 dark:text-slate-400">
                        {isKo
                            ? '가장 큰 우려가 있는 영역은 어디인가요? (선택사항 — 선택 시 작성 가이드 제공)'
                            : 'Where does your biggest concern live? (optional — select to get a writing prompt)'}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categoryChips.map(({ id, icon, label }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => handleSelectCat(id)}
                                className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1.5 text-[12.5px] font-normal transition-colors ${
                                    selectedCat === id
                                        ? 'bg-[#0E1628] border-[#0E1628] text-white'
                                        : 'bg-[#F8F4ED] border-[#E2DDD4] text-[#4A4E69] hover:border-[#0E1628] hover:text-[#0E1628] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100'
                                }`}
                            >
                                <span className="text-sm">{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sentence scaffold */}
                {scaffoldText && (
                    <div className="mx-4 sm:mx-5 mt-4 p-4 rounded-lg bg-[#C9A84C]/5 border border-[#C9A84C]/20 dark:bg-amber-900/10 dark:border-amber-700/40">
                        <div className="text-[10px] font-medium uppercase tracking-wider text-[#8A6820] mb-2">
                            {isKo ? '✍️ 작성 가이드 — 아래 문장을 시작점으로 수정해 주세요' : '✍️ Writing Prompt — edit the sentence below as a starting point'}
                        </div>
                        <p className="text-[12.5px] text-[#4A4E69] font-light leading-relaxed dark:text-slate-300">
                            {scaffoldText.split(/(\[[^\]]+\])/).map((part, i) =>
                                /^\[.+\]$/.test(part) ? (
                                    <span key={i} className="text-[#0E1628] font-medium border-b border-dashed border-[#C9A84C] px-0.5">
                                        {part.slice(1, -1)}
                                    </span>
                                ) : (
                                    <React.Fragment key={i}>{part}</React.Fragment>
                                )
                            )}
                        </p>
                    </div>
                )}

                {/* Textarea */}
                <div className="p-4 sm:p-5">
                    {hasError && (
                        <p className="mb-2 text-sm font-medium text-red-600">{isKo ? '제출 전에 가장 큰 우려사항을 작성해 주세요.' : 'Please describe your biggest concern before submitting.'}</p>
                    )}
                    <Textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={isKo ? '예) [보상 경쟁력] 이슈로 [핵심 인재 채용]에 어려움이 있습니다. 가장 시급한 문제는 [중간관리자 이탈]이며, 이는 [2025 성장 목표] 달성에 영향을 주고 있습니다.' : 'e.g. We are struggling with [talent acquisition] due to [compensation limits]. The most urgent pressure point is [senior manager attrition], which puts our [2025 growth plan] at risk.'}
                        rows={6}
                        className={`min-h-[140px] rounded-lg border-[1.5px] bg-[#F8F4ED] text-[13.5px] font-light text-[#1A1A2E] leading-relaxed focus:bg-white resize-y dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-700 dark:placeholder:text-slate-500 ${hasError ? 'border-red-300 focus:border-red-500 dark:border-red-500/60 dark:focus:border-red-400' : 'border-[#E2DDD4] focus:border-[#0E1628] dark:focus:border-slate-400'}`}
                    />
                    <div className="flex flex-wrap justify-between items-center gap-2 mt-2">
                        <span className={`text-[11px] ${charCount >= 100 ? 'text-[#2E9E6B]' : 'text-[#9A9EB8]'}`}>
                            {isKo ? `${charCount}자${charCount >= 100 ? ' ✓' : ''}` : `${charCount} characters${charCount >= 100 ? ' ✓' : ''}`}
                        </span>
                        <span className="text-[11.5px] text-[#9A9EB8] italic">
                            {isKo ? 'AI 품질 향상을 위해 3~5문장 작성을 권장합니다.' : 'Aim for 3–5 sentences for best AI output quality'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
