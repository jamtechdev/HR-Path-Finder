import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import type { HrProject } from '@/types/dashboard';

interface CTASectionProps {
    progressCount: number;
    project: HrProject | null;
    currentStepNumber: number;
}

export default function CTASection({ progressCount, project, currentStepNumber }: CTASectionProps) {
    if (progressCount === 4 && project) {
        return (
            <div className="rounded-lg border bg-card shadow-sm gradient-primary text-white">
                <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-semibold mb-1">All Steps Complete!</h3>
                        <p className="text-white/80">
                            View your complete HR system overview.
                        </p>
                    </div>
                    <Link
                        href={`/hr-projects/${project.id}/overview`}
                        className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-11 rounded-md px-8 whitespace-nowrap"
                    >
                        View HR System Overview
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border bg-card shadow-sm gradient-primary text-white">
            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-semibold mb-1">Ready to continue?</h3>
                    <p className="text-white/80">
                        Pick up where you left off and complete your HR system design.
                    </p>
                </div>
                <Link
                    href="/diagnosis/overview"
                    className="inline-flex items-center justify-center gap-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-11 rounded-md px-8 whitespace-nowrap"
                >
                    Continue Step {currentStepNumber}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </div>
        </div>
    );
}
