import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import type { DiagnosisQuestion } from '../types';

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

const JOURNEY_CHIPS = [
    'Vision & Mission',
    'Management Philosophy',
    'Growth Stage',
    'Leadership',
    'General Questions',
    'Org Issues',
];

const AI_TAGS = ['Talent Strategy', 'Org Design', 'Compensation Model', 'Leadership Capability', 'Culture & Engagement'];

interface ConcernsStepProps {
    question?: DiagnosisQuestion | null;
    value: string;
    onChange: (value: string) => void;
}

export default function ConcernsStep({ question, value, onChange }: ConcernsStepProps) {
    const [selectedCat, setSelectedCat] = useState<string | null>(null);
    const charCount = value.length;
    const scaffoldText = selectedCat ? (SCAFFOLDS[selectedCat] ?? '') : '';

    const handleSelectCat = (catId: string) => {
        if (selectedCat === catId) {
            setSelectedCat(null);
            return;
        }
        setSelectedCat(catId);
        if (!value.trim() && SCAFFOLDS[catId]) {
            onChange(SCAFFOLDS[catId].replace(/\[([^\]]+)\]/g, '$1'));
        }
    };

    return (
        <div className="w-full max-w-[760px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Finale hero */}
            <div className="bg-[#0E1628] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-[-60px] right-[-40px] w-[220px] h-[220px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.25)_0%,transparent_65%)] pointer-events-none" />
                <div className="absolute bottom-[-40px] left-[-20px] w-[140px] h-[140px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.1)_0%,transparent_65%)] pointer-events-none" />
                <div className="flex flex-wrap items-center gap-2 mb-4 relative">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/25 rounded-lg px-2.5 py-1">
                        Final Step · 8 of 8
                    </span>
                    <span className="text-[10px] font-semibold text-white bg-[#2E9E6B] rounded-lg px-2.5 py-1 flex items-center gap-1">
                        ✓ All steps complete
                    </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-[26px] font-bold text-white leading-tight mb-2.5 relative">
                    Your philosophy is nearly <span className="text-[#E8C96B]">on record.</span>
                </h1>
                <p className="text-[13px] text-white/60 font-light leading-relaxed max-w-[520px] relative mb-6">
                    Eight stages of thinking, distilled into a framework your organization will be built around. One last question remains — and it may be the most revealing of all.
                </p>
                <div className="flex flex-wrap gap-1.5 relative">
                    {JOURNEY_CHIPS.map((label) => (
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
                        AI Pathfinder will analyze your response to generate your Top 3 Priority Actions.
                    </strong>
                    <p className="text-[12.5px] text-white/55 font-light leading-relaxed">
                        The more specific your concern, the more targeted the output. Vague answers produce generic recommendations — your precision here directly determines the value of your final report.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {AI_TAGS.map((tag) => (
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
            <div className="bg-white border-[1.5px] border-[#E2DDD4] rounded-xl overflow-hidden animate-in fade-in duration-300">
                <div className="p-4 sm:p-5 border-b border-[#E2DDD4] flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-[#0E1628] flex items-center justify-center text-lg">
                        💬
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-medium uppercase tracking-wider text-[#9A9EB8] mb-1">
                            CEO&apos;s Final Input
                        </div>
                        <div className="text-sm sm:text-[14.5px] font-normal text-[#1A1A2E] leading-snug">
                            {question?.question_text ?? "What is the biggest people or organizational challenge you are currently facing?"}
                            <span className="text-red-500 ml-0.5">*</span>
                        </div>
                    </div>
                </div>

                {/* Category chips (optional) */}
                <div className="px-4 sm:px-5 pt-4">
                    <div className="text-[10.5px] font-medium uppercase tracking-wider text-[#9A9EB8] mb-2.5">
                        Where does your biggest concern live? (optional — select to get a writing prompt)
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORY_CHIPS.map(({ id, icon, label }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => handleSelectCat(id)}
                                className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1.5 text-[12.5px] font-normal transition-colors ${
                                    selectedCat === id
                                        ? 'bg-[#0E1628] border-[#0E1628] text-white'
                                        : 'bg-[#F8F4ED] border-[#E2DDD4] text-[#4A4E69] hover:border-[#0E1628] hover:text-[#0E1628]'
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
                    <div className="mx-4 sm:mx-5 mt-4 p-4 rounded-lg bg-[#C9A84C]/5 border border-[#C9A84C]/20">
                        <div className="text-[10px] font-medium uppercase tracking-wider text-[#8A6820] mb-2">
                            ✍️ Writing Prompt — edit the sentence below as a starting point
                        </div>
                        <p className="text-[12.5px] text-[#4A4E69] font-light leading-relaxed">
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
                    <Textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="e.g. We are struggling with [talent acquisition] due to [compensation limits]. The most urgent pressure point is [senior manager attrition], which puts our [2025 growth plan] at risk."
                        rows={6}
                        className="min-h-[140px] rounded-lg border-[1.5px] border-[#E2DDD4] bg-[#F8F4ED] text-[13.5px] font-light text-[#1A1A2E] leading-relaxed focus:border-[#0E1628] focus:bg-white resize-y"
                    />
                    <div className="flex flex-wrap justify-between items-center gap-2 mt-2">
                        <span className={`text-[11px] ${charCount >= 100 ? 'text-[#2E9E6B]' : 'text-[#9A9EB8]'}`}>
                            {charCount} characters{charCount >= 100 ? ' ✓' : ''}
                        </span>
                        <span className="text-[11.5px] text-[#9A9EB8] italic">
                            Aim for 3–5 sentences for best AI output quality
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
