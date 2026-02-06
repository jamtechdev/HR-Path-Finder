import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check, CheckCircle2, UserCog, BriefcaseBusiness, Network, AlertTriangle, Upload, Image as ImageIcon } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';
import { diagnosisTabs } from '@/config/diagnosisTabs';

interface Company {
    id: number;
    name: string;
    foundation_date?: string | null;
    hq_location?: string | null;
    industry?: string | null;
    industry_sub_category?: string | null;
    registration_number?: string | null;
    public_listing_status?: boolean | null;
    brand_name?: string | null;
    secondary_industries?: string[] | null;
    logo_path?: string | null;
    image_path?: string | null;
    businessProfile?: BusinessProfile | null;
    workforce?: Workforce | null;
    executives?: Executive[] | null;
    jobGrades?: JobGrade[] | null;
    organizationalCharts?: OrganizationalChart[] | null;
    hrIssues?: HrIssue[] | null;
    currentHrStatus?: CurrentHrStatus | null;
    culture?: Culture | null;
    confidentialNote?: ConfidentialNote | null;
    hrProjects?: Array<{ organizationDesign?: OrganizationDesign | null }> | null;
}

interface BusinessProfile {
    id?: number;
    annual_revenue?: string | null;
    operational_margin_rate?: string | null;
    business_type?: string | null;
}

interface Workforce {
    id?: number;
    headcount_current?: number | null;
    total_employees?: number | null;
    expected_workforce_1_year?: number | null;
    expected_workforce_2_years?: number | null;
    expected_workforce_3_years?: number | null;
    average_tenure_active?: number | null;
    average_tenure_leavers?: number | null;
    average_age_active?: number | null;
    male_employees?: number | null;
    female_employees?: number | null;
    total_leaders_above_team_leader?: number | null;
    leaders_percentage?: number | null;
    org_chart_path?: string | null;
}

interface Executive {
    id?: number;
    position_title: string;
    number_of_executives: number;
}

interface JobGrade {
    id?: number;
    grade_name: string;
    promotion_rules?: string | null;
    promotion_to_grade?: string | null;
}

interface OrganizationalChart {
    id?: number;
    chart_year_month: string;
    file_name?: string | null;
    file_path?: string | null;
}

interface CurrentHrStatus {
    id?: number;
    dedicated_hr_team?: boolean | null;
    evaluation_system_status?: string | null;
}

interface Culture {
    id?: number;
    work_format?: string | null;
    core_values?: string[] | null;
}

interface ConfidentialNote {
    id?: number;
    notes?: string | null;
}

interface HrIssue {
    id?: number;
    issue_type: string;
    description?: string | null;
}

interface OrganizationDesign {
    structure_types?: string[];
}

interface Project {
    id: number;
    status: string;
    company: Company;
    business_profile?: BusinessProfile | null;
    workforce?: Workforce | null;
    executives?: Executive[];
    job_grades?: JobGrade[];
    organizational_charts?: OrganizationalChart[];
    organization_design?: OrganizationDesign | null;
    hr_issues?: HrIssue[];
    current_hr_status?: CurrentHrStatus | null;
    culture?: Culture | null;
    confidential_note?: ConfidentialNote | null;
}

interface PageProps {
    company?: Company | null;
    project?: Project | null;
}

export default function Review({ company, project }: PageProps) {
    const basePath = '/hr-manager/diagnosis';
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Load all data - prioritize database (project/company) over localStorage
    const getAllLocalStorageData = () => {
        const getStoredData = (key: string) => {
            if (typeof window === 'undefined') return null;
            try {
                const stored = localStorage.getItem(`diagnosis_form_${key}`);
                return stored ? JSON.parse(stored) : null;
            } catch {
                return null;
            }
        };

        // If project/company exists, use database data
        if (project || company) {
            return {
                company: company ? {
                    name: company.name,
                    brand_name: company.brand_name,
                    foundation_date: company.foundation_date,
                    hq_location: company.hq_location,
                    industry: company.industry,
                    industry_sub_category: company.industry_sub_category,
                    secondary_industries: company.secondary_industries,
                    registration_number: company.registration_number,
                    public_listing_status: company.public_listing_status,
                    logo_path: company.logo_path,
                    image_path: company.image_path,
                } : getStoredData('company'),
                businessProfile: project?.business_profile || company?.businessProfile ? {
                    annual_revenue: project?.business_profile?.annual_revenue || company?.businessProfile?.annual_revenue,
                    operational_margin_rate: project?.business_profile?.operational_margin_rate || company?.businessProfile?.operational_margin_rate,
                    annual_human_cost: project?.business_profile?.annual_human_cost || company?.businessProfile?.annual_human_cost,
                    business_type: project?.business_profile?.business_type || company?.businessProfile?.business_type,
                } : getStoredData('business-profile'),
                workforce: project?.workforce || company?.workforce ? {
                    ...(project?.workforce || company?.workforce),
                    org_chart_path: project?.workforce?.org_chart_path || company?.workforce?.org_chart_path || null,
                } : getStoredData('workforce'),
                executives: project?.executives || (company?.executives && company.executives.length > 0) ? 
                    (project?.executives || company.executives.map((e: any) => ({
                        position_title: e.position_title,
                        number_of_executives: e.number_of_executives,
                        is_custom: e.is_custom,
                    }))) : getStoredData('executives'),
                jobGrades: project?.job_grades || (company?.jobGrades && company.jobGrades.length > 0) ?
                    (project?.job_grades || company.jobGrades.map((g: any) => ({
                        grade_name: g.grade_name,
                        grade_order: g.grade_order,
                        promotion_rules: g.promotion_rules,
                        promotion_to_grade: g.promotion_to_grade,
                    }))) : getStoredData('job-grades'),
                organizationalCharts: project?.organizational_charts || (company?.organizationalCharts && company.organizationalCharts.length > 0) ?
                    (project?.organizational_charts || company.organizationalCharts.map((c: any) => ({
                        chart_year_month: c.chart_year_month,
                        file_path: c.file_path,
                        file_name: c.file_name,
                    }))) : getStoredData('organizational-charts'),
                organizationalStructure: project?.organization_design || (company?.hrProjects?.[0]?.organizationDesign) ?
                    {
                        structure_types: project?.organization_design?.structure_types || company?.hrProjects?.[0]?.organizationDesign?.structure_types || [],
                    } : getStoredData('organizational-structure'),
                hrIssues: project?.hr_issues || (company?.hrIssues && company.hrIssues.length > 0) ?
                    (project?.hr_issues || company.hrIssues.map((i: any) => ({
                        issue_type: i.issue_type,
                        is_custom: i.is_custom,
                        description: i.description,
                    }))) : getStoredData('hr-issues'),
                currentHr: project?.current_hr_status || company?.currentHrStatus ? {
                    ...(project?.current_hr_status || company.currentHrStatus),
                } : getStoredData('current-hr'),
                culture: project?.culture || company?.culture ? {
                    ...(project?.culture || company.culture),
                } : getStoredData('culture'),
                confidential: project?.confidential_note || company?.confidentialNote ? {
                    notes: project?.confidential_note?.notes || company.confidentialNote?.notes,
                } : getStoredData('confidential'),
            };
        }

        // Fall back to localStorage
        return {
            company: getStoredData('company'),
            businessProfile: getStoredData('business-profile'),
            workforce: getStoredData('workforce'),
            executives: getStoredData('executives'),
            jobGrades: getStoredData('job-grades'),
            organizationalCharts: getStoredData('organizational-charts'),
            organizationalStructure: getStoredData('organizational-structure'),
            hrIssues: getStoredData('hr-issues'),
            currentHr: getStoredData('current-hr'),
            culture: getStoredData('culture'),
            confidential: getStoredData('confidential'),
        };
    };

    const [allData, setAllData] = useState(getAllLocalStorageData() || {
        company: null,
        businessProfile: null,
        workforce: null,
        executives: null,
        jobGrades: null,
        organizationalCharts: null,
        organizationalStructure: null,
        hrIssues: null,
        currentHr: null,
        culture: null,
        confidential: null,
    });

    useEffect(() => {
        // Refresh data when component mounts or when project/company props change
        const freshData = getAllLocalStorageData();
        setAllData(freshData || {
            company: null,
            businessProfile: null,
            workforce: null,
            executives: null,
            jobGrades: null,
            organizationalCharts: null,
            organizationalStructure: null,
            hrIssues: null,
            currentHr: null,
            culture: null,
            confidential: null,
        });
    }, [project, company]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting) return; // Prevent double submission
        
        setIsSubmitting(true);
        
        // Use current allData from state (refresh from localStorage to ensure latest)
        const latestData = getAllLocalStorageData();
        
        // Prepare FormData for submission (includes files)
        const formData = new FormData();
        
        // Helper function to convert value to proper format for FormData
        const formatValue = (key: string, value: any): any => {
            // Boolean fields - Laravel accepts "1" for true and "0" for false in FormData
            if (key === 'public_listing_status' || key === 'dedicated_hr_team' || key === 'labor_union_present') {
                if (value === true || value === 'true' || value === 1 || value === '1' || value === 'on' || value === 'yes') {
                    return '1';
                }
                if (value === false || value === 'false' || value === 0 || value === '0' || value === 'off' || value === 'no') {
                    return '0';
                }
                // For nullable fields, return null if value is empty
                if (key === 'labor_union_present' && (value === null || value === '' || value === undefined)) {
                    return null;
                }
                return null;
            }
            // Numeric fields - ensure proper numeric format
            if (key === 'leaders_percentage' || key.includes('percentage') || key.includes('rate') || key.includes('margin')) {
                const num = parseFloat(value);
                if (isNaN(num)) return null;
                // Ensure leaders_percentage doesn't exceed 100
                if (key === 'leaders_percentage') {
                    const clamped = Math.min(100, Math.max(0, num));
                    return String(clamped);
                }
                return String(num);
            }
            // Integer fields
            if (key.includes('employees') || key.includes('headcount') || key.includes('workforce') || key.includes('levels') || key.includes('executives')) {
                const num = parseInt(value);
                if (isNaN(num)) return null;
                return String(Math.max(0, num)); // Ensure non-negative
            }
            // Array values
            if (Array.isArray(value)) {
                return value;
            }
            // File values
            if (value instanceof File) {
                return value;
            }
            // Default: convert to string
            return String(value);
        };

        // Company Info
        if (latestData.company) {
            Object.keys(latestData.company).forEach(key => {
                const value = latestData.company[key];
                // Handle boolean fields specially - they can be false/0
                if (key === 'public_listing_status') {
                    // Required boolean - always send if not null/undefined
                    if (value !== null && value !== undefined) {
                        const formattedValue = formatValue(key, value);
                        if (formattedValue !== null) {
                            formData.append(key, formattedValue);
                        }
                    }
                } else if (value !== null && value !== undefined && value !== '') {
                    const formattedValue = formatValue(key, value);
                    if (formattedValue === null) return;
                    
                    if (formattedValue instanceof File) {
                        formData.append(key, formattedValue);
                    } else if (Array.isArray(formattedValue)) {
                        formattedValue.forEach((item, index) => {
                            formData.append(`${key}[${index}]`, String(item));
                        });
                    } else {
                        formData.append(key, formattedValue);
                    }
                }
            });
        }
        
        // Business Profile
        if (latestData.businessProfile) {
            Object.keys(latestData.businessProfile).forEach(key => {
                const value = latestData.businessProfile[key];
                if (value !== null && value !== undefined && value !== '') {
                    formData.append(key, String(value));
                }
            });
        }
        
        // Workforce
        if (latestData.workforce) {
            Object.keys(latestData.workforce).forEach(key => {
                const value = latestData.workforce[key];
                if (value !== null && value !== undefined && value !== '') {
                    const formattedValue = formatValue(key, value);
                    if (formattedValue === null) return;
                    
                    if (formattedValue instanceof File) {
                        formData.append(key, formattedValue);
                    } else {
                        formData.append(key, formattedValue);
                    }
                }
            });
        }
        
        // Executives
        if (latestData.executives && Array.isArray(latestData.executives)) {
            latestData.executives.forEach((exec, index) => {
                Object.keys(exec).forEach(key => {
                    const value = exec[key];
                    if (value !== null && value !== undefined && value !== '') {
                        // Handle boolean fields (is_custom) - Laravel expects "1" or "0" in FormData
                        if (key === 'is_custom') {
                            const boolValue = value === true || value === 'true' || value === 1 || value === '1' || value === 'on' || value === 'yes';
                            formData.append(`executives[${index}][${key}]`, boolValue ? '1' : '0');
                        } else {
                            formData.append(`executives[${index}][${key}]`, String(value));
                        }
                    }
                });
            });
        }
        
        // Job Grades
        if (latestData.jobGrades && Array.isArray(latestData.jobGrades)) {
            latestData.jobGrades.forEach((grade, index) => {
                Object.keys(grade).forEach(key => {
                    if (grade[key] !== null && grade[key] !== undefined && grade[key] !== '') {
                        formData.append(`job_grades[${index}][${key}]`, String(grade[key]));
                    }
                });
            });
        }
        
        // Organizational Charts - Files are stored in sessionStorage (can't store File objects in localStorage)
        // Format: org_chart_2023_12, org_chart_2024_12, org_chart_2025_12
        if (latestData.organizationalCharts && Array.isArray(latestData.organizationalCharts)) {
            latestData.organizationalCharts.forEach((chart: any) => {
                const yearMonth = chart.chart_year_month || chart.yearMonth;
                if (yearMonth && typeof window !== 'undefined') {
                    // Check if file exists in sessionStorage
                    const fileData = sessionStorage.getItem(`org_chart_file_${yearMonth}`);
                    const fileName = sessionStorage.getItem(`org_chart_file_name_${yearMonth}`);
                    
                    if (fileData && fileName) {
                        try {
                            // Convert base64 back to File object
                            const byteString = atob(fileData.split(',')[1]);
                            const mimeString = fileData.split(',')[0].split(':')[1].split(';')[0];
                            const ab = new ArrayBuffer(byteString.length);
                            const ia = new Uint8Array(ab);
                            for (let i = 0; i < byteString.length; i++) {
                                ia[i] = byteString.charCodeAt(i);
                            }
                            const blob = new Blob([ab], { type: mimeString });
                            const file = new File([blob], fileName, { type: mimeString });
                            
                            // Convert format: 2023-12 -> org_chart_2023_12
                            const normalized = yearMonth.replace('-', '_');
                            const fieldName = `org_chart_${normalized}`;
                            formData.append(fieldName, file);
                        } catch (e) {
                            console.error('Error converting file from sessionStorage:', e);
                        }
                    }
                }
            });
        }
        
        // Organizational Structure
        if (latestData.organizationalStructure) {
            Object.keys(latestData.organizationalStructure).forEach(key => {
                const value = latestData.organizationalStructure[key];
                if (value !== null && value !== undefined && value !== '') {
                    if (Array.isArray(value)) {
                        value.forEach((item, index) => {
                            formData.append(`${key}[${index}]`, String(item));
                        });
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });
        }
        
        // HR Issues
        if (latestData.hrIssues && Array.isArray(latestData.hrIssues)) {
            latestData.hrIssues.forEach((issue, index) => {
                Object.keys(issue).forEach(key => {
                    const value = issue[key];
                    if (value !== null && value !== undefined && value !== '') {
                        // Handle boolean fields (is_custom) - Laravel expects "1" or "0" in FormData
                        if (key === 'is_custom') {
                            const boolValue = value === true || value === 'true' || value === 1 || value === '1' || value === 'on' || value === 'yes';
                            formData.append(`hr_issues[${index}][${key}]`, boolValue ? '1' : '0');
                        } else {
                            formData.append(`hr_issues[${index}][${key}]`, String(value));
                        }
                    }
                });
            });
        }
        
        // Current HR
        if (latestData.currentHr) {
            Object.keys(latestData.currentHr).forEach(key => {
                const value = latestData.currentHr[key];
                // Handle boolean fields specially - they can be false/0, so check explicitly
                if (key === 'dedicated_hr_team' || key === 'labor_union_present') {
                    // Required boolean - always send if not null/undefined
                    if (key === 'dedicated_hr_team' && value !== null && value !== undefined) {
                        const formattedValue = formatValue(key, value);
                        if (formattedValue !== null) {
                            formData.append(key, formattedValue);
                        }
                    }
                    // Nullable boolean - only send if not null/undefined
                    else if (key === 'labor_union_present' && value !== null && value !== undefined) {
                        const formattedValue = formatValue(key, value);
                        if (formattedValue !== null) {
                            formData.append(key, formattedValue);
                        }
                    }
                } else if (value !== null && value !== undefined && value !== '') {
                    const formattedValue = formatValue(key, value);
                    if (formattedValue === null) return;
                    formData.append(key, formattedValue);
                }
            });
        }
        
        // Culture
        if (latestData.culture) {
            Object.keys(latestData.culture).forEach(key => {
                const value = latestData.culture[key];
                if (value !== null && value !== undefined && value !== '') {
                    if (Array.isArray(value)) {
                        value.forEach((item, index) => {
                            formData.append(`${key}[${index}]`, String(item));
                        });
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });
        }
        
        // Confidential
        if (latestData.confidential) {
            Object.keys(latestData.confidential).forEach(key => {
                const value = latestData.confidential[key];
                if (value !== null && value !== undefined && value !== '') {
                    formData.append(key, String(value));
                }
            });
        }
        
        // Submit all data at once using router.post with FormData
        router.post('/hr-manager/diagnosis/submit', formData, {
            preserveScroll: true,
            forceFormData: true,
            onStart: () => {
                setIsSubmitting(true);
            },
            onSuccess: () => {
                // Clear localStorage
                const keys = ['company', 'business-profile', 'workforce', 'executives', 'job-grades', 
                             'organizational-charts', 'organizational-structure', 'hr-issues', 
                             'current-hr', 'culture', 'confidential', 'diagnosis_status'];
                keys.forEach(key => {
                    localStorage.removeItem(`diagnosis_form_${key}`);
                });
                localStorage.removeItem('diagnosis_status');
                
                setIsSubmitting(false);
                
                // Redirect to dashboard
                router.visit('/hr-manager/dashboard', {
                    preserveState: false,
                });
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                setIsSubmitting(false);
                alert('There was an error submitting the form. Please check the console for details.');
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    // Check completion status for each step - prioritize database, then localStorage
    const checkStepComplete = (key: string): boolean => {
        // Always check database first if project/company exists
        if (project || company) {
            const keyMap: Record<string, string> = {
                'company': 'company',
                'company-info': 'company',
                'business-profile': 'business_profile',
                'workforce': 'workforce',
                'executives': 'executives',
                'job-grades': 'job_grades',
                'organizational-charts': 'organizational_charts',
                'organizational-structure': 'organization_design',
                'hr-issues': 'hr_issues',
                'current-hr': 'current_hr_status',
                'culture': 'culture',
                'confidential': 'confidential_note',
            };
            
            const dbKey = keyMap[key];
            if (dbKey) {
                // Check project data first
                if (project && (project as any)[dbKey]) {
                    const data = (project as any)[dbKey];
                    if (Array.isArray(data)) {
                        return data.length > 0;
                    }
                    if (typeof data === 'object' && data !== null) {
                        const keys = Object.keys(data);
                        if (keys.length === 0) return false;
                        return Object.values(data).some(v => {
                            if (v === null || v === undefined || v === '') return false;
                            if (Array.isArray(v)) return v.length > 0;
                            if (typeof v === 'object') return Object.keys(v).length > 0;
                            return true;
                        });
                    }
                    return !!data;
                }
                
                // Check company data directly for company-info
                if (company && dbKey === 'company') {
                    return !!company.id && !!company.name;
                }
                
                // Check company's related models for other steps
                if (company) {
                    switch (dbKey) {
                        case 'business_profile':
                            return !!company.businessProfile?.id;
                        case 'workforce':
                            return !!company.workforce?.id;
                        case 'executives':
                            return Array.isArray(company.executives) && company.executives.length > 0;
                        case 'job_grades':
                            return Array.isArray(company.jobGrades) && company.jobGrades.length > 0;
                        case 'organizational_charts':
                            return Array.isArray(company.organizationalCharts) && company.organizationalCharts.length > 0;
                        case 'hr_issues':
                            return Array.isArray(company.hrIssues) && company.hrIssues.length > 0;
                        case 'current_hr_status':
                            return !!company.currentHrStatus?.id;
                        case 'culture':
                            return !!company.culture?.id;
                        case 'confidential_note':
                            return !!company.confidentialNote?.id;
                    }
                }
            }
        }
        
        // Fall back to localStorage check only if no database data
        if (typeof window === 'undefined') return false;
        try {
            const stored = localStorage.getItem(`diagnosis_form_${key}`);
            if (!stored || stored === '{}' || stored === 'null') return false;
            const data = JSON.parse(stored);
            if (Array.isArray(data)) {
                return data.length > 0 && data.some((item: any) => Object.values(item).some(v => v !== null && v !== ''));
            }
            return Object.keys(data).length > 0 && Object.values(data).some(v => v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true));
        } catch {
            return false;
        }
    };

    const stepStatus = {
        'company-info': checkStepComplete('company'),
        'business-profile': checkStepComplete('business-profile'),
        'workforce': checkStepComplete('workforce'),
        'executives': checkStepComplete('executives'),
        'job-grades': checkStepComplete('job-grades'),
        'organizational-charts': checkStepComplete('organizational-charts'),
        'organizational-structure': checkStepComplete('organizational-structure'),
        'hr-issues': checkStepComplete('hr-issues'),
        'current-hr': checkStepComplete('current-hr'),
        'culture': checkStepComplete('culture'),
        'confidential': checkStepComplete('confidential'),
        'review': true,
    };

    const stepOrder = ['company-info', 'business-profile', 'workforce', 'executives', 'job-grades', 'organizational-charts', 'organizational-structure', 'hr-issues', 'current-hr', 'culture', 'confidential', 'review'] as const;
    const completedSteps = Object.values(stepStatus).filter(Boolean).length;
    const totalSteps = 12;

    const status: 'not_started' | 'in_progress' | 'submitted' = 'not_started';

    // Use shared tabs configuration
    const tabs = diagnosisTabs;

    // Build sections from localStorage data
    const sections = [
        {
            id: 'company-info',
            title: 'Company Info & Industry',
            icon: Building2,
            completed: stepStatus['company-info'],
            data: allData.company ? {
                'Company Name': allData.company.name || 'N/A',
                'Brand Name': allData.company.brand_name || 'N/A',
                'Registration Number': allData.company.registration_number || 'N/A',
                'HQ Location': allData.company.hq_location || 'N/A',
                'Public Listing Status': allData.company.public_listing_status !== null && allData.company.public_listing_status !== undefined ? (allData.company.public_listing_status ? 'Yes' : 'No') : 'N/A',
                'Foundation Date': allData.company.foundation_date || 'N/A',
                'Industry (Major Category)': allData.company.industry || 'N/A',
                'Industry (Sub Category)': allData.company.industry_sub_category || 'N/A',
                'Secondary Industries': Array.isArray(allData.company.secondary_industries) ? allData.company.secondary_industries.join(', ') : 'N/A',
            } : {},
            logo_path: allData.company?.logo_path || null,
            image_path: allData.company?.image_path || null,
        },
        {
            id: 'business-profile',
            title: 'Business Profile',
            icon: Briefcase,
            completed: stepStatus['business-profile'],
            data: allData.businessProfile ? {
                'Annual Revenue': allData.businessProfile.annual_revenue ? `₩${Number(allData.businessProfile.annual_revenue).toLocaleString()}` : 'N/A',
                'Operational Margin': allData.businessProfile.operational_margin_rate ? `${allData.businessProfile.operational_margin_rate}%` : 'N/A',
                'Annual Human Cost': allData.businessProfile.annual_human_cost ? `₩${Number(allData.businessProfile.annual_human_cost).toLocaleString()}` : 'N/A',
                'Business Type': allData.businessProfile.business_type?.toUpperCase() || 'N/A',
            } : {},
        },
        {
            id: 'workforce',
            title: 'Workforce & Leadership',
            icon: Users,
            completed: stepStatus['workforce'],
            data: allData.workforce ? {
                'Headcount (Year -2)': allData.workforce.headcount_year_minus_2 || 'N/A',
                'Headcount (Year -1)': allData.workforce.headcount_year_minus_1 || 'N/A',
                'Present Workforce': allData.workforce.headcount_current || 'N/A',
                'Total Employees': allData.workforce.total_employees || 'N/A',
                'Contract Employees': allData.workforce.contract_employees || 'N/A',
                'Expected Workforce (1 Year)': allData.workforce.expected_workforce_1_year || 'N/A',
                'Expected Workforce (2 Years)': allData.workforce.expected_workforce_2_years || 'N/A',
                'Expected Workforce (3 Years)': allData.workforce.expected_workforce_3_years || 'N/A',
                'Average Tenure (Active)': allData.workforce.average_tenure_active ? `${allData.workforce.average_tenure_active} years` : 'N/A',
                'Average Tenure (Leavers)': allData.workforce.average_tenure_leavers ? `${allData.workforce.average_tenure_leavers} years` : 'N/A',
                'Average Age (Active)': allData.workforce.average_age_active ? `${allData.workforce.average_age_active} years` : 'N/A',
                'Male Employees': allData.workforce.male_employees || 'N/A',
                'Female Employees': allData.workforce.female_employees || 'N/A',
                'Total Leaders Above Team Leader': allData.workforce.total_leaders_above_team_leader || 'N/A',
                'Leaders Percentage': allData.workforce.leaders_percentage ? `${allData.workforce.leaders_percentage}%` : 'N/A',
            } : {},
            org_chart_path: allData.workforce?.org_chart_path || null,
        },
        {
            id: 'executives',
            title: 'Executive Information',
            icon: UserCog,
            completed: stepStatus['executives'],
            data: allData.executives && Array.isArray(allData.executives) && allData.executives.length > 0 ? {
                'Total Executives': allData.executives.reduce((sum: number, e: any) => sum + (e.number_of_executives || 0), 0).toString(),
                'Positions': allData.executives.map((e: any) => `${e.position_title} (${e.number_of_executives})`).join(', '),
            } : {},
        },
        {
            id: 'job-grades',
            title: 'Job Grade System',
            icon: BriefcaseBusiness,
            completed: stepStatus['job-grades'],
            data: allData.jobGrades && Array.isArray(allData.jobGrades) && allData.jobGrades.length > 0 ? {
                'Total Grades': allData.jobGrades.length.toString(),
                'Grades': allData.jobGrades.map((g: any) => g.grade_name).filter((n: string) => n).join(', '),
            } : {},
        },
        {
            id: 'organizational-charts',
            title: 'Organizational Charts',
            icon: Upload,
            completed: stepStatus['organizational-charts'],
            data: allData.organizationalCharts && Array.isArray(allData.organizationalCharts) && allData.organizationalCharts.length > 0 ? {
                'Charts Uploaded': allData.organizationalCharts.length.toString(),
                'Years': allData.organizationalCharts.map((c: any) => c.chart_year_month || c.file_name).filter((y: string) => y).join(', '),
            } : {},
            charts: allData.organizationalCharts && Array.isArray(allData.organizationalCharts) && allData.organizationalCharts.length > 0 
                ? allData.organizationalCharts 
                : [],
        },
        {
            id: 'organizational-structure',
            title: 'Organizational Structure',
            icon: Network,
            completed: stepStatus['organizational-structure'],
            data: allData.organizationalStructure?.structure_types && Array.isArray(allData.organizationalStructure.structure_types) && allData.organizationalStructure.structure_types.length > 0 ? {
                'Structure Types': allData.organizationalStructure.structure_types.map((t: string) => {
                    const typeMap: Record<string, string> = {
                        'functional': 'Functional',
                        'divisional': 'Divisional',
                        'project_matrix': 'Project/Matrix',
                        'hq_subsidiary': 'HQ-Subsidiary',
                        'no_clearly_defined': 'No Clearly Defined Structure',
                    };
                    return typeMap[t] || t;
                }).join(', '),
            } : {},
        },
        {
            id: 'hr-issues',
            title: 'Key HR/Org Issues',
            icon: AlertTriangle,
            completed: stepStatus['hr-issues'],
            data: allData.hrIssues && Array.isArray(allData.hrIssues) && allData.hrIssues.length > 0 ? {
                'Total Issues': allData.hrIssues.length.toString(),
                'Issues': allData.hrIssues.map((i: any) => i.issue_type).filter((t: string) => t).join(', '),
            } : {},
        },
        {
            id: 'current-hr',
            title: 'Current HR',
            icon: Settings,
            completed: stepStatus['current-hr'],
            data: allData.currentHr ? {
                'Dedicated HR Team': allData.currentHr.dedicated_hr_team ? 'Yes' : 'No',
                'Labor Union Present': allData.currentHr.labor_union_present ? 'Yes' : 'No',
                'Labor Relations Stability': allData.currentHr.labor_relations_stability || 'N/A',
                'Evaluation System': allData.currentHr.evaluation_system_status || 'N/A',
                'Compensation System': allData.currentHr.compensation_system_status || 'N/A',
                'Job Rank Levels': allData.currentHr.job_rank_levels || 'N/A',
                'Job Title Levels': allData.currentHr.job_title_levels || 'N/A',
            } : {},
        },
        {
            id: 'culture',
            title: 'Culture',
            icon: MessageSquare,
            completed: stepStatus['culture'],
            data: allData.culture ? {
                'Work Format': allData.culture.work_format || 'N/A',
                'Decision Making Style': allData.culture.decision_making_style || 'N/A',
                'Core Values': Array.isArray(allData.culture.core_values) ? allData.culture.core_values.join(', ') : 'None',
            } : {},
        },
        {
            id: 'confidential',
            title: 'Confidential',
            icon: FileText,
            completed: stepStatus['confidential'],
            data: allData.confidential ? {
                'Notes': allData.confidential.notes || allData.confidential.confidential_note || 'None',
            } : {},
        },
    ];

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Review & Submit - Diagnosis" />

                    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                        <DiagnosisHeader
                            title="Step 1: Diagnosis"
                            description="Review all information before submitting"
                            status={status}
                            backHref={`${basePath}/confidential`}
                        />

                        <DiagnosisProgressBar
                            stepName="Review & Submit"
                            completedSteps={completedSteps}
                            totalSteps={totalSteps}
                            currentStep={12}
                        />

                        <DiagnosisTabs
                            tabs={tabs}
                            activeTab="review"
                            stepStatus={stepStatus}
                            stepOrder={stepOrder}
                            projectId={null}
                        />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Review & Submit Diagnosis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-sm text-muted-foreground mb-4">
                                Please review all information before submitting. Once submitted, you can proceed to the next steps.
                            </p>
                            
                            {/* Show all completed sections */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Completed Sections</h3>
                                {sections.filter(section => section.completed).length > 0 ? (
                                    sections.filter(section => section.completed).map((section) => {
                                const Icon = section.icon;
                                return (
                                            <div key={section.id} className="border rounded-lg p-4 bg-success/5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                        <Icon className="w-5 h-5 text-success" />
                                                        <h4 className="font-semibold">{section.title}</h4>
                                            </div>
                                                    <Badge className="bg-success/10 text-success border-success/20">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Completed
                                                </Badge>
                                        </div>
                                                {Object.keys(section.data).length > 0 ? (
                                            <div className="space-y-3 mt-3">
                                                <div className="grid md:grid-cols-2 gap-3">
                                                    {Object.entries(section.data).map(([key, value]) => (
                                                        <div key={key} className="bg-background rounded p-2">
                                                            <p className="text-xs text-muted-foreground mb-1">{key}</p>
                                                            <p className="text-sm font-medium">{String(value) || 'N/A'}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Show logo and banner images for company-info section */}
                                                {section.id === 'company-info' && ((section as any).logo_path || (section as any).image_path) && (
                                                    <div className="mt-4">
                                                        <p className="text-xs text-muted-foreground mb-2 font-medium">Company Images:</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {(section as any).logo_path && (
                                                                <div className="border rounded-lg p-3 bg-muted/30">
                                                                    <p className="text-xs font-medium mb-2">Company Logo</p>
                                                                    <img 
                                                                        src={(section as any).logo_path}
                                                                        alt="Company Logo"
                                                                        className="w-full h-32 object-contain rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                                        onClick={() => window.open((section as any).logo_path, '_blank')}
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.style.display = 'none';
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                            {(section as any).image_path && (
                                                                <div className="border rounded-lg p-3 bg-muted/30">
                                                                    <p className="text-xs font-medium mb-2">Banner Image</p>
                                                                    <img 
                                                                        src={(section as any).image_path}
                                                                        alt="Banner Image"
                                                                        className="w-full h-48 object-contain rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                                        onClick={() => window.open((section as any).image_path, '_blank')}
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.style.display = 'none';
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Show org chart image for workforce section */}
                                                {section.id === 'workforce' && (section as any).org_chart_path && (
                                                    <div className="mt-4">
                                                        <p className="text-xs text-muted-foreground mb-2 font-medium">Organization Chart:</p>
                                                        <div className="border rounded-lg p-3 bg-muted/30">
                                                            <img 
                                                                src={(section as any).org_chart_path}
                                                                alt="Organization Chart"
                                                                className="w-full max-w-md mx-auto h-64 object-contain rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                                onClick={() => window.open((section as any).org_chart_path, '_blank')}
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    const parent = target.parentElement;
                                                                    if (parent) {
                                                                        const errorDiv = document.createElement('div');
                                                                        errorDiv.className = 'w-full h-64 bg-muted rounded border flex items-center justify-center';
                                                                        errorDiv.innerHTML = '<p class="text-xs text-muted-foreground">Preview not available</p>';
                                                                        parent.appendChild(errorDiv);
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Show image previews for organizational charts */}
                                                {(section as any).charts && Array.isArray((section as any).charts) && (section as any).charts.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="text-xs text-muted-foreground mb-2 font-medium">Uploaded Charts Preview:</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            {(section as any).charts.map((chart: any, idx: number) => {
                                                                const filePath = chart.file_path;
                                                                const fileName = chart.file_name || chart.chart_year_month || `Chart ${idx + 1}`;
                                                                const yearMonth = chart.chart_year_month || '';
                                                                
                                                                // Check if file is in sessionStorage (not yet submitted)
                                                                let imageUrl: string | null = null;
                                                                let isImage = false;
                                                                
                                                                if (filePath) {
                                                                    isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);
                                                                    // Build proper URL
                                                                    if (filePath.startsWith('http') || filePath.startsWith('data:')) {
                                                                        imageUrl = filePath;
                                                                    } else if (filePath.startsWith('/')) {
                                                                        imageUrl = filePath;
                                                                    } else {
                                                                        imageUrl = `/storage/${filePath}`;
                                                                    }
                                                                } else if (yearMonth && typeof window !== 'undefined') {
                                                                    // Try to load from sessionStorage
                                                                    const fileData = sessionStorage.getItem(`org_chart_file_${yearMonth}`);
                                                                    if (fileData && fileData.startsWith('data:image')) {
                                                                        imageUrl = fileData;
                                                                        isImage = true;
                                                                    }
                                                                }
                                                                
                                                                return (
                                                                    <div key={idx} className="border rounded-lg p-3 bg-muted/30">
                                                                        <p className="text-xs font-medium mb-2">{yearMonth || fileName}</p>
                                                                        {imageUrl ? (
                                                                            isImage ? (
                                                                                <img 
                                                                                    src={imageUrl}
                                                                                    alt={fileName}
                                                                                    className="w-full h-32 object-contain rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                                                    onClick={() => {
                                                                                        if (imageUrl) {
                                                                                            if (imageUrl.startsWith('data:')) {
                                                                                                // For data URLs, open in new window
                                                                                                const newWindow = window.open();
                                                                                                if (newWindow) {
                                                                                                    newWindow.document.write(`<img src="${imageUrl}" style="max-width: 100%; height: auto;" />`);
                                                                                                }
                                                                                            } else {
                                                                                                window.open(imageUrl, '_blank');
                                                                                            }
                                                                                        }
                                                                                    }}
                                                                                    onError={(e) => {
                                                                                        const target = e.target as HTMLImageElement;
                                                                                        target.style.display = 'none';
                                                                                        const parent = target.parentElement;
                                                                                        if (parent) {
                                                                                            const errorDiv = document.createElement('div');
                                                                                            errorDiv.className = 'w-full h-32 bg-muted rounded border flex items-center justify-center';
                                                                                            errorDiv.innerHTML = '<p class="text-xs text-muted-foreground">Preview not available</p>';
                                                                                            parent.appendChild(errorDiv);
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <div className="w-full h-32 bg-muted rounded border flex items-center justify-center">
                                                                                    <FileText className="w-8 h-8 text-muted-foreground" />
                                                                                    <p className="text-xs text-muted-foreground ml-2">{fileName}</p>
                                                                                </div>
                                                                            )
                                                                        ) : (
                                                                            <div className="w-full h-32 bg-muted rounded border flex items-center justify-center">
                                                                                <p className="text-xs text-muted-foreground">No preview</p>
                                                                            </div>
                                                                        )}
                                                                        {(filePath || imageUrl) && (
                                                                            <a 
                                                                                href={imageUrl || (filePath.startsWith('http') || filePath.startsWith('/') ? filePath : `/storage/${filePath}`)}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-xs text-primary hover:underline mt-2 block"
                                                                                onClick={(e) => {
                                                                                    if (imageUrl && imageUrl.startsWith('data:')) {
                                                                                        e.preventDefault();
                                                                                        const newWindow = window.open();
                                                                                        if (newWindow) {
                                                                                            newWindow.document.write(`<img src="${imageUrl}" style="max-width: 100%; height: auto;" />`);
                                                                                        }
                                                                                    }
                                                                                }}
                                                                            >
                                                                                View File
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No data provided</p>
                                        )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-muted-foreground">No sections completed yet.</p>
                                )}
                            </div>
                            
                            {/* Show incomplete sections warning */}
                            {sections.filter(section => !section.completed).length > 0 && (
                                <div className="border-2 border-warning/20 rounded-lg p-4 bg-warning/5">
                                    <h3 className="font-semibold mb-2 text-warning">Incomplete Sections</h3>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Please complete the following sections before submitting:
                                    </p>
                                    <div className="space-y-2">
                                        {sections.filter(section => !section.completed).map((section) => {
                                            const Icon = section.icon;
                                            return (
                                                <div key={section.id} className="flex items-center gap-2 text-sm">
                                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                                    <span>{section.title}</span>
                                    </div>
                                );
                            })}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="pt-6 border-t">
                                <div className="flex justify-between items-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(`${basePath}/confidential`)}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={isSubmitting || sections.filter(s => !s.completed).length > 0} 
                                        size="lg"
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Diagnosis'}
                                        <CheckCircle2 className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                                {sections.filter(s => !s.completed).length > 0 && (
                                    <p className="text-xs text-muted-foreground text-right mt-2">
                                        Please complete all sections before submitting
                                    </p>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
