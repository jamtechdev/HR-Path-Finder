import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Edit, Building2, Briefcase, Users, UserCog, UserCheck, FileText, Image as ImageIcon, Download, Eye, Layers } from 'lucide-react';

interface Diagnosis {
    id: number;
    industry_category?: string;
    industry_subcategory?: string;
    industry_other?: string;
    present_headcount?: number;
    expected_headcount_1y?: number;
    expected_headcount_2y?: number;
    expected_headcount_3y?: number;
    average_tenure_active?: number;
    average_tenure_leavers?: number;
    average_age?: number;
    gender_male?: number;
    gender_female?: number;
    gender_other?: number;
    gender_ratio?: number;
    total_executives?: number;
    executive_positions?: Array<{ position: string; count: number }> | Record<string, number>;
    leadership_count?: number;
    leadership_percentage?: number;
    job_grade_names?: string[];
    promotion_years?: number[] | Record<string, number>;
    organizational_charts?: string[] | Record<string, string>;
    org_structure_types?: string[];
    org_structure_explanations?: Record<string, string>;
    hr_issues?: string[];
    custom_hr_issues?: string;
    job_categories?: string[];
    job_functions?: string[];
    [key: string]: any;
}

interface Company {
    name: string;
    hq_location?: string;
    logo_path?: string;
    foundation_date?: string;
    brand_name?: string;
    registration_number?: string;
    is_public?: boolean;
    public_listing_status?: string;
}

interface Props {
    project: {
        id: number;
        company: Company;
    };
    company: Company;
    diagnosis?: Diagnosis;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
}

export default function Review({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
}: Props) {
    const { post, processing } = useForm({});

    const handleSubmit = () => {
        if (projectId) {
            post(`/hr-manager/diagnosis/${projectId}/submit`, {
                onSuccess: () => {
                    // Redirect to dashboard after successful submission
                    router.visit('/hr-manager/dashboard');
                },
            });
        }
    };

    const getEditUrl = (tab: string) => {
        return projectId ? `/hr-manager/diagnosis/${projectId}/${tab}` : `/hr-manager/diagnosis/${tab}`;
    };

    const formatValue = (value: any): string => {
        if (value === null || value === undefined || value === '') return '-';
        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                return value.length > 0 ? value.join(', ') : '-';
            }
            return JSON.stringify(value);
        }
        return String(value);
    };

    const formatNumber = (value: number | string | null | undefined): string => {
        if (value === null || value === undefined || value === '') return '-';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '-';
        return numValue.toLocaleString();
    };

    const formatPercentage = (value: number | string | null | undefined): string => {
        if (value === null || value === undefined || value === '') return '-';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '-';
        return `${numValue.toFixed(1)}%`;
    };

    const formatCurrency = (value: number | string | null | undefined): string => {
        if (value === null || value === undefined || value === '') return '-';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '-';
        if (numValue >= 1000) {
            return `₩${(numValue / 1000).toFixed(1)}B`;
        }
        return `₩${numValue.toFixed(1)}B`;
    };

    // Parse executive positions
    const getExecutivePositions = (): Array<{ position: string; count: number }> => {
        if (!diagnosis?.executive_positions) return [];
        
        if (Array.isArray(diagnosis.executive_positions)) {
            return diagnosis.executive_positions;
        }
        
        if (typeof diagnosis.executive_positions === 'object') {
            return Object.entries(diagnosis.executive_positions).map(([position, count]) => ({
                position,
                count: typeof count === 'number' ? count : parseInt(String(count), 10)
            }));
        }
        
        return [];
    };

    // Parse org structure explanations
    const getOrgStructureExplanations = (): Record<string, string> => {
        if (!diagnosis?.org_structure_explanations) return {};
        if (typeof diagnosis.org_structure_explanations === 'object') {
            return diagnosis.org_structure_explanations as Record<string, string>;
        }
        return {};
    };

    return (
        <>
            <Head title={`Review & Submit - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title="Review & Submit Diagnosis"
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="hr-issues"
                showNext={false}
            >
                <div className="space-y-6">
                    {/* Company Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    <CardTitle>Company Information</CardTitle>
                                </div>
                                <Link href={getEditUrl('company-info')}>
                                    <Button variant="ghost" size="sm">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Company Logo */}
                            {company.logo_path && (() => {
                                const getLogoUrl = (path: string): string => {
                                    if (!path) return '';
                                    if (path.startsWith('http://') || path.startsWith('https://')) {
                                        return path;
                                    }
                                    if (path.startsWith('/storage/')) {
                                        return path;
                                    }
                                    if (path.startsWith('storage/')) {
                                        return `/${path}`;
                                    }
                                    return `/storage/${path}`;
                                };
                                
                                const logoUrl = getLogoUrl(company.logo_path);
                                
                                return (
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-muted-foreground min-w-[120px]">Company Logo:</span>
                                        <div className="flex items-center gap-2">
                                            <img 
                                                src={logoUrl} 
                                                alt={company.name}
                                                className="w-20 h-20 object-contain border rounded-lg p-2 bg-muted"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent) {
                                                        const errorDiv = document.createElement('div');
                                                        errorDiv.className = 'flex items-center gap-2 text-muted-foreground';
                                                        errorDiv.innerHTML = '<span>Logo not found</span>';
                                                        parent.appendChild(errorDiv);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })()}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Company Name:</span>
                                    <span className="font-medium">{company.name}</span>
                                </div>
                                {company.registration_number && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Registration Number:</span>
                                        <span className="font-medium">{company.registration_number}</span>
                                    </div>
                                )}
                                {company.brand_name && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Brand Name:</span>
                                        <span className="font-medium">{company.brand_name}</span>
                                    </div>
                                )}
                                {company.foundation_date && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Foundation Date:</span>
                                        <span className="font-medium">{company.foundation_date}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">HQ Location:</span>
                                    <span className="font-medium">{formatValue(company.hq_location)}</span>
                                </div>
                                {(company.is_public !== undefined || company.public_listing_status) && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Public Listing Status:</span>
                                        <span className="font-medium">
                                            {company.public_listing_status 
                                                ? company.public_listing_status.charAt(0).toUpperCase() + company.public_listing_status.slice(1)
                                                : company.is_public ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Primary Industry:</span>
                                    <span className="font-medium">{formatValue(diagnosis?.industry_category)}</span>
                                </div>
                                {diagnosis?.industry_subcategory && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Industry Subcategory:</span>
                                        <span className="font-medium">{formatValue(diagnosis.industry_subcategory)}</span>
                                    </div>
                                )}
                                {diagnosis?.industry_other && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Other Industry:</span>
                                        <span className="font-medium">{formatValue(diagnosis.industry_other)}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Workforce */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-primary" />
                                    <CardTitle>Workforce</CardTitle>
                                </div>
                                <Link href={getEditUrl('workforce')}>
                                    <Button variant="ghost" size="sm">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Current Headcount:</span>
                                    <span className="font-medium">{formatNumber(diagnosis?.present_headcount)}</span>
                                </div>
                                {diagnosis?.expected_headcount_1y && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Expected (1 Year):</span>
                                        <span className="font-medium">{formatNumber(diagnosis.expected_headcount_1y)}</span>
                                    </div>
                                )}
                                {diagnosis?.expected_headcount_2y && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Expected (2 Years):</span>
                                        <span className="font-medium">{formatNumber(diagnosis.expected_headcount_2y)}</span>
                                    </div>
                                )}
                                {diagnosis?.expected_headcount_3y && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Expected (3 Years):</span>
                                        <span className="font-medium">{formatNumber(diagnosis.expected_headcount_3y)}</span>
                                    </div>
                                )}
                                {diagnosis?.average_age && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Average Age:</span>
                                        <span className="font-medium">{formatNumber(diagnosis.average_age)} years</span>
                                    </div>
                                )}
                                {diagnosis?.average_tenure_active && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Avg Tenure (Active):</span>
                                        <span className="font-medium">{formatNumber(diagnosis.average_tenure_active)} years</span>
                                    </div>
                                )}
                                {diagnosis?.average_tenure_leavers && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Avg Tenure (Leavers):</span>
                                        <span className="font-medium">{formatNumber(diagnosis.average_tenure_leavers)} years</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Gender Distribution */}
                            {(diagnosis?.gender_male || diagnosis?.gender_female || diagnosis?.gender_other) && (
                                <div className="mt-4 pt-4 border-t">
                                    <h4 className="font-medium mb-3">Gender Distribution</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {diagnosis.gender_male && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Male:</span>
                                                <span className="font-medium">{formatNumber(diagnosis.gender_male)}</span>
                                            </div>
                                        )}
                                        {diagnosis.gender_female && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Female:</span>
                                                <span className="font-medium">{formatNumber(diagnosis.gender_female)}</span>
                                            </div>
                                        )}
                                        {diagnosis.gender_other && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Other:</span>
                                                <span className="font-medium">{formatNumber(diagnosis.gender_other)}</span>
                                            </div>
                                        )}
                                        {diagnosis.gender_ratio && (
                                            <div className="flex justify-between col-span-full">
                                                <span className="text-muted-foreground">Gender Ratio (Male %):</span>
                                                <span className="font-medium">{formatPercentage(diagnosis.gender_ratio)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Executives */}
                    {diagnosis?.total_executives && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <UserCog className="w-5 h-5 text-primary" />
                                        <CardTitle>Executives</CardTitle>
                                    </div>
                                    <Link href={getEditUrl('executives')}>
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Executives:</span>
                                        <span className="font-medium">{formatNumber(diagnosis.total_executives)}</span>
                                    </div>
                                </div>
                                
                                {/* Executive Positions */}
                                {getExecutivePositions().length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <h4 className="font-medium mb-3">Executive Positions</h4>
                                        <div className="space-y-2">
                                            {getExecutivePositions().map((pos, index) => (
                                                <div key={index} className="flex justify-between">
                                                    <span className="text-muted-foreground">{pos.position}:</span>
                                                    <span className="font-medium">{pos.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Leaders */}
                    {diagnosis?.leadership_count && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="w-5 h-5 text-primary" />
                                        <CardTitle>Leaders</CardTitle>
                                    </div>
                                    <Link href={getEditUrl('leaders')}>
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Leadership Count:</span>
                                        <span className="font-medium">{formatNumber(diagnosis.leadership_count)}</span>
                                    </div>
                                    {diagnosis.leadership_percentage && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Leadership Percentage:</span>
                                            <span className="font-medium">{formatPercentage(diagnosis.leadership_percentage)}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Job Grades */}
                    {diagnosis?.job_grade_names && Array.isArray(diagnosis.job_grade_names) && diagnosis.job_grade_names.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Job Grades</CardTitle>
                                    <Link href={getEditUrl('job-grades')}>
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {diagnosis.job_grade_names.map((grade, index) => {
                                        const promotionYears = diagnosis.promotion_years && typeof diagnosis.promotion_years === 'object' 
                                            ? (diagnosis.promotion_years as Record<string, number>)[grade] 
                                            : null;
                                        
                                        return (
                                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                                                <Badge variant="secondary">{grade}</Badge>
                                                {promotionYears !== null && promotionYears !== undefined && (
                                                    <span className="text-sm text-muted-foreground">
                                                        Promotion: {promotionYears} years
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Organizational Charts - Always show this section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-primary" />
                                    <CardTitle>Organizational Charts</CardTitle>
                                </div>
                                <Link href={getEditUrl('organizational-charts')}>
                                    <Button variant="ghost" size="sm">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                const REQUIRED_YEARS = ['2023.12', '2024.12', '2025.12'];
                                let chartsMap: Record<string, string> = {};
                                
                                if (diagnosis?.organizational_charts) {
                                    // Check if it's an object with year keys first (preferred format from backend)
                                    if (typeof diagnosis.organizational_charts === 'object' && 
                                        diagnosis.organizational_charts !== null && 
                                        !Array.isArray(diagnosis.organizational_charts)) {
                                        // Object format: { "2023.12": "path/to/file", ... }
                                        Object.entries(diagnosis.organizational_charts).forEach(([year, path]) => {
                                            if (REQUIRED_YEARS.includes(year) && !chartsMap[year]) {
                                                // Handle different possible structures
                                                let pathValue = '';
                                                if (typeof path === 'string') {
                                                    pathValue = path;
                                                } else if (typeof path === 'object' && path !== null) {
                                                    const pathObj = path as any;
                                                    pathValue = pathObj.path || pathObj.file_url || '';
                                                }
                                                if (pathValue) {
                                                    chartsMap[year] = String(pathValue);
                                                }
                                            }
                                        });
                                    } else if (Array.isArray(diagnosis.organizational_charts)) {
                                        // Array format: ["path1", "path2", ...] - map to years by index
                                        diagnosis.organizational_charts.forEach((chart, index) => {
                                            if (index < REQUIRED_YEARS.length && !chartsMap[REQUIRED_YEARS[index]]) {
                                                let path = '';
                                                if (typeof chart === 'string') {
                                                    path = chart;
                                                } else if (typeof chart === 'object' && chart !== null) {
                                                    const chartObj = chart as any;
                                                    path = chartObj.path || chartObj.file_url || '';
                                                }
                                                if (path) {
                                                    chartsMap[REQUIRED_YEARS[index]] = String(path);
                                                }
                                            }
                                        });
                                    }
                                }
                                
                                const getImageUrl = (path: string | null | undefined): string => {
                                    if (!path || typeof path !== 'string' || path.trim() === '') return '';
                                    
                                    // If it's already a full URL, return as is
                                    if (path.startsWith('http://') || path.startsWith('https://')) {
                                        return path;
                                    }
                                    
                                    // If it starts with /storage/, return as is
                                    if (path.startsWith('/storage/')) {
                                        return path;
                                    }
                                    
                                    // If it starts with storage/, add leading slash
                                    if (path.startsWith('storage/')) {
                                        return `/${path}`;
                                    }
                                    
                                    // Otherwise, prepend /storage/
                                    return `/storage/${path}`;
                                };
                                
                                const isImageFile = (path: string | null | undefined): boolean => {
                                    if (!path || typeof path !== 'string') return false;
                                    const lowerPath = path.toLowerCase();
                                    return lowerPath.endsWith('.jpg') || 
                                           lowerPath.endsWith('.jpeg') || 
                                           lowerPath.endsWith('.png') || 
                                           lowerPath.endsWith('.gif') || 
                                           lowerPath.endsWith('.webp');
                                };
                                
                                const isPdfFile = (path: string | null | undefined): boolean => {
                                    if (!path || typeof path !== 'string') return false;
                                    return path.toLowerCase().endsWith('.pdf');
                                };
                                
                                const isSubmitted = diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
                                
                                return (
                                    <div className="space-y-4">
                                        {REQUIRED_YEARS.map((year) => {
                                            const chartPathValue = chartsMap[year];
                                            const chartPath = (typeof chartPathValue === 'string' && chartPathValue) ? chartPathValue : '';
                                            const imageUrl = chartPath ? getImageUrl(chartPath) : '';
                                            const isImage = chartPath ? isImageFile(chartPath) : false;
                                            const isPdf = chartPath ? isPdfFile(chartPath) : false;
                                            const hasFile = !!chartPath;
                                            
                                            return (
                                                <div key={year} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm font-medium text-foreground min-w-[80px]">{year}:</span>
                                                        {hasFile && isImage ? (
                                                            <div className="flex items-center gap-2">
                                                                <img 
                                                                    src={imageUrl}
                                                                    alt={`Organizational Chart ${year}`}
                                                                    className="w-20 h-20 object-contain border rounded-lg p-2 bg-muted"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = 'none';
                                                                        const parent = target.parentElement;
                                                                        if (parent) {
                                                                            const errorDiv = document.createElement('span');
                                                                            errorDiv.className = 'text-sm text-muted-foreground';
                                                                            errorDiv.textContent = 'Image not found';
                                                                            parent.appendChild(errorDiv);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : hasFile && isPdf ? (
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-5 h-5 text-muted-foreground" />
                                                                <span className="text-sm text-muted-foreground">PDF File</span>
                                                                <a 
                                                                    href={imageUrl} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm text-primary hover:text-primary/80 ml-2"
                                                                >
                                                                    View PDF
                                                                </a>
                                                            </div>
                                                        ) : hasFile ? (
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-5 h-5 text-muted-foreground" />
                                                                <span className="text-sm text-muted-foreground">{chartPath.split('/').pop()}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">No file uploaded</span>
                                                        )}
                                                    </div>
                                                    {hasFile && (
                                                        <a 
                                                            href={imageUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:text-primary/80"
                                                            title="View in new tab"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>

                    {/* Organizational Structure */}
                    {diagnosis?.org_structure_types && Array.isArray(diagnosis.org_structure_types) && diagnosis.org_structure_types.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Organizational Structure</CardTitle>
                                    <Link href={getEditUrl('organizational-structure')}>
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {diagnosis.org_structure_types.map((type, index) => (
                                        <Badge key={index} variant="outline">{type}</Badge>
                                    ))}
                                </div>
                                
                                {/* Structure Explanations */}
                                {Object.keys(getOrgStructureExplanations()).length > 0 && (
                                    <div className="space-y-3 pt-4 border-t">
                                        {Object.entries(getOrgStructureExplanations()).map(([type, explanation]) => (
                                            <div key={type}>
                                                <h4 className="font-medium mb-1">{type}</h4>
                                                <p className="text-sm text-muted-foreground">{explanation}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Job Structure */}
                    {((diagnosis?.job_categories && Array.isArray(diagnosis.job_categories) && diagnosis.job_categories.length > 0) ||
                      (diagnosis?.job_functions && Array.isArray(diagnosis.job_functions) && diagnosis.job_functions.length > 0)) && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-primary" />
                                        <CardTitle>Job Structure</CardTitle>
                                    </div>
                                    <Link href={getEditUrl('job-structure')}>
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {diagnosis.job_categories && Array.isArray(diagnosis.job_categories) && diagnosis.job_categories.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2 text-sm text-muted-foreground">Job Categories</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {diagnosis.job_categories.map((category, index) => (
                                                <Badge key={index} variant="secondary">{category}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {diagnosis.job_functions && Array.isArray(diagnosis.job_functions) && diagnosis.job_functions.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2 text-sm text-muted-foreground">Job Functions</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {diagnosis.job_functions.map((func, index) => (
                                                <Badge key={index} variant="outline">{func}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* HR Issues */}
                    {((diagnosis?.hr_issues && Array.isArray(diagnosis.hr_issues) && diagnosis.hr_issues.length > 0) ||
                      diagnosis?.custom_hr_issues) && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>HR Issues</CardTitle>
                                    <Link href={getEditUrl('hr-issues')}>
                                        <Button variant="ghost" size="sm">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {diagnosis.hr_issues && Array.isArray(diagnosis.hr_issues) && diagnosis.hr_issues.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2 text-sm text-muted-foreground">Selected HR Issues</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {diagnosis.hr_issues.map((issue, index) => (
                                                <Badge key={index} variant="destructive">{issue}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {diagnosis.custom_hr_issues && (
                                    <div>
                                        <h4 className="font-medium mb-2 text-sm text-muted-foreground">Custom HR Issues</h4>
                                        <div className="p-4 bg-muted rounded-lg border">
                                            <p className="text-sm whitespace-pre-wrap">{diagnosis.custom_hr_issues}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Submit Section */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Ready to Submit?</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Review all sections above and submit the diagnosis for CEO review.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={processing || diagnosisStatus === 'submitted'}
                                    size="lg"
                                >
                                    {diagnosisStatus === 'submitted' ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Submitted
                                        </>
                                    ) : (
                                        'Submit Diagnosis'
                                    )}
                                </Button>
                            </div>
                            {diagnosisStatus === 'submitted' && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        Diagnosis has been submitted and is awaiting CEO review.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </FormLayout>
        </>
    );
}
