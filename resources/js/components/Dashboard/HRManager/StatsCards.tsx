import { TrendingUp, Users, Calendar } from 'lucide-react';

interface StatsCardsProps {
    progressCount: number;
    currentStepNumber: number;
}

export default function StatsCards({ progressCount, currentStepNumber }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm card-hover">
                <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <p className="text-2xl font-bold">{progressCount} / 4</p>
                    </div>
                </div>
            </div>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm card-hover">
                <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-success" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">CEO Survey</p>
                        <p className="text-2xl font-bold text-foreground">Locked</p>
                    </div>
                </div>
            </div>
            
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm card-hover">
                <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Current Step</p>
                        <p className="text-2xl font-bold">Step {currentStepNumber}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
