import { CheckCircle2, Clock, Lock } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
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
        <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 text-[#0f2a4a] tracking-tight">
                        {title}
                    </h1>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                        {subtitle}
                    </p>
                </div>
                <div className="flex-shrink-0">{getStatusBadge()}</div>
            </div>
        </div>
    );
}
