import type { LucideIcon} from 'lucide-react';
import { Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check, UserCog, BriefcaseBusiness, Upload, Network, AlertTriangle, UserCheck, Layers } from 'lucide-react';
import type { TabId } from '@/components/Diagnosis/DiagnosisTabs';

export interface DiagnosisTab {
    id: TabId;
    name: string;
    i18nKey?: string;
    icon: LucideIcon;
    route: string;
    isEssential?: boolean; // * essential question vs ** Optional Question
}

const basePath = '/hr-manager/diagnosis';

// Tab order according to specification:
// 1. Basic Info (Company Name, Registration Number, HQ Location, Public Listing Status) - Essential
// 2. Industry (Major Category, Sub Category) - Essential (part of company-info)
// 3. Workforces (Present, After 1 year, 2 years, 3 years, Average Tenure, Average Age, Gender) - Essential
// 4. Executives (Total, Position - Multiple selection) - Optional
// 5. Leaders (Total Above Team leader, %) - Optional
// 6. Job Grade system (Grade Name, Promotion In Grade) - Optional
// 7. Org. Chart (Upload for 2023.12, 2024.12, 2025.12) - Essential
// 8. Org. Structure (multiple selection) - Essential
// 9. Job Structure (Job Category, Job Function) - Essential
// 10. Key HR/Org. Issues - Essential

export const diagnosisTabs: DiagnosisTab[] = [
    { id: 'overview', name: 'Overview', i18nKey: 'diagnosis_overview.common.review', icon: Building2, route: `${basePath}/overview`, isEssential: false },
    { id: 'company-info', name: 'Basic Info', i18nKey: 'diagnosis_overview.steps.company_info.name', icon: Building2, route: `${basePath}/company-info`, isEssential: true }, // Includes Industry
    { id: 'workforce', name: 'Workforce', i18nKey: 'diagnosis_overview.steps.workforce.name', icon: Users, route: `${basePath}/workforce`, isEssential: true },
    { id: 'executives', name: 'Executives', i18nKey: 'diagnosis_overview.steps.executives.name', icon: UserCog, route: `${basePath}/executives`, isEssential: false }, // Optional
    { id: 'leaders', name: 'Leaders', i18nKey: 'diagnosis_overview.steps.leaders.name', icon: UserCheck, route: `${basePath}/leaders`, isEssential: false }, // Optional
    { id: 'job-grades', name: 'Job Grades', i18nKey: 'diagnosis_overview.steps.job_grades.name', icon: BriefcaseBusiness, route: `${basePath}/job-grades`, isEssential: false }, // Optional
    { id: 'organizational-charts', name: 'Org Charts', i18nKey: 'diagnosis_overview.steps.org_charts.name', icon: Upload, route: `${basePath}/organizational-charts`, isEssential: true },
    { id: 'organizational-structure', name: 'Org Structure', i18nKey: 'diagnosis_overview.steps.org_structure.name', icon: Network, route: `${basePath}/organizational-structure`, isEssential: true },
    { id: 'job-structure', name: 'Job Structure', i18nKey: 'diagnosis_overview.steps.job_structure.name', icon: Layers, route: `${basePath}/job-structure`, isEssential: true },
    { id: 'hr-issues', name: 'HR Issues', i18nKey: 'diagnosis_overview.steps.hr_issues.name', icon: AlertTriangle, route: `${basePath}/hr-issues`, isEssential: true },
    { id: 'review', name: 'Review & Submit', i18nKey: 'diagnosis_overview.steps.review.name', icon: Check, route: `${basePath}/review`, isEssential: false },
];
