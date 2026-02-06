import { Card, CardContent } from '@/components/ui/card';
import { Building2, CheckCircle2, Clock, BarChart3 } from 'lucide-react';

interface SummaryCardsProps {
    stats: {
        active_companies: number;
        steps_complete: string;
        ceo_survey_status: string;
        final_status: string;
    };
}

export default function SummaryCards({ stats }: SummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Active Companies</p>
                            <p className="text-2xl font-bold">{stats.active_companies}</p>
                        </div>
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Steps Complete</p>
                            <p className="text-2xl font-bold">{stats.steps_complete}</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">CEO Survey</p>
                            <p className="text-2xl font-bold">
                                {stats.ceo_survey_status === 'submitted' ? 'Submitted' : 'Pending'}
                            </p>
                        </div>
                        <Clock className="w-8 h-8 text-orange-500" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Final Status</p>
                            <p className="text-2xl font-bold">
                                {stats.final_status === 'pending' ? 'Pending' : 'None'}
                            </p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-red-500" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
