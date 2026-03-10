import React, { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Card } from '@/components/ui/card';
import { t, both, tr } from '@/config/diagnosisTranslations';

interface Diagnosis {
    id: number;
    leadership_count?: number;
    leadership_percentage?: number;
    present_headcount?: number;
}

interface Props {
    project: { id: number; company: { name: string } };
    company: { name: string };
    diagnosis?: Diagnosis;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
    embedMode?: boolean;
    readOnly?: boolean;
    embedData?: Record<string, unknown>;
    embedSetData?: (key: string, value: unknown) => void;
}

export default function Leaders({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
    embedMode = false,
    readOnly = false,
    embedData,
    embedSetData,
}: Props) {
    const [leadershipPercentage, setLeadershipPercentage] = React.useState<number | null>(null);

    const internalForm = useForm({
        leadership_count: diagnosis?.leadership_count ?? 0,
    });
    const useEmbed = embedMode && embedData != null && embedSetData;
    const data = useEmbed ? { ...internalForm.data, ...embedData } as typeof internalForm.data : internalForm.data;
    const setData = useEmbed ? (k: string, v: unknown) => embedSetData(k, v) : internalForm.setData;

    useEffect(() => {
        const workforce = diagnosis?.present_headcount || 0;
        if (workforce > 0 && data.leadership_count > 0) {
            const percentage = Math.round((data.leadership_count / workforce) * 100 * 10) / 10;
            setLeadershipPercentage(percentage);
        } else {
            setLeadershipPercentage(null);
        }
    }, [data.leadership_count, diagnosis?.present_headcount]);

    const b = both('leadersTitle');
    const note = both('leadersNote');
    const totalLabel = both('totalLeaders');
    const ratioLabel = both('leadersRatio');

    const innerContent = (
                <div className="space-y-5">
                    <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                        {note.en}
                    </p>
                    <p className="text-[11px] text-muted-foreground/80">{note.ko}</p>

                    <div className="flex items-start gap-2.5 rounded-lg border border-[rgba(26,39,68,0.1)] border-l-[3px] border-l-[#1a2744] bg-[rgba(26,39,68,0.04)] p-3">
                        <span className="text-sm flex-shrink-0 mt-0.5" aria-hidden>ℹ</span>
                        <p className="text-xs text-[#5a6478] leading-relaxed">
                            <strong className="text-[#1a2744]">Note:</strong> {note.en}
                        </p>
                    </div>

                    <Card className="border rounded-[14px] overflow-hidden border-border bg-white">
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="leadership_count" className="block text-[13px] font-semibold text-[#2d3340]">
                                    {totalLabel.en}
                                </label>
                                <p className="text-[11px] text-muted-foreground">{totalLabel.ko}</p>
                                <input
                                    id="leadership_count"
                                    type="number"
                                    min={0}
                                    value={data.leadership_count || ''}
                                    onChange={(e) => setData('leadership_count', parseInt(e.target.value, 10) || 0)}
                                    placeholder="0"
                                    disabled={readOnly}
                                    className="w-full max-w-[140px] h-11 px-3 border-[1.5px] border-border rounded-lg text-[13px] font-semibold text-[#1a2744] outline-none focus:border-[#4ecdc4] transition-colors disabled:opacity-70"
                                />
                            </div>

                            {leadershipPercentage !== null && (
                                <div className="space-y-2 pt-2 border-t border-border">
                                    <span className="block text-[13px] font-semibold text-[#2d3340]">
                                        {ratioLabel.en}
                                    </span>
                                    <p className="text-[11px] text-muted-foreground">{ratioLabel.ko}</p>
                                    <div className="p-4 rounded-lg bg-[#f8f9fb] border border-border">
                                        <p className="text-lg font-bold text-[#1a2744]">{leadershipPercentage}%</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {data.leadership_count} {tr('leadersCountLabel')} / {diagnosis?.present_headcount || 0} {tr('workforceCountLabel')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
    );
    if (embedMode) return <>{innerContent}</>;
    return (
        <>
            <Head title={`Leaders - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title={b.en}
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="executives"
                nextRoute="job-grades"
                formData={data}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                {innerContent}
            </FormLayout>
        </>
    );
}
