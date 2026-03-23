import { 
    Building2, Users, UserCog, UserCheck, BriefcaseBusiness, Upload, Network, Layers, 
    AlertTriangle, Check, FileText, Target, BarChart3, Shield, Settings, TrendingUp, 
    Award, DollarSign, History
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface TreeTab {
    id: string;
    name: string;
    icon: LucideIcon;
    isEssential?: boolean;
}

export interface TreeStep {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
    iconColor: string;
    tabs: TreeTab[];
}

export const treeStructure: TreeStep[] = [
    {
        id: 'company',
        name: 'Company Profile',
        icon: Building2,
        color: 'border-blue-500 bg-blue-50',
        iconColor: 'text-blue-600',
        tabs: [
            { id: 'company-info', name: 'Company Information', icon: Building2 },
        ],
    },
    {
        id: 'diagnosis',
        name: 'CEO Diagnosis',
        icon: FileText,
        color: 'border-green-500 bg-green-50',
        iconColor: 'text-green-600',
        tabs: [
            { id: 'overview', name: 'Overview', icon: FileText, isEssential: false },
            { id: 'company-info', name: 'Basic Info', icon: Building2, isEssential: true },
            { id: 'workforce', name: 'Workforce', icon: Users, isEssential: true },
            { id: 'executives', name: 'Executives', icon: UserCog, isEssential: false },
            { id: 'leaders', name: 'Leaders', icon: UserCheck, isEssential: false },
            { id: 'job-grades', name: 'Job Grades', icon: BriefcaseBusiness, isEssential: false },
            { id: 'organizational-charts', name: 'Org Charts', icon: Upload, isEssential: true },
            { id: 'organizational-structure', name: 'Org Structure', icon: Network, isEssential: true },
            { id: 'job-structure', name: 'Job Structure', icon: Layers, isEssential: true },
            { id: 'hr-issues', name: 'HR Issues', icon: AlertTriangle, isEssential: true },
            { id: 'review', name: 'Review & Submit', icon: Check, isEssential: false },
        ],
    },
    {
        id: 'job_analysis',
        name: 'Job Analysis',
        icon: BriefcaseBusiness,
        color: 'border-purple-500 bg-purple-50',
        iconColor: 'text-purple-600',
        tabs: [
            { id: 'policy-snapshot', name: 'Policy Snapshot', icon: Shield },
            { id: 'job-list-selection', name: 'Job List Selection', icon: Users },
            { id: 'job-definition', name: 'Job Definition', icon: BriefcaseBusiness },
            { id: 'finalization', name: 'Finalization', icon: Check },
            { id: 'org-chart-mapping', name: 'Org Chart Mapping', icon: Network },
            { id: 'review-submit', name: 'Review & Submit', icon: Check },
        ],
    },
    {
        id: 'performance',
        name: 'Performance Management',
        icon: Target,
        color: 'border-orange-500 bg-orange-50',
        iconColor: 'text-orange-600',
        tabs: [
            { id: 'overview', name: 'Overview', icon: FileText },
            { id: 'evaluation-unit', name: 'Evaluation Unit', icon: Target },
            { id: 'performance-method', name: 'Performance Method', icon: BarChart3 },
            { id: 'evaluation-structure', name: 'Evaluation Structure', icon: Network },
            { id: 'review', name: 'Review & Submit', icon: Check },
        ],
    },
    {
        id: 'compensation',
        name: 'Compensation & Benefits',
        icon: DollarSign,
        color: 'border-indigo-500 bg-indigo-50',
        iconColor: 'text-indigo-600',
        tabs: [
            { id: 'overview', name: 'Overview', icon: Shield },
            { id: 'snapshot', name: 'Strategic Compensation Snapshot', icon: FileText },
            { id: 'base-salary-framework', name: 'Base Salary Framework', icon: Settings },
            { id: 'pay-band-salary-table', name: 'Pay Band / Salary Table', icon: TrendingUp },
            { id: 'bonus-pool', name: 'Bonus Pool Configuration', icon: Award },
            { id: 'benefits', name: 'Benefits Configuration', icon: Users },
            { id: 'review', name: 'Review & Submit', icon: Check },
        ],
    },
    {
        id: 'hr_policy_os',
        name: 'Final Dashboard',
        icon: Shield,
        color: 'border-teal-500 bg-teal-50',
        iconColor: 'text-teal-600',
        tabs: [
            { id: 'overview', name: 'Overview', icon: FileText },
            { id: 'review', name: 'Review & Submit', icon: Check },
        ],
    },
    {
        id: 'report',
        name: 'Final HR System Report',
        icon: Award,
        color: 'border-pink-500 bg-pink-50',
        iconColor: 'text-pink-600',
        tabs: [],
    },
];
