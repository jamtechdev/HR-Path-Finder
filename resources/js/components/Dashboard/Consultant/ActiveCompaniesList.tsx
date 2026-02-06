import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Building2, ArrowRight } from 'lucide-react';

interface ActiveCompany {
    id: number;
    name: string;
    industry?: string | null;
    project_id: number;
    step_statuses: {
        diagnosis: string;
        organization: string;
        performance: string;
        compensation: string;
    };
}

interface ActiveCompaniesListProps {
    companies: ActiveCompany[];
}

export default function ActiveCompaniesList({ companies }: ActiveCompaniesListProps) {
    if (companies.length === 0) {
        return null;
    }

    const getCompletedStepsCount = (company: ActiveCompany) => {
        const statuses = Object.values(company.step_statuses);
        return statuses.filter(status =>
            status === 'submitted' || status === 'completed'
        ).length;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Companies</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {companies.map((company) => {
                        const completedSteps = getCompletedStepsCount(company);
                        const totalSteps = 4;

                        return (
                            <div
                                key={company.id}
                                className="flex items-center justify-between p-4 border rounded-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{company.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {company.industry || 'Company'} • {completedSteps}/{totalSteps} Steps
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                        {completedSteps}/{totalSteps} Steps
                                    </Badge>
                                    <Link href={`/hr-projects/${company.project_id}/consultant-review`}>
                                        <Button size="sm" variant="outline">
                                            Review
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
