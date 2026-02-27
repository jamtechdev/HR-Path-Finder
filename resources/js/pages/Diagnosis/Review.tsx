import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2,AlertCircle, Edit, Building2, Network, Users, UserCog, UserCheck, FileText, Image as ImageIcon, Download, Eye, Layers , TrendingUp , Clock, Mail, X } from 'lucide-react';

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
    id: number;
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
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteProcessing, setInviteProcessing] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState(false);

    const handleSubmit = () => {
        if (projectId) {
            post(`/hr-manager/diagnosis/${projectId}/submit`, {
                onSuccess: () => {
                    // Show success modal instead of redirecting
                    setShowSuccessModal(true);
                },
            });
        }
    };

    const handleInviteCeo = (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError('');
        setInviteSuccess(false);

        if (!inviteEmail || !inviteEmail.includes('@')) {
            setInviteError('Please enter a valid email address');
            return;
        }

        setInviteProcessing(true);
        
        router.post(`/companies/${company.id}/invite-ceo`, {
            email: inviteEmail,
            hr_project_id: projectId,
        }, {
            onSuccess: () => {
                setInviteSuccess(true);
                setInviteProcessing(false);
                setInviteError('');
            },
            onError: (errors) => {
                setInviteError(errors.email || 'Failed to send invitation. Please try again.');
                setInviteProcessing(false);
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        setInviteEmail('');
        setInviteError('');
        setInviteSuccess(false);
        // Redirect to dashboard after closing modal
        router.visit('/hr-manager/dashboard');
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
            
            {/* Success Modal with Invite CEO */}
            <Dialog open={showSuccessModal} onOpenChange={(open) => {
                if (!open) {
                    handleCloseModal();
                } else {
                    setShowSuccessModal(true);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-2xl">Diagnosis Submitted Successfully!</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            Your diagnosis has been submitted for CEO review. You can now invite the CEO to join the platform.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        {!inviteSuccess ? (
                            <form onSubmit={handleInviteCeo} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ceo-email">CEO Email Address</Label>
                                    <Input
                                        id="ceo-email"
                                        type="email"
                                        placeholder="ceo@company.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        disabled={inviteProcessing}
                                        required
                                        className={inviteError ? 'border-red-500' : ''}
                                    />
                                    {inviteError && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            {inviteError}
                                        </p>
                                    )}
                                </div>
                                
                                <DialogFooter className="flex-col sm:flex-row gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCloseModal}
                                        disabled={inviteProcessing}
                                        className="w-full sm:w-auto"
                                    >
                                        Skip for Now
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={inviteProcessing || !inviteEmail}
                                        className="w-full sm:w-auto"
                                    >
                                        {inviteProcessing ? (
                                            <>
                                                <span className="animate-spin mr-2">⏳</span>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-4 h-4 mr-2" />
                                                Invite CEO
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-green-800">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <p className="font-medium">Invitation sent successfully!</p>
                                    </div>
                                    <p className="text-sm text-green-700 mt-2">
                                        An invitation email has been sent to <strong>{inviteEmail}</strong>. The CEO will receive instructions to join the platform.
                                    </p>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleCloseModal}
                                        className="w-full"
                                    >
                                        Done
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

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
                    <Card className="overflow-hidden border-slate-200 shadow-sm py-0">
                         <CardHeader className="bg-slate-900 py-3 text-white">
                            <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-white/10 p-2">
                                <Building2 className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                <CardTitle className="text-lg font-bold tracking-tight">Company Information</CardTitle>
                                <p className="text-xs text-slate-400">Corporate identity and registration details</p>
                                </div>
                            </div>
                            <Link href={getEditUrl('company-info')}>
                                <Button 
                                variant="secondary" 
                                size="sm" 
                                className="gap-2 rounded-full bg-blue-600 font-semibold text-white hover:bg-blue-500 border-none transition-all"
                                >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
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
                                <div className="bg-white p-4 flex flex-col gap-1 hover:bg-slate-50/50 transition-colors">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Company Name:</span>
                                    <span className="text-sm font-medium text-slate-700  text-blue-600">{company.name}</span>
                                </div>
                                {company.registration_number && (
                                    <div className="bg-white p-4 flex flex-col gap-1 hover:bg-slate-50/50 transition-colors">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Registration Number:</span>
                                        <span className="text-sm font-medium text-slate-700  text-blue-600">{company.registration_number}</span>
                                    </div>
                                )}
                                {company.brand_name && (
                                    <div className="bg-white p-4 flex flex-col gap-1 hover:bg-slate-50/50 transition-colors">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Brand Name:</span>
                                        <span className="text-sm font-medium text-slate-700  text-blue-600">{company.brand_name}</span>
                                    </div>
                                )}
                                {company.foundation_date && (
                                    <div className="bg-white p-4 flex flex-col gap-1 hover:bg-slate-50/50 transition-colors">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Foundation Date:</span>
                                        <span className="text-sm font-medium text-slate-700  text-blue-600">{company.foundation_date}</span>
                                    </div>
                                )}
                                <div className="bg-white p-4 flex flex-col gap-1 hover:bg-slate-50/50 transition-colors">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">HQ Location:</span>
                                    <span className="text-sm font-medium text-slate-700  text-blue-600">{formatValue(company.hq_location)}</span>
                                </div>
                                {(company.is_public !== undefined || company.public_listing_status) && (
                                    <div className="bg-white p-4 flex flex-col gap-1 hover:bg-slate-50/50 transition-colors">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Public Listing Status:</span>
                                        <span className="text-sm font-medium text-slate-700  text-blue-600">
                                            {company.public_listing_status 
                                                ? company.public_listing_status.charAt(0).toUpperCase() + company.public_listing_status.slice(1)
                                                : company.is_public ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                )}
                                <div className="bg-white p-4 flex flex-col gap-1 hover:bg-slate-50/50 transition-colors">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Primary Industry:</span>
                                    <span className="text-sm font-medium text-slate-700  text-blue-600">{formatValue(diagnosis?.industry_category)}</span>
                                </div>
                                {diagnosis?.industry_subcategory && (
                                    <div className="bg-white p-4 flex flex-col gap-1 hover:bg-slate-50/50 transition-colors">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Industry Subcategory:</span>
                                        <span className="text-sm font-medium text-slate-700  text-blue-600">{formatValue(diagnosis.industry_subcategory)}</span>
                                    </div>
                                )}
                                {diagnosis?.industry_other && (
                                    <div className="bg-white p-4 flex flex-col gap-1 hover:bg-slate-50/50 transition-colors">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Other Industry:</span>
                                        <span className="text-sm font-medium text-slate-700  text-blue-600">{formatValue(diagnosis.industry_other)}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                
                    </Card>

                    {/* Workforce */}
                    <Card className="overflow-hidden border-slate-200 shadow-sm  py-0">
                        <CardHeader className="bg-slate-900 py-3 text-white">
                            <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-white/10 p-2">
                                <Users className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                <CardTitle className="text-lg font-bold tracking-tight">Workforce Metrics</CardTitle>
                                <p className="text-xs text-slate-400">Headcount, demographics, and tenure</p>
                                </div>
                            </div>
                            <Link href={getEditUrl('workforce')}>
                                <Button 
                                variant="secondary" 
                                size="sm" 
                                className="gap-2 rounded-full bg-emerald-600 font-semibold text-white hover:bg-emerald-500 border-none transition-all"
                                >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                                </Button>
                            </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Headcount:</span>
                                    <span className="text-lg font-semibold text-slate-700">{formatNumber(diagnosis?.present_headcount)}</span>
                                </div>
                                {diagnosis?.expected_headcount_1y && (
                                    <div className="bg-white p-4 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expected (1 Year):</span>
                                        <span className="text-lg font-semibold text-slate-700">{formatNumber(diagnosis.expected_headcount_1y)}</span>
                                    </div>
                                )}
                                {diagnosis?.expected_headcount_2y && (
                                    <div className="bg-white p-4 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expected (2 Years):</span>
                                        <span className="text-lg font-semibold text-slate-700">{formatNumber(diagnosis.expected_headcount_2y)}</span>
                                    </div>
                                )}
                                {diagnosis?.expected_headcount_3y && (
                                    <div className="bg-white p-4 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Expected (3 Years):</span>
                                        <span className="text-lg font-semibold text-slate-700">{formatNumber(diagnosis.expected_headcount_3y)}</span>
                                    </div>
                                )}
                                {diagnosis?.average_age && (
                                    <div className="bg-white p-4 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Average Age:</span>
                                        <span className="text-lg font-semibold text-slate-700">{formatNumber(diagnosis.average_age)} years</span>
                                    </div>
                                )}
                                {diagnosis?.average_tenure_active && (
                                    <div className="bg-white p-4 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avg Tenure (Active):</span>
                                        <span className="text-lg font-semibold text-slate-700">{formatNumber(diagnosis.average_tenure_active)} years</span>
                                    </div>
                                )}
                                {diagnosis?.average_tenure_leavers && (
                                    <div className="bg-white p-4 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avg Tenure (Leavers):</span>
                                        <span className="text-lg font-semibold text-slate-700">{formatNumber(diagnosis.average_tenure_leavers)} years</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Gender Distribution */}
                            {(diagnosis?.gender_male || diagnosis?.gender_female || diagnosis?.gender_other) && (
                                <div className="mt-4 pt-4 border-t">
                                    <h4 className="text-lg font-semibold text-slate-700 mb-3">Gender Distribution</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {diagnosis.gender_male && (
                                            <div className="bg-white p-4 flex flex-col gap-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Male:</span>
                                                <span className="text-lg font-semibold text-slate-700">{formatNumber(diagnosis.gender_male)}</span>
                                            </div>
                                        )}
                                        {diagnosis.gender_female && (
                                            <div className="bg-white p-4 flex flex-col gap-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Female:</span>
                                                <span className="text-lg font-semibold text-slate-700">{formatNumber(diagnosis.gender_female)}</span>
                                            </div>
                                        )}
                                        {diagnosis.gender_other && (
                                            <div className="bg-white p-4 flex flex-col gap-1">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Other:</span>
                                                <span className="text-lg font-semibold text-slate-700">{formatNumber(diagnosis.gender_other)}</span>
                                            </div>
                                        )}
                                        {diagnosis.gender_ratio && (
                                            <div className="bg-white p-4 flex flex-col gap-1 col-span-full">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gender Ratio (Male %):</span>
                                                <span className="text-lg font-semibold text-slate-700">{formatPercentage(diagnosis.gender_ratio)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Executives */}
                    {diagnosis?.total_executives && (
                        <Card className="overflow-hidden border-slate-200 shadow-sm  py-0">
                             <CardHeader className="bg-slate-900 py-3 text-white">
                                <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-white/10 p-2">
                                    <UserCog className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <div>
                                    <CardTitle className="text-lg font-bold tracking-tight">Executives</CardTitle>
                                    <p className="text-xs text-slate-400">Leadership structure and composition</p>
                                    </div>
                                </div>
                                <Link href={getEditUrl('executives')}>
                                    <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="gap-2 rounded-full bg-indigo-600 font-semibold text-white hover:bg-indigo-500 border-none transition-all"
                                    >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                    </Button>
                                </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Executives:</span>
                                        <span className="text-lg font-semibold text-slate-700">{formatNumber(diagnosis.total_executives)}</span>
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
                        <Card className="overflow-hidden border-slate-200 shadow-sm  py-0">
                            <CardHeader className="bg-slate-900 py-3 text-white">
                                <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-white/10 p-2">
                                    <UserCheck className="h-5 w-5 text-rose-400" />
                                    </div>
                                    <div>
                                    <CardTitle className="text-lg font-bold tracking-tight">Management Layer</CardTitle>
                                    <p className="text-xs text-slate-400">Department heads and team leads</p>
                                    </div>
                                </div>
                                <Link href={getEditUrl('leaders')}>
                                    <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="gap-2 rounded-full bg-rose-600 font-semibold text-white hover:bg-rose-500 border-none transition-all"
                                    >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                    </Button>
                                </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Leadership Count:</span>
                                        <span className="text-lg font-semibold text-slate-700">{formatNumber(diagnosis.leadership_count)}</span>
                                    </div>
                                    {diagnosis.leadership_percentage && (
                                        <div className="bg-white p-4 flex flex-col gap-1">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Leadership Percentage:</span>
                                            <span className="text-lg font-semibold text-slate-700">{formatPercentage(diagnosis.leadership_percentage)}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Job Grades */}
                    {diagnosis?.job_grade_names && Array.isArray(diagnosis.job_grade_names) && diagnosis.job_grade_names.length > 0 && (
                        <Card className="overflow-hidden border-slate-200 shadow-sm  py-0">
                            <CardHeader className="bg-slate-900 py-3 text-white">
                                <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-white/10 p-2">
                                    <TrendingUp className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div>
                                    <CardTitle className="text-lg font-bold tracking-tight">Job Grades</CardTitle>
                                    <p className="text-xs text-slate-400">Career leveling and promotion cycles</p>
                                    </div>
                                </div>
                                <Link href={getEditUrl('job-grades')}>
                                    <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="gap-2 rounded-full bg-amber-600 font-semibold text-white hover:bg-amber-500 border-none transition-all"
                                    >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Edit</span>
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
                                            <div key={index} className="flex items-center justify-between p-2  rounded">
                                                <Badge variant="secondary" className="text-sm font-bold text-slate-700">{grade}</Badge>
                                                {promotionYears !== null && promotionYears !== undefined && (
                                                    <div className="flex items-center gap-2 self-end sm:self-auto bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm transition-all group-hover:bg-white group-hover:border-amber-200">
                                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                        <span className="text-xs font-semibold text-slate-600">
                                                        {promotionYears} <span className="font-normal text-slate-400 text-[10px] uppercase ml-1 text-nowrap">Avg. Years to Promote</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Organizational Charts - Always show this section */}
                    <Card className="overflow-hidden border-slate-200 shadow-sm  py-0">
                         <CardHeader className="bg-slate-900 py-3 text-white">
                            <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-white/10 p-2">
                                <ImageIcon className="h-5 w-5 text-sky-400" />
                                </div>
                                <div>
                                <CardTitle className="text-lg font-bold tracking-tight">Organizational Charts</CardTitle>
                                <p className="text-xs text-slate-400">Historical structural documentation</p>
                                </div>
                            </div>
                            <Link href={getEditUrl('organizational-charts')}>
                                <Button 
                                variant="secondary" 
                                size="sm" 
                                className="gap-2 rounded-full bg-sky-600 font-semibold text-white hover:bg-sky-500 border-none transition-all"
                                >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Update</span>
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
                                                <div key={year} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
                                                    <div className="flex items-center flex-row-reverse gap-4">
                                                        <span className="text-sm font-medium text-foreground min-w-[80px]">{year}:</span>
                                                        {hasFile && isImage ? (
                                                            <div className="w-24 h-24 rounded-lg overflow-hidden border bg-gray-100">
                                                                <img 
                                                                    src={imageUrl}
                                                                    alt={`Organizational Chart ${year}`}
                                                                    className="w-full h-full object-cover"
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
                       <Card className="overflow-hidden border-slate-200 shadow-sm  py-0">
                        <CardHeader className="bg-slate-900 py-3 text-white">
                            <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-white/10 p-2">
                                <Network className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                <CardTitle className="text-lg font-bold tracking-tight">Org Structure</CardTitle>
                                <p className="text-xs text-slate-400">Framework and reporting logic</p>
                                </div>
                            </div>
                            <Link href={getEditUrl('organizational-structure')}>
                                <Button 
                                variant="secondary" 
                                size="sm" 
                                className="gap-2 rounded-full bg-emerald-600 font-semibold text-white hover:bg-emerald-500 border-none transition-all"
                                >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                                </Button>
                            </Link>
                            </div>
                        </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {diagnosis.org_structure_types.map((type, index) => (
                                        <Badge key={index} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1 rounded-md text-xs font-semibold">{type}</Badge>
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
                        <Card className="overflow-hidden border-slate-200 shadow-sm  py-0">
                            <CardHeader className="bg-slate-900 py-3 text-white">
                                <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-white/10 p-2">
                                    <Layers className="h-5 w-5 text-violet-400" />
                                    </div>
                                    <div>
                                    <CardTitle className="text-lg font-bold tracking-tight">Job Structure</CardTitle>
                                    <p className="text-xs text-slate-400">Taxonomy of roles and departments</p>
                                    </div>
                                </div>
                                <Link href={getEditUrl('job-structure')}>
                                    <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="gap-2 rounded-full bg-violet-600 font-semibold text-white hover:bg-violet-500 border-none transition-all"
                                    >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                    </Button>
                                </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 p-4">
                                {diagnosis.job_categories && Array.isArray(diagnosis.job_categories) && diagnosis.job_categories.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 py-2">Job Categories</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {diagnosis.job_categories.map((category, index) => (
                                                <Badge key={index} variant="secondary" className="bg-violet-50 text-violet-700 border-violet-100 px-3 py-1 rounded-md text-xs font-semibold">{category}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {diagnosis.job_functions && Array.isArray(diagnosis.job_functions) && diagnosis.job_functions.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 py-2">Job Functions</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {diagnosis.job_functions.map((func, index) => (
                                                <Badge key={index} variant="outline" className="bg-violet-50 text-violet-700 border-violet-100 px-3 py-1 rounded-md text-xs font-semibold">{func}</Badge>
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
                        <Card className="overflow-hidden border-red-100 shadow-sm transition-all hover:shadow-md">
                            <CardHeader className="bg-slate-900 py-3 text-white">
                                <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-red-500/20 p-2">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div>
                                    <CardTitle className="text-lg font-bold tracking-tight text-white">HR Pain Points</CardTitle>
                                    <p className="text-xs text-slate-400">Critical areas requiring intervention</p>
                                    </div>
                                </div>
                                <Link href={getEditUrl('hr-issues')}>
                                    <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="gap-2 rounded-full bg-red-600 font-semibold text-white hover:bg-red-500 border-none transition-all"
                                    >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                    </Button>
                                </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pb-5">
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
