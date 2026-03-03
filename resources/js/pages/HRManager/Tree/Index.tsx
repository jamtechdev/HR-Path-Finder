import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Network } from 'lucide-react';
import D3TreeView from '@/components/Tree/D3TreeView';

interface JobDefinition {
    id: number;
    job_name: string;
    job_description?: string;
    job_group?: string;
    reporting_structure?: {
        executive_director?: string;
        reporting_hierarchy?: string;
    };
}

interface HrSystemSnapshot {
    company: {
        name: string;
        industry: string;
        size: number;
    };
    ceo_philosophy: {
        main_trait?: string;
        secondary_trait?: string;
    };
    job_architecture: {
        jobs_defined: number;
    };
    performance_management: {
        model?: string;
        cycle?: string;
        rating_scale?: string;
    };
    compensation_benefits: {
        salary_system?: string;
        salary_increase_process?: string;
        bonus_metric?: string;
        benefits_level?: number;
        welfare_program?: string;
    };
    hr_system_report: {
        status: string;
    };
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    stepStatuses: Record<string, string>;
    projectId: number;
    jobDefinitions: JobDefinition[];
    activeTab?: string;
    hrSystemSnapshot: HrSystemSnapshot;
}

export default function HrTreeIndex({
    project,
    stepStatuses,
    projectId,
    jobDefinitions,
    activeTab = 'overview',
    hrSystemSnapshot,
}: Props) {
    return (
        <AppLayout 
            showWorkflowSteps={true}
            stepStatuses={stepStatuses}
            projectId={projectId}
        >
            <Head title={`Tree - ${project.company.name}`} />
            {/* Full Screen HR System Tree View */}
            <div className="h-full w-full">
                <D3TreeView hrSystemSnapshot={hrSystemSnapshot} />
            </div>
        </AppLayout>
    );
}
