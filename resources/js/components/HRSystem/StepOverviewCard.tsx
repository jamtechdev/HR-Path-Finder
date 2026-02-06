import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, User, Building2, Target, Wallet } from 'lucide-react';
import StepDataDisplay from './StepDataDisplay';

interface StepOverviewCardProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    isVerified: boolean;
    type: 'philosophy' | 'organization' | 'performance' | 'compensation';
    data: any;
}

const iconMap = {
    philosophy: User,
    organization: Building2,
    performance: Target,
    compensation: Wallet,
};

export default function StepOverviewCard({
    title,
    icon: Icon,
    isVerified,
    type,
    data,
}: StepOverviewCardProps) {
    const DisplayIcon = iconMap[type] || Icon;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <DisplayIcon className="w-5 h-5 text-muted-foreground" />
                    <CardTitle>{title}</CardTitle>
                    {isVerified && (
                        <Badge className="bg-green-500 text-white ml-auto">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <StepDataDisplay data={data} type={type} />
            </CardContent>
        </Card>
    );
}
