import { router } from '@inertiajs/react';
import { CheckCircle2, Clock, Lock, Eye, X, ClipboardList, Network } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SuccessModal from '@/components/Modals/SuccessModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StepVerificationCardProps {
    projectId: number;
    stepStatuses: Record<string, string>;
    /** When true, show CEO Survey row with View (e.g. when diagnosis is verified). */
    surveyAvailable?: boolean;
    verificationGates?: {
        hr_completed: boolean;
        ceo_survey_completed: boolean;
        diagnosis_completed: boolean;
    };
}

const STEP_LABELS: Record<string, string> = {
    diagnosis: 'Diagnosis',
    job_analysis: 'Job Analysis',
    ceo_diagnosis: 'CEO Diagnosis',
    performance: 'Performance System',
    compensation: 'Compensation System',
};

const STEP_ROUTES: Record<string, (projectId: number) => string> = {
    diagnosis: (id) => `/ceo/review/diagnosis/${id}`,
    job_analysis: (id) => `/ceo/job-analysis/${id}/intro`,
    performance: (id) => `/ceo/review/performance-system/${id}`,
    compensation: (id) => `/ceo/review/compensation/${id}`,
};

export default function StepVerificationCard({ projectId, stepStatuses, surveyAvailable, verificationGates }: StepVerificationCardProps) {
    const { t } = useTranslation();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [nextStepRoute, setNextStepRoute] = useState<string | null>(null);
    const [nextStepLabel, setNextStepLabel] = useState('Next Step');

    const STEP_LABELS_T: Record<string, string> = {
        diagnosis: t('steps.diagnosis'),
        job_analysis: t('steps.job_analysis'),
        ceo_diagnosis: t('step_verification_card.ceo_diagnosis'),
        performance: t('steps.performance'),
        compensation: t('steps.compensation'),
    };

    const handleVerify = (step: string) => {
        router.post(`/ceo/verify/step/${projectId}`, {
            step,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage(t('step_verification_card.verified_success', { step: STEP_LABELS_T[step] || step }));
                const steps = ['diagnosis', 'job_analysis', 'performance', 'compensation'];
                const currentIndex = steps.indexOf(step);
                const nextStep = steps.find((s, idx) => idx > currentIndex && stepStatuses[s] === 'submitted');
                if (nextStep && STEP_ROUTES[nextStep]) {
                    setNextStepRoute(STEP_ROUTES[nextStep](projectId));
                    setNextStepLabel(t('step_verification_card.review_step', { step: STEP_LABELS_T[nextStep] || nextStep }));
                } else {
                    setNextStepRoute('/ceo/projects');
                    setNextStepLabel(t('ceo_verification.back_to_projects'));
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
                setSuccessMessage(t('step_verification_card.revision_requested', { step: STEP_LABELS_T[step] || step }));
                setNextStepRoute('/ceo/projects');
                setNextStepLabel(t('ceo_verification.back_to_projects'));
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
                return <Badge variant="default" className="bg-orange-500">{t('step_verification_card.status.pending_verification')}</Badge>;
            case 'approved':
            case 'locked':
            case 'completed':
                return <Badge variant="default" className="bg-green-500">{t('step_verification_card.status.verified')}</Badge>;
            case 'in_progress':
                return <Badge variant="secondary">{t('step_verification_card.status.in_progress')}</Badge>;
            default:
                return <Badge variant="outline">{t('step_verification_card.status.not_started')}</Badge>;
        }
    };

    const steps = ['diagnosis', 'job_analysis', 'performance', 'compensation'];
    const diagnosisVerified = ['approved', 'locked', 'completed'].includes(getStepStatus('diagnosis'));
    const showSurveyRow = surveyAvailable ?? diagnosisVerified;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    {t('ceo_verification.card_title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {steps.map((step) => {
                    const status = getStepStatus(step);
                    const isSubmitted = status === 'submitted';
                    const isVerified = ['approved', 'locked', 'completed'].includes(status);
                    const requiresSurveyFirst =
                        step === 'diagnosis' &&
                        !!verificationGates &&
                        !verificationGates.ceo_survey_completed;
                    const diagnosisGateFailed =
                        step === 'diagnosis' &&
                        !!verificationGates &&
                        (!verificationGates.hr_completed ||
                            !verificationGates.ceo_survey_completed ||
                            !verificationGates.diagnosis_completed);
                    const canVerify = isSubmitted && !isVerified && !diagnosisGateFailed;
                    const canView = (isVerified || isSubmitted) && !requiresSurveyFirst;
                    let pendingReason: string | null = null;
                    if (step === 'diagnosis' && diagnosisGateFailed && verificationGates) {
                        if (!verificationGates.hr_completed) pendingReason = t('step_verification_card.pending_reason.waiting_for_hr');
                        else if (!verificationGates.ceo_survey_completed) pendingReason = t('step_verification_card.pending_reason.complete_survey_first');
                        else if (!verificationGates.diagnosis_completed) pendingReason = t('step_verification_card.pending_reason.pending');
                        else pendingReason = t('step_verification_card.pending_reason.pending');
                    }

                    return (
                        <div
                            key={step}
                            className="flex items-center justify-between flex-wrap p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                {getStatusIcon(status)}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{STEP_LABELS_T[step] || step}</span>
                                        {getStatusBadge(status)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {requiresSurveyFirst && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => {
                                            window.location.href = `/ceo/philosophy/survey/${projectId}`;
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {t('ceo_verification.start_survey')}
                                    </Button>
                                )}
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
                                        {t('step_verification_card.view')}
                                    </Button>
                                )}
                                {step === 'diagnosis' && pendingReason && !isVerified && (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                        {pendingReason}
                                    </Badge>
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
                                            {t('step_verification_card.verify')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRequestRevision(step)}
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            {t('step_verification_card.request_revision')}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* CEO Survey — View when diagnosis is verified */}
                {showSurveyRow && (
                    <div className="flex items-center justify-between flex-wrap p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                            <ClipboardList className="w-4 h-4 text-indigo-500" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{t('step_verification_card.management_philosophy_survey')}</span>
                                    <Badge variant="secondary" className="text-xs">{t('step_verification_card.ceo_survey_badge')}</Badge>
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
                            {t('step_verification_card.view_survey')}
                        </Button>
                    </div>
                )}

                {/* Final Dashboard is Tree only (not a separate verification step) */}
                <div className="flex items-center justify-between flex-wrap p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                        <Network className="w-4 h-4 text-teal-600" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{t('step_verification_card.final_dashboard')}</span>
                                <Badge variant="outline" className="text-xs">{t('step_verification_card.tree_badge')}</Badge>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            window.location.href = `/ceo/hr-policy-os/${projectId}`;
                        }}
                    >
                        <Eye className="w-4 h-4 mr-1" />
                        {t('step_verification_card.view')}
                    </Button>
                </div>
            </CardContent>
            
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title={t('step_verification_card.success_title')}
                message={successMessage}
                nextStepLabel={nextStepLabel}
                onNextStep={nextStepRoute ? handleNextStep : undefined}
            />
        </Card>
    );
}
