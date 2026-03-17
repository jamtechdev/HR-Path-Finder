import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Lock, Eye, X, ClipboardList } from 'lucide-react';
import SuccessModal from '@/components/Modals/SuccessModal';

interface StepVerificationCardProps {
    projectId: number;
    stepStatuses: Record<string, string>;
    /** When true, show CEO Survey row with View (e.g. when diagnosis is verified). */
    surveyAvailable?: boolean;
}

const STEP_LABELS: Record<string, string> = {
    diagnosis: 'Diagnosis',
    job_analysis: 'Job Analysis',
    ceo_diagnosis: 'CEO Diagnosis',
    performance: 'Performance System',
    compensation: 'Compensation System',
    hr_policy_os: 'Final Dashboard',
};

const STEP_ROUTES: Record<string, (projectId: number) => string> = {
    diagnosis: (id) => `/ceo/review/diagnosis/${id}`,
    job_analysis: (id) => `/ceo/job-analysis/${id}/intro`,
    performance: (id) => `/ceo/review/performance-system/${id}`,
    compensation: (id) => `/ceo/review/compensation/${id}`,
    hr_policy_os: (id) => `/ceo/hr-policy-os/${id}`,
};

export default function StepVerificationCard({ projectId, stepStatuses, surveyAvailable }: StepVerificationCardProps) {
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [nextStepRoute, setNextStepRoute] = useState<string | null>(null);
    const [nextStepLabel, setNextStepLabel] = useState('Next Step');

    const handleVerify = (step: string) => {
        router.post(`/ceo/verify/step/${projectId}`, {
            step,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage(`${STEP_LABELS[step] || step} has been verified successfully!`);
                // Find next step that needs verification
                const steps = ['diagnosis', 'job_analysis', 'performance', 'compensation', 'hr_policy_os'];
                const currentIndex = steps.indexOf(step);
                const nextStep = steps.find((s, idx) => idx > currentIndex && stepStatuses[s] === 'submitted');
                if (nextStep && STEP_ROUTES[nextStep]) {
                    setNextStepRoute(STEP_ROUTES[nextStep](projectId));
                    setNextStepLabel(`Review ${STEP_LABELS[nextStep] || nextStep}`);
                } else {
                    setNextStepRoute('/ceo/projects');
                    setNextStepLabel('Back to Projects');
                }
                setShowSuccessModal(true);
            },
        });
    };

    const handleRequestRevision = (step: string) => {
        router.post(`/ceo/revision/step/${projectId}`, {
            step,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage(`Revision requested for ${STEP_LABELS[step] || step}.`);
                setNextStepRoute('/ceo/projects');
                setNextStepLabel('Back to Projects');
                setShowSuccessModal(true);
            },
        });
    };

    const handleNextStep = () => {
        if (nextStepRoute) {
            router.visit(nextStepRoute);
        }
        setShowSuccessModal(false);
    };

    const getStepStatus = (step: string) => {
        return stepStatuses[step] || 'not_started';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'submitted':
                return <Clock className="w-4 h-4 text-orange-500" />;
            case 'approved':
            case 'locked':
            case 'completed':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'in_progress':
                return <Clock className="w-4 h-4 text-blue-500" />;
            default:
                return <Lock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'submitted':
                return <Badge variant="default" className="bg-orange-500">Pending Verification</Badge>;
            case 'approved':
            case 'locked':
            case 'completed':
                return <Badge variant="default" className="bg-green-500">Verified</Badge>;
            case 'in_progress':
                return <Badge variant="secondary">In Progress</Badge>;
            default:
                return <Badge variant="outline">Not Started</Badge>;
        }
    };

    const steps = ['diagnosis', 'job_analysis', 'performance', 'compensation', 'hr_policy_os'];
    const diagnosisVerified = ['approved', 'locked', 'completed'].includes(getStepStatus('diagnosis'));
    const showSurveyRow = surveyAvailable ?? diagnosisVerified;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Step Verification
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {steps.map((step) => {
                    const status = getStepStatus(step);
                    const isSubmitted = status === 'submitted';
                    const isVerified = ['approved', 'locked', 'completed'].includes(status);
                    const canVerify = isSubmitted && !isVerified;
                    const canView = isVerified || isSubmitted;

                    return (
                        <div
                            key={step}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                {getStatusIcon(status)}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{STEP_LABELS[step] || step}</span>
                                        {getStatusBadge(status)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {canView && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const route = STEP_ROUTES[step]?.(projectId);
                                            if (route) {
                                                window.location.href = route;
                                            }
                                        }}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </Button>
                                )}
                                {canVerify && (
                                    <>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => handleVerify(step)}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                            Verify
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRequestRevision(step)}
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Request Revision
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* CEO Survey — View when diagnosis is verified */}
                {showSurveyRow && (
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                            <ClipboardList className="w-4 h-4 text-indigo-500" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Management Philosophy Survey</span>
                                    <Badge variant="secondary" className="text-xs">CEO Survey</Badge>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                window.location.href = `/ceo/philosophy/survey/${projectId}`;
                            }}
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            View Survey
                        </Button>
                    </div>
                )}
            </CardContent>
            
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Success!"
                message={successMessage}
                nextStepLabel={nextStepLabel}
                onNextStep={nextStepRoute ? handleNextStep : undefined}
            />
        </Card>
    );
}
