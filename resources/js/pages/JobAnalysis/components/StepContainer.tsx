import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StepContainerProps {
    stepNumber: number;
    stepName: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export default function StepContainer({
    stepNumber,
    stepName,
    description,
    children,
    className,
}: StepContainerProps) {
    return (
        <div className={cn('space-y-6', className)}>
            <Card className="shadow-lg border-2">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b-2">
                    <CardTitle className="text-2xl font-bold">
                        Step {stepNumber} — {stepName}
                    </CardTitle>
                    {description && (
                        <CardDescription className="text-base mt-2">
                            {description}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent className="p-6">
                    {children}
                </CardContent>
            </Card>
        </div>
    );
}
