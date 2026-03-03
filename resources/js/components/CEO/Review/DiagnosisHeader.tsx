import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiagnosisHeaderProps {
    title?: string;
    subtitle?: string;
    status?: string;
}

export default function DiagnosisHeader({ 
    title = 'Review HR Diagnosis Inputs',
    subtitle = 'Review and edit the diagnosis data submitted by your HR Manager. All changes will be logged.',
    status = 'submitted'
}: DiagnosisHeaderProps) {
    const getStatusBadge = () => {
        switch (status) {
            case 'submitted':
                return (
                    <Badge className="px-4 py-2 bg-blue-500 text-white border-0 shadow-md">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Submitted
                    </Badge>
                );
            case 'approved':
            case 'locked':
                return (
                    <Badge className="px-4 py-2 bg-green-500 text-white border-0 shadow-md">
                        <Lock className="w-4 h-4 mr-2" />
                        {status === 'approved' ? 'Approved' : 'Locked'}
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge className="px-4 py-2 bg-yellow-500 text-white border-0 shadow-md">
                        <Clock className="w-4 h-4 mr-2" />
                        In Progress
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary" className="px-4 py-2">
                        {status}
                    </Badge>
                );
        }
    };

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        {title}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {subtitle}
                    </p>
                </div>
                {getStatusBadge()}
            </div>
        </div>
    );
}
