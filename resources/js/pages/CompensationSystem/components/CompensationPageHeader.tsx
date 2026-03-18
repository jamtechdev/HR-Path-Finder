import React from 'react';
import { cn } from '@/lib/utils';

interface CompensationPageHeaderProps {
    eyebrowTag: string;
    stepLabel: string;
    title: string;
    titleAccent?: string;
    description: string;
    completionPct?: number;
    className?: string;
}

export default function CompensationPageHeader({
    eyebrowTag,
    stepLabel,
    title,
    titleAccent,
    description,
    completionPct,
    className,
}: CompensationPageHeaderProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-t-xl bg-gradient-to-br from-[#0f1c30] to-[#1a2f52] px-8 py-9',
                className
            )}
        >
            <div className="absolute -top-12 -right-12 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(46,196,160,0.08)_0%,transparent_70%)] pointer-events-none" />
            <div className="flex items-end justify-between gap-6 flex-wrap relative">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-[#2ec4a0] bg-[rgba(46,196,160,0.12)] border border-[rgba(46,196,160,0.25)] px-2 py-0.5 rounded-full">
                            {eyebrowTag}
                        </span>
                        <span className="text-[11px] text-white/35 font-normal">{stepLabel}</span>
                    </div>
                    <h1 className="font-serif text-3xl font-light text-white tracking-tight leading-tight mb-2">
                        {title}
                        {titleAccent != null && <em className="text-[#2ec4a0] not-italic"> {titleAccent}</em>}
                    </h1>
                    <p className="text-[13px] text-white/45 leading-relaxed max-w-[500px] font-light">
                        {description}
                    </p>
                </div>
                {completionPct != null && (
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center">
                            <div className="relative w-16 h-16">
                                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                                    <circle
                                        cx="32" cy="32" r="26"
                                        fill="none" stroke="#2ec4a0" strokeWidth="4" strokeLinecap="round"
                                        strokeDasharray={163} strokeDashoffset={163 - (163 * Math.min(100, completionPct)) / 100}
                                        className="transition-[stroke-dashoffset] duration-500"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-sm font-bold text-white leading-none">{Math.round(completionPct)}%</span>
                                    <span className="text-[8px] text-white/35 uppercase tracking-wider mt-0.5">Done</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
