import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface HRSystemOverviewKoProps {
    title?: string;
    progressText?: string;
    steps?: Array<{ id: number; name: string; completed: boolean }>;
    alignmentLabel?: string;
    alignmentScore?: string;
    alignmentDescription?: string;
}

export function HRSystemOverviewKo({
    title = 'HR 시스템 개요',
    progressText = '4/4 완료',
    steps = [
        { id: 1, name: '진단', completed: true },
        { id: 2, name: '조직 설계', completed: true },
        { id: 3, name: '성과 관리', completed: true },
        { id: 4, name: '보상 체계', completed: true },
    ],
    alignmentLabel = 'CEO 정렬도',
    alignmentScore = '높음',
    alignmentDescription = 'HR 시스템 설계가 CEO의 경영 철학과 잘 일치합니다',
}: HRSystemOverviewKoProps) {
    const alignmentPercentage = alignmentScore === '높음' ? 85 : alignmentScore === '중간' ? 60 : 40;

    return (
        <Card className="bg-[#1e293b] text-white py-0 rounded-lg border-0 shadow-lg">
            <CardHeader className="pb-4 px-6 pt-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg font-semibold">{title}</CardTitle>
                    <span className="text-xs bg-[#10b981] text-white px-2.5 py-1 rounded font-medium">{progressText}</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
                <div className="space-y-1">
                    {steps.map((step) => (
                        <div key={step.id} className="flex items-center gap-3 py-2.5 px-2 rounded hover:bg-slate-700/30 transition-colors">
                            <div className="w-5 h-5 rounded-full bg-[#10b981] flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-3 h-3 text-white" fill="currentColor" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">{step.id}단계: {step.name}</p>
                            </div>
                            {step.completed && (
                                <span className="text-xs text-[#10b981] font-medium">완료</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6 space-y-2.5 border-t border-slate-700 pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{alignmentLabel}</span>
                        <span className="text-sm text-[#10b981] font-medium">{alignmentScore}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-[#10b981] rounded-full transition-all duration-300" style={{ width: `${alignmentPercentage}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {alignmentDescription}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
