import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompensationBenchmarkPreviewProps {
    title?: string;
    benchmarks?: Array<{
        label: string;
        value: number;
        isOurCompany?: boolean;
    }>;
    summaryText?: string;
}

export function CompensationBenchmarkPreview({
    title = '보상 수준 상대지수',
    benchmarks = [
        { label: '화장품업 전체', value: 55 },
        { label: '타겟 경쟁사', value: 51 },
        { label: '화장품 제조업', value: 49 },
        { label: '우리 회사', value: 43, isOurCompany: true },
    ],
    summaryText = '귀사의 보상 수준은 업종 전체 대비 78% 타겟 경쟁사 대비 84% 수준입니다.',
}: CompensationBenchmarkPreviewProps) {
    // Sort benchmarks by value in descending order
    const sortedBenchmarks = [...benchmarks].sort((a, b) => b.value - a.value);
    const maxValue = Math.max(...benchmarks.map(b => b.value));

    return (
        <Card className="bg-white border border-gray-200 rounded-lg shadow-lg">
            <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-gray-900 text-lg font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
                <div className="space-y-3">
                    {sortedBenchmarks.map((benchmark, index) => {
                        const percentage = (benchmark.value / maxValue) * 100;
                        return (
                            <div key={index} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${benchmark.isOurCompany ? 'text-[#0a1629]' : 'text-gray-700'}`}>
                                        {benchmark.label}
                                    </span>
                                    <span className={`text-sm font-semibold ${benchmark.isOurCompany ? 'text-[#0a1629]' : 'text-gray-600'}`}>
                                        {benchmark.value}
                                    </span>
                                </div>
                                <div className="relative h-6 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            benchmark.isOurCompany
                                                ? 'bg-[#0a1629]'
                                                : 'bg-gray-300'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                    {benchmark.isOurCompany && (
                                        <div className="absolute inset-0 border-2 border-[#0a1629] rounded-full" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {summaryText && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {summaryText}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
