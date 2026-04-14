import { Link } from '@inertiajs/react';
import { ClipboardCheck, CheckCircle2, Clock, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HrProject } from '@/types/dashboard';

interface PhilosophySurveyCardProps {
    project: HrProject | null;
    ceoPhilosophyStatus: 'not_started' | 'in_progress' | 'completed';
}

export default function PhilosophySurveyCard({ project, ceoPhilosophyStatus }: PhilosophySurveyCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <ClipboardCheck className="w-5 h-5 text-muted-foreground" />
                    <CardTitle>Management Philosophy Survey</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between flex-wrap">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {ceoPhilosophyStatus === 'completed' ? (
                        <Badge className="bg-green-500 text-white">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                        </Badge>
                    ) : ceoPhilosophyStatus === 'in_progress' ? (
                        <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            In Progress
                        </Badge>
                    ) : (
                        <Badge className="bg-orange-500 text-white">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Not Started
                        </Badge>
                    )}
                </div>
                {project && (
                    <Link href={`/ceo/philosophy/survey/${project.id}`}>
                        <Button
                            size="lg"
                            className="w-full"
                            variant={ceoPhilosophyStatus === 'completed' ? 'outline' : 'default'}
                        >
                            {ceoPhilosophyStatus === 'completed' ? (
                                <>View Survey</>
                            ) : ceoPhilosophyStatus === 'in_progress' ? (
                                <>
                                    <Clock className="w-4 h-4 mr-2" />
                                    Continue Survey
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Start Survey
                                </>
                            )}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
