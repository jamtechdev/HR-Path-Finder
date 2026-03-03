import React from 'react';
import StepContainer from '../components/StepContainer';
import StepNavigation from '../components/StepNavigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, FileText } from 'lucide-react';

interface Step0BeforeYouBeginProps {
    introText?: string;
    onContinue: () => void;
}

export default function Step0BeforeYouBegin({
    introText,
    onContinue,
}: Step0BeforeYouBeginProps) {
    const defaultIntroText = `This stage is not intended to redesign or change your current organizational structure.

Its purpose is to organize and clarify the job standards and role expectations as they are currently operated within your company.

There are no right or wrong answers to any of the questions. Your responses will be used solely as baseline inputs for the subsequent design of the performance management and compensation systems.

All inputs are confidential and will not be shared with other employees.`;

    const displayText = introText || defaultIntroText;

    return (
        <StepContainer
            stepNumber={0}
            stepName="Before You Begin"
            description="Please read the following information carefully before proceeding."
        >
            <div className="space-y-6">
                {/* Information Card */}
                <Card className="border-2 bg-blue-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="prose prose-sm max-w-none">
                                    {displayText.split('\n\n').map((paragraph, index) => (
                                        <p key={index} className="mb-4 text-base leading-relaxed text-gray-700">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>

                                <Alert className="bg-yellow-50 border-yellow-200">
                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-900">
                                        <strong>MVP Scope Limitation:</strong> Organizational structure and job grade systems are too broad to fully formalize at this stage. For the MVP, we focus on structuring the organization solely through job analysis.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <StepNavigation
                    onNext={onContinue}
                    nextLabel="Continue to Policy Snapshot"
                    showBack={false}
                />
            </div>
        </StepContainer>
    );
}
