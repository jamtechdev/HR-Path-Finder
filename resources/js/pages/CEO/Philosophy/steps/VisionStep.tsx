import React from 'react';
import { Input } from '@/components/ui/input';
import type { DiagnosisQuestion, SurveyFormData, VisionChunkConfig } from '../types';
import { VISION_CHUNKS, KEYWORD_PRESETS } from '../constants';

interface VisionStepProps {
    currentChunk: number;
    onChunkChange: (index: number) => void;
    getChunkQuestions: (chunkIndex: number) => DiagnosisQuestion[];
    data: SurveyFormData;
    setData: (key: 'vision_mission', value: SurveyFormData['vision_mission']) => void;
}

export default function VisionStep({
    currentChunk,
    onChunkChange,
    getChunkQuestions,
    data,
    setData,
}: VisionStepProps) {
    const chunk = VISION_CHUNKS[currentChunk];
    const questions = getChunkQuestions(currentChunk);

    return (
        <div className="w-full space-y-6 sm:space-y-7">
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-[#0E1628] flex items-center justify-center text-2xl">
                    {chunk.icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-[#C9A84C] mb-1">{chunk.label}</div>
                    <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#0E1628] mb-1.5">{chunk.name}</h2>
                    <p className="text-[12px] sm:text-[13px] text-[#4A4E69] font-light leading-relaxed">{chunk.desc}</p>
                </div>
            </div>
            <div className="bg-[#0E1628] rounded-[10px] px-4 sm:px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 relative overflow-hidden">
                <div className="absolute -top-8 -right-5 w-[100px] h-[100px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.2)_0%,transparent_65%)]" />
                <span className="text-lg flex-shrink-0 relative">💡</span>
                <div className="relative min-w-0 flex-1">
                    <strong className="block text-[12px] sm:text-[13px] font-medium text-[#E8C96B] mb-0.5">{chunk.callout.title}</strong>
                    <span className="text-[11px] sm:text-[12px] text-white/55 font-light">{chunk.callout.body}</span>
                </div>
            </div>
            <div className="flex gap-1.5 flex-wrap mb-4">
                {VISION_CHUNKS.map((c, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onChunkChange(i)}
                        className={`h-7 px-3 rounded-full text-[11px] font-medium border transition-all ${
                            i === currentChunk ? 'bg-[#0E1628] border-[#0E1628] text-white' : 'bg-transparent border-[#E2DDD4] text-[#9A9EB8] hover:border-[#0E1628]/50'
                        }`}
                    >
                        {c.name}
                    </button>
                ))}
            </div>
            <div className="space-y-3">
                {questions.map((question, qi) => {
                    const qId = question.id.toString();
                    const val = data.vision_mission[qId];
                    const answered = val !== undefined && val !== null && (typeof val !== 'string' || val.trim() !== '') && (!Array.isArray(val) || (val as unknown[]).some((x) => String(x).trim()));
                    const isSegment = question.question_type === 'select' && (question.options?.length ?? 0) <= 4;
                    const isRevenue = question.question_type === 'number';
                    const isKeyword = question.question_type === 'text' && question.question_text.toLowerCase().includes('keyword');
                    const unit = (question.metadata as { unit?: string })?.unit || 'USD (thousands)';
                    const qNum = currentChunk === 0 ? qi + 1 : currentChunk === 1 ? qi + 4 : qi + 7;
                    return (
                        <div
                            key={question.id}
                            className={`bg-white border rounded-[10px] px-4 sm:px-6 py-4 sm:py-5 ${answered ? 'border-[#0E1628]/20' : 'border-[#E2DDD4]'}`}
                        >
                            <div className="text-[10px] font-medium uppercase tracking-widest text-[#9A9EB8] mb-2">
                                Q{qNum}
                                {answered && <span className="float-right text-[#2E9E6B]">✓ 응답 완료</span>}
                            </div>
                            <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#1A1A2E] mb-3">
                                {question.question_text}<span className="text-red-500 ml-0.5">*</span>
                            </p>
                            {isSegment && (
                                <div className="flex gap-0 rounded-lg overflow-hidden border border-[#E2DDD4]">
                                    {(question.options || []).map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setData('vision_mission', { ...data.vision_mission, [qId]: opt })}
                                            className={`flex-1 py-2.5 px-2 text-center text-xs sm:text-[13px] font-medium transition-all border-r border-[#E2DDD4] last:border-r-0 ${
                                                val === opt ? 'bg-[#0E1628] text-white' : 'bg-[#FAFAF8] text-[#4A4E69] hover:bg-[#F8F4ED] hover:text-[#0E1628]'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {isRevenue && (
                                <div className="flex gap-0 rounded-lg overflow-hidden">
                                    <div className="bg-[#F0EDE6] border border-[#E2DDD4] border-r-0 rounded-l-lg px-3 py-2.5 text-xs text-[#4A4E69] flex items-center">
                                        {unit}
                                    </div>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="e.g. 50,000"
                                        value={val != null ? String(val) : ''}
                                        onChange={(e) => setData('vision_mission', { ...data.vision_mission, [qId]: e.target.value })}
                                        className="rounded-l-none border-[#E2DDD4] bg-[#FAFAF8] focus:bg-white"
                                    />
                                </div>
                            )}
                            {isKeyword && (
                                <>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {KEYWORD_PRESETS.map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => setData('vision_mission', { ...data.vision_mission, [qId]: preset })}
                                                className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                                                    val === preset ? 'bg-[#0E1628] border-[#0E1628] text-white' : 'border-[#E2DDD4] bg-[#FAFAF8] text-[#4A4E69] hover:border-[#0E1628] hover:text-[#0E1628]'
                                                }`}
                                            >
                                                {preset}
                                            </button>
                                        ))}
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="Or type your own keyword..."
                                        value={typeof val === 'string' && !KEYWORD_PRESETS.includes(val) ? val : ''}
                                        onChange={(e) => setData('vision_mission', { ...data.vision_mission, [qId]: e.target.value })}
                                        className="border-[#E2DDD4] bg-[#FAFAF8]"
                                    />
                                </>
                            )}
                            {!isSegment && !isRevenue && !isKeyword && (
                                question.question_text.length > 100 ? (
                                    <textarea
                                        value={typeof val === 'string' ? val : (Array.isArray(val) ? (val as string[]).join('\n') : '')}
                                        onChange={(e) => setData('vision_mission', { ...data.vision_mission, [qId]: e.target.value })}
                                        rows={3}
                                        placeholder="Type your answer..."
                                        className="w-full border border-[#E2DDD4] rounded-lg px-3 py-2.5 text-sm bg-[#FAFAF8] focus:bg-white focus:border-[#0E1628] outline-none resize-y min-h-[80px]"
                                    />
                                ) : (
                                    <Input
                                        value={typeof val === 'string' ? val : (val != null ? String(val) : '')}
                                        onChange={(e) => setData('vision_mission', { ...data.vision_mission, [qId]: e.target.value })}
                                        placeholder="Type your answer..."
                                        className="border-[#E2DDD4] bg-[#FAFAF8] focus:bg-white"
                                    />
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
