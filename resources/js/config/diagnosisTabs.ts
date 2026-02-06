import { Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check, UserCog, BriefcaseBusiness, Upload, Network, AlertTriangle, LucideIcon } from 'lucide-react';
import { TabId } from '@/components/Diagnosis/DiagnosisTabs';

export interface DiagnosisTab {
    id: TabId;
    name: string;
    icon: LucideIcon;
    route: string;
}

const basePath = '/hr-manager/diagnosis';

export const diagnosisTabs: DiagnosisTab[] = [
    { id: 'overview', name: 'Overview', icon: Building2, route: `${basePath}/overview` },
    { id: 'company-info', name: 'Company Info', icon: Building2, route: `${basePath}/company-info` },
    { id: 'business-profile', name: 'Business Profile', icon: Briefcase, route: `${basePath}/business-profile` },
    { id: 'workforce', name: 'Workforce', icon: Users, route: `${basePath}/workforce` },
    { id: 'executives', name: 'Executives', icon: UserCog, route: `${basePath}/executives` },
    { id: 'job-grades', name: 'Job Grades', icon: BriefcaseBusiness, route: `${basePath}/job-grades` },
    { id: 'organizational-charts', name: 'Org Charts', icon: Upload, route: `${basePath}/organizational-charts` },
    { id: 'organizational-structure', name: 'Org Structure', icon: Network, route: `${basePath}/organizational-structure` },
    { id: 'hr-issues', name: 'HR Issues', icon: AlertTriangle, route: `${basePath}/hr-issues` },
    { id: 'current-hr', name: 'Current HR', icon: Settings, route: `${basePath}/current-hr` },
    { id: 'culture', name: 'Culture', icon: MessageSquare, route: `${basePath}/culture` },
    { id: 'confidential', name: 'Confidential', icon: FileText, route: `${basePath}/confidential` },
    { id: 'review', name: 'Review & Submit', icon: Check, route: `${basePath}/review` },
];
