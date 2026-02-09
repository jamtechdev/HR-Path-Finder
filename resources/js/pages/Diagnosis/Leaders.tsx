import React, { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Diagnosis {
    id: number;
    leadership_count?: number;
    leadership_percentage?: number;
    present_headcount?: number;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    company: {
        name: string;
    };
    diagnosis?: Diagnosis;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
}

export default function Leaders({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
}: Props) {
    const [leadershipPercentage, setLeadershipPercentage] = React.useState<number | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        leadership_count: diagnosis?.leadership_count || 0,
    });

    // Calculate leadership percentage
    useEffect(() => {
        const workforce = diagnosis?.present_headcount || 0;
        if (workforce > 0 && data.leadership_count > 0) {
            const percentage = Math.round((data.leadership_count / workforce) * 100 * 10) / 10;
            setLeadershipPercentage(percentage);
        } else {
            setLeadershipPercentage(null);
        }
    }, [data.leadership_count, diagnosis?.present_headcount]);

    // Removed auto-save - only save on review and submit

    return (
        <>
            <Head title={`Leaders - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title="Leaders"
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
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                <strong>Note:</strong> Leaders are defined as employees above Team Leader level. This excludes executives.
                            </p>
                        </div>

                        {/* Total Leaders */}
                        <div className="space-y-2">
                            <Label htmlFor="leadership_count">Total Leaders (Above Team Leader)</Label>
                            <Input
                                id="leadership_count"
                                type="number"
                                min="0"
                                value={data.leadership_count || ''}
                                onChange={(e) => setData('leadership_count', parseInt(e.target.value) || 0)}
                                placeholder="0"
                            />
                        </div>

                        {/* Leaders Ratio (Auto-calculated) */}
                        {leadershipPercentage !== null && (
                            <div className="space-y-2">
                                <Label>Leaders Ratio (Auto-calculated)</Label>
                                <div className="p-3 bg-muted rounded-md">
                                    <p className="text-lg font-semibold">{leadershipPercentage}%</p>
                                    <p className="text-xs text-muted-foreground">
                                        {data.leadership_count} leaders / {diagnosis?.present_headcount || 0} workforce
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </FormLayout>
        </>
    );
}
