import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { Users, ArrowRight } from 'lucide-react';

interface ProjectWithSteps {
    id: number;
    company_name: string;
}

interface ReviewRequiredSectionProps {
    needsReview: ProjectWithSteps[];
}

export default function ReviewRequiredSection({ needsReview }: ReviewRequiredSectionProps) {
    if (needsReview.length === 0) {
        return null;
    }

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-1">Review Required</h3>
                            <p className="text-sm text-muted-foreground">
                                All steps are complete. Review the HR system design and provide consultant guidance.
                            </p>
                        </div>
                    </div>
                    {needsReview.length > 0 && (
                        <Link href={`/hr-projects/${needsReview[0].id}/consultant-review`}>
                            <Button size="lg">
                                Start Review
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
