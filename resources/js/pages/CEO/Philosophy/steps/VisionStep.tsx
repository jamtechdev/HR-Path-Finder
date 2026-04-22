import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VISION_CHUNKS, KEYWORD_PRESETS } from '../constants';
import type { DiagnosisQuestion, SurveyFormData, VisionChunkConfig } from '../types';
import { usePhilosophyText } from '../uiText';

interface VisionStepProps {
    currentChunk: number;
    onChunkChange: (index: number) => void;
    getChunkQuestions: (chunkIndex: number) => DiagnosisQuestion[];
    data: SurveyFormData;
    setData: (key: 'vision_mission', value: SurveyFormData['vision_mission']) => void;
    showErrors?: boolean;
}

export default function VisionStep({
    currentChunk,
    onChunkChange,
    getChunkQuestions,
    data,
    setData,
    showErrors = false,
}: VisionStepProps) {
    const { isKo } = usePhilosophyText();
    const chunk = VISION_CHUNKS[currentChunk];
    const questions = getChunkQuestions(currentChunk);
    const leadMeta = (questions[0]?.metadata || {}) as Record<string, unknown>;
    const chunkLabel = isKo ? `파트 ${currentChunk + 1} / 3` : `Part ${currentChunk + 1} of 3`;
    const chunkName =
        ((isKo ? leadMeta.section_title_ko : leadMeta.section_title) as string) ||
        ((isKo ? leadMeta.title_ko : leadMeta.title) as string) ||
        (isKo ? chunk.nameKo : chunk.name);
    const chunkDesc =
        ((isKo ? leadMeta.section_description_ko : leadMeta.section_description) as string) ||
        ((isKo ? leadMeta.description_ko : leadMeta.description) as string) ||
        (isKo ? (chunk.descKo || chunk.desc) : chunk.desc);
    const chunkCalloutTitle =
        ((isKo ? leadMeta.section_callout_title_ko : leadMeta.section_callout_title) as string) ||
        ((isKo ? leadMeta.callout_title_ko : leadMeta.callout_title) as string) ||
        (isKo ? (chunk.calloutKo?.title || chunk.callout.title) : chunk.callout.title);
    const chunkCalloutBody =
        ((isKo ? leadMeta.section_callout_body_ko : leadMeta.section_callout_body) as string) ||
        ((isKo ? leadMeta.callout_body_ko : leadMeta.callout_body) as string) ||
        (isKo ? (chunk.calloutKo?.body || chunk.callout.body) : chunk.callout.body);

    return (
        <div className="w-full space-y-6 sm:space-y-7">
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-[#0E1628] flex items-center justify-center text-2xl">
                    {chunk.icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-[#C9A84C] mb-1">{chunkLabel}</div>
                    <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#0E1628] dark:text-slate-100 mb-1.5">{chunkName}</h2>
                    <p className="text-[12px] sm:text-[13px] text-[#4A4E69] dark:text-slate-400 font-light leading-relaxed">{chunkDesc}</p>
                </div>
            </div>
            {(chunkCalloutTitle || chunkCalloutBody) && (
                <div className="bg-[#0E1628] rounded-[10px] px-4 sm:px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 relative overflow-hidden">
                    <div className="absolute -top-8 -right-5 w-[100px] h-[100px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.2)_0%,transparent_65%)]" />
                    <span className="text-lg flex-shrink-0 relative">💡</span>
                    <div className="relative min-w-0 flex-1">
                        {chunkCalloutTitle && (
                            <strong className="block text-[12px] sm:text-[13px] font-medium text-[#E8C96B] mb-0.5">
                                {chunkCalloutTitle}
                            </strong>
                        )}
                        {chunkCalloutBody && (
                            <span className="text-[11px] sm:text-[12px] text-white/55 font-light">
                                {chunkCalloutBody}
                            </span>
                        )}
                    </div>
                </div>
            )}
            <div className="flex gap-1.5 flex-wrap mb-4">
                {VISION_CHUNKS.map((c, i) => {
                    const tabLeadMeta = (getChunkQuestions(i)[0]?.metadata || {}) as Record<string, unknown>;
                    const tabLabel =
                        ((isKo ? tabLeadMeta.section_title_ko : tabLeadMeta.section_title) as string) ||
                        ((isKo ? tabLeadMeta.title_ko : tabLeadMeta.title) as string) ||
                        (isKo ? c.nameKo : c.name);
                    return (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onChunkChange(i)}
                        className={`h-7 px-3 rounded-full text-[11px] font-medium border transition-all ${
                            i === currentChunk ? 'bg-[#0E1628] border-[#0E1628] text-white' : 'bg-transparent border-[#E2DDD4] dark:border-slate-600 text-[#9A9EB8] dark:text-slate-400 hover:border-[#0E1628]/50 dark:hover:border-slate-500'
                        }`}
                    >
                            {tabLabel}
                    </button>
                    );
                })}
            </div>
            <div className="space-y-3">
                {questions.map((question, qi) => {
                    const qId = question.id.toString();
                    const val = data.vision_mission[qId];
                    const answered = val !== undefined && val !== null && (typeof val !== 'string' || val.trim() !== '') && (!Array.isArray(val) || (val as unknown[]).some((x) => String(x).trim()));
                    const hasError = showErrors && !answered;
                    const isSelect = question.question_type === 'select';
                    const optionsCount = question.options?.length ?? 0;
                    const isSegment = isSelect && optionsCount > 0 && optionsCount <= 4;
                    const isSelectDropdown = isSelect && optionsCount > 4;
                    const isRevenue = question.question_type === 'number';
                    const isKeyword = question.question_type === 'text' && question.question_text.toLowerCase().includes('keyword');
                    const keywordPresets =
                        ((isKo
                            ? (question.metadata as { keyword_presets_ko?: string[] })?.keyword_presets_ko
                            : (question.metadata as { keyword_presets?: string[] })?.keyword_presets) || KEYWORD_PRESETS);
                    const unit = (question.metadata as { unit?: string })?.unit || 'USD (thousands)';
                    const qNum = currentChunk === 0 ? qi + 1 : currentChunk === 1 ? qi + 4 : qi + 7;
                    return (
                        <div
                            key={question.id}
                            className={`bg-white dark:bg-slate-800 border rounded-[10px] px-4 sm:px-6 py-4 sm:py-5 ${hasError ? 'border-red-300 bg-red-50/40 dark:border-red-500/60 dark:bg-red-950/20' : answered ? 'border-[#0E1628]/20 dark:border-slate-600' : 'border-[#E2DDD4] dark:border-slate-600'}`}
                        >
                            <div className="text-[10px] font-medium uppercase tracking-widest text-[#9A9EB8] dark:text-slate-400 mb-2">
                                Q{qNum}
                                {answered && (
                                    <span className="float-right text-[#2E9E6B] dark:text-green-400">
                                        ✓ {isKo ? '응답 완료' : 'Answered'}
                                    </span>
                                )}
                            </div>
                            <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#1A1A2E] dark:text-slate-200 mb-3">
                                {((isKo
                                    ? (question.metadata as Record<string, unknown>)?.question_text_ko
                                    : (question.metadata as Record<string, unknown>)?.question_text_en) as string) || question.question_text}<span className="text-red-500 ml-0.5">*</span>
                            </p>
                            {isSegment && (
                                <div className={`flex gap-0 rounded-lg overflow-hidden border ${hasError ? 'border-red-300 dark:border-red-500/60' : 'border-[#E2DDD4] dark:border-slate-600'}`}>
                                    {(question.options || []).map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setData('vision_mission', { ...data.vision_mission, [qId]: opt })}
                                            className={`flex-1 py-2.5 px-2 text-center text-xs sm:text-[13px] font-medium transition-all border-r border-[#E2DDD4] dark:border-slate-600 last:border-r-0 ${
                                                val === opt ? 'bg-[#0E1628] text-white' : 'bg-[#FAFAF8] dark:bg-slate-700 text-[#4A4E69] dark:text-slate-300 hover:bg-[#F8F4ED] dark:hover:bg-slate-600 hover:text-[#0E1628] dark:hover:text-slate-100'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {isSelectDropdown && (
                                <div className="flex gap-0 rounded-lg overflow-hidden">
                                    <Select
                                        value={val == null ? '' : typeof val === 'string' ? val : String(val)}
                                        onValueChange={(value) =>
                                            setData('vision_mission', { ...data.vision_mission, [qId]: value })
                                        }
                                    >
                                        <SelectTrigger
                                            className={`w-full h-11 rounded-lg border ${hasError ? 'border-red-300 dark:border-red-500/60' : 'border-[#E2DDD4] dark:border-slate-600'} bg-[#FAFAF8] dark:bg-slate-700`}
                                        >
                                            <SelectValue placeholder={isKo ? '옵션 선택' : 'Select an option'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(question.options || []).map((opt) => (
                                                <SelectItem key={opt} value={opt}>
                                                    {opt}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {isRevenue && (
                                <div className="flex gap-0 rounded-lg overflow-hidden">
                                    <div className="bg-[#F0EDE6] dark:bg-slate-700 border border-[#E2DDD4] dark:border-slate-600 border-r-0 rounded-l-lg px-3 py-2.5 text-xs text-[#4A4E69] dark:text-slate-300 flex items-center">
                                        {unit}
                                    </div>
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="e.g. 50,000"
                                        value={val != null ? String(val) : ''}
                                        onChange={(e) => setData('vision_mission', { ...data.vision_mission, [qId]: e.target.value })}
                                        className={`${hasError ? 'border-red-300 focus-visible:ring-red-200 dark:border-red-500/60' : 'border-[#E2DDD4] dark:border-slate-600'} rounded-l-none bg-[#FAFAF8] dark:bg-slate-700 text-[#1A1A2E] dark:text-slate-200 focus:bg-white dark:focus:bg-slate-600 placeholder:text-[#9A9EB8] dark:placeholder:text-slate-500`}
                                    />
                                </div>
                            )}
                            {isKeyword && (
                                <>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {keywordPresets.map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => setData('vision_mission', { ...data.vision_mission, [qId]: preset })}
                                                className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                                                    val === preset ? 'bg-[#0E1628] border-[#0E1628] text-white' : 'border-[#E2DDD4] dark:border-slate-600 bg-[#FAFAF8] dark:bg-slate-700 text-[#4A4E69] dark:text-slate-300 hover:border-[#0E1628] dark:hover:border-slate-500 hover:text-[#0E1628] dark:hover:text-slate-100'
                                                }`}
                                            >
                                                {preset}
                                            </button>
                                        ))}
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder={isKo ? '또는 직접 키워드 입력...' : 'Or type your own keyword...'}
                                        value={typeof val === 'string' && !keywordPresets.includes(val) ? val : ''}
                                        onChange={(e) => setData('vision_mission', { ...data.vision_mission, [qId]: e.target.value })}
                                        className={`${hasError ? 'border-red-300 focus-visible:ring-red-200 dark:border-red-500/60' : 'border-[#E2DDD4] dark:border-slate-600'} bg-[#FAFAF8] dark:bg-slate-700 text-[#1A1A2E] dark:text-slate-200 placeholder:text-[#9A9EB8] dark:placeholder:text-slate-500`}
                                    />
                                </>
                            )}
                            {!isSegment && !isSelectDropdown && !isRevenue && !isKeyword && (
                                question.question_text.length > 100 ? (
                                    <textarea
                                        value={typeof val === 'string' ? val : (Array.isArray(val) ? (val as string[]).join('\n') : '')}
                                        onChange={(e) => setData('vision_mission', { ...data.vision_mission, [qId]: e.target.value })}
                                        rows={3}
                                        placeholder={isKo ? '답변을 입력해 주세요...' : 'Type your answer...'}
                                        className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-[#FAFAF8] dark:bg-slate-700 text-[#1A1A2E] dark:text-slate-200 focus:bg-white dark:focus:bg-slate-600 outline-none resize-y min-h-[80px] placeholder:text-[#9A9EB8] dark:placeholder:text-slate-500 ${hasError ? 'border-red-300 focus:border-red-500 dark:border-red-500/60' : 'border-[#E2DDD4] dark:border-slate-600 focus:border-[#0E1628] dark:focus:border-slate-400'}`}
                                    />
                                ) : (
                                    <Input
                                        value={typeof val === 'string' ? val : (val != null ? String(val) : '')}
                                        onChange={(e) => setData('vision_mission', { ...data.vision_mission, [qId]: e.target.value })}
                                        placeholder={isKo ? '답변을 입력해 주세요...' : 'Type your answer...'}
                                        className={`${hasError ? 'border-red-300 focus-visible:ring-red-200 dark:border-red-500/60' : 'border-[#E2DDD4] dark:border-slate-600'} bg-[#FAFAF8] dark:bg-slate-700 text-[#1A1A2E] dark:text-slate-200 focus:bg-white dark:focus:bg-slate-600 placeholder:text-[#9A9EB8] dark:placeholder:text-slate-500`}
                                    />
                                )
                            )}
                            {hasError && <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">{isKo ? '이 문항에 응답해 주세요.' : 'Please answer this question.'}</p>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

