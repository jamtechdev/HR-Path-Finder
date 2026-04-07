import { Head } from '@inertiajs/react';
import { Building2, User, Briefcase, Target, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/AppLayout';

interface JobDefinition {
    id: number;
    job_name: string;
    job_keyword_id?: number;
    job_description?: string;
    job_specification?: {
        education?: { required?: string; preferred?: string };
        experience?: { required?: string; preferred?: string };
        skills?: { required?: string; preferred?: string };
        communication?: { required?: string; preferred?: string };
        major?: { required?: string; preferred?: string };
        certification?: { required?: string; preferred?: string };
        language?: { required?: string; preferred?: string };
        other?: { required?: string; preferred?: string };
    };
    competency_levels?: Array<{
        level: string;
        description: string;
        development_period?: string;
    }>;
    csfs?: Array<{
        name: string;
        description?: string;
        strategic_importance?: 'high' | 'medium' | 'low';
        execution_capability?: 'high' | 'medium' | 'low';
        rank?: number;
    }>;
}

interface OrgChartMapping {
    org_unit_name: string;
    org_head?: {
        name: string;
        rank: string;
        title: string;
        email: string;
    };
    job_specialists?: Array<{
        name: string;
        rank: string;
        title: string;
        email: string;
        job_keyword_id: number;
    }>;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    jobDefinition: JobDefinition & {
        job_keyword?: {
            id: number;
            name: string;
            category?: string;
        };
    };
    orgMapping?: OrgChartMapping;
    reportingHierarchy?: string;
}

export default function JobMatrixCard({ project, jobDefinition, orgMapping, reportingHierarchy }: Props) {
    const { t } = useTranslation();
    const spec = jobDefinition.job_specification || {};
    const competencyLevels = jobDefinition.competency_levels || [];
    const csfs = jobDefinition.csfs || [];

    // Find job specialist for this job
    const jobSpecialist = orgMapping?.job_specialists?.find(
        s => s.job_keyword_id === jobDefinition.job_keyword_id
    );

    // Parse job description to extract responsibilities
    const parseJobDescription = (description?: string) => {
        if (!description) return { jobPurpose: '', responsibilities: [] };
        
        const lines = description.split('\n').filter(p => p.trim());
        const jobPurpose = lines.find(p => 
            p.toLowerCase().includes('purpose') || 
            p.toLowerCase().includes('목적') ||
            p.toLowerCase().includes('responsible for')
        ) || '';
        
        const responsibilities = lines.filter(p => 
            !p.toLowerCase().includes('purpose') && 
            !p.toLowerCase().includes('목적') &&
            !p.toLowerCase().includes('responsible for') &&
            (p.trim().startsWith('-') || p.trim().startsWith('•') || p.trim().match(/^\d+\./))
        ).map(p => p.replace(/^[-•\d.\s]+/, '').trim());
        
        return { jobPurpose, responsibilities };
    };

    const { jobPurpose, responsibilities } = parseJobDescription(jobDefinition.job_description);

    // Organize CSFs into 3x3 matrix
    const csfMatrix = useMemo(() => {
        const matrix: Record<string, Record<string, Array<{ name: string; description?: string; rank?: number }>>> = {
            high: { low: [], medium: [], high: [] },
            medium: { low: [], medium: [], high: [] },
            low: { low: [], medium: [], high: [] },
        };

        csfs.forEach(csf => {
            const importance = (csf.strategic_importance || 'medium').toLowerCase() as 'high' | 'medium' | 'low';
            const capability = (csf.execution_capability || 'medium').toLowerCase() as 'high' | 'medium' | 'low';
            
            if (matrix[importance] && matrix[importance][capability]) {
                matrix[importance][capability].push({
                    name: csf.name,
                    description: csf.description,
                    rank: csf.rank,
                });
            }
        });

        // Sort by rank
        Object.keys(matrix).forEach(importance => {
            Object.keys(matrix[importance as keyof typeof matrix]).forEach(capability => {
                matrix[importance as keyof typeof matrix][capability as keyof typeof matrix[typeof importance]].sort((a, b) => {
                    if (a.rank && b.rank) return a.rank - b.rank;
                    if (a.rank) return -1;
                    if (b.rank) return 1;
                    return 0;
                });
            });
        });

        return matrix;
    }, [csfs]);

    // Get all CSFs sorted by rank for flat display
    const sortedCsfs = useMemo(() => {
        return [...csfs].sort((a, b) => {
            if (a.rank && b.rank) return a.rank - b.rank;
            if (a.rank) return -1;
            if (b.rank) return 1;
            return 0;
        });
    }, [csfs]);

    return (
        <AppLayout>
            <Head
                title={t('page_heads.job_matrix_card', {
                    job: jobDefinition.job_name,
                    company:
                        project?.company?.name ||
                        t('page_head_fallbacks.job_analysis'),
                })}
            />
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                {/* Header Banner - Excel-like Design */}
                <div className="mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold">{project?.company?.name || 'Company Name'}</h2>
                            </div>
                            <div className="text-right">
                                <h1 className="text-3xl font-bold">Job Matrix Card</h1>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="border-t-0 rounded-t-none shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 via-yellow-100/50 to-yellow-50 border-b-4 border-yellow-200">
                        {/* Job Group, Job Name, Job Purpose Row */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-2 bg-yellow-200 p-3 rounded-lg border-2 border-yellow-300">
                                <p className="text-xs font-bold text-gray-700 uppercase mb-1">Job Group</p>
                                <p className="font-bold text-base">{jobDefinition.job_keyword?.category || '경영'}</p>
                            </div>
                            <div className="col-span-3 bg-gray-100 p-3 rounded-lg border-2 border-gray-300">
                                <p className="text-xs font-bold text-gray-700 uppercase mb-1">Job Name</p>
                                <p className="font-bold text-base">{jobDefinition.job_name}</p>
                            </div>
                            <div className="col-span-7 bg-white p-3 rounded-lg border-2 border-gray-200">
                                <p className="text-xs font-bold text-gray-700 uppercase mb-1">Job Purpose</p>
                                <p className="text-sm leading-relaxed">{jobPurpose || jobDefinition.job_description || 'Not specified'}</p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6 bg-gradient-to-br from-white to-gray-50/50">
                        {/* Personnel Information */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-3">
                                <p className="text-xs font-bold text-gray-600 uppercase mb-2">Job Specialist</p>
                                <p className="text-sm font-semibold">
                                    {jobSpecialist 
                                        ? `${jobSpecialist.name} (${jobSpecialist.rank}, ${jobSpecialist.title})`
                                        : orgMapping?.org_head?.name 
                                            ? `${orgMapping.org_head.name} (${orgMapping.org_head.rank}, ${orgMapping.org_head.title})`
                                            : 'Not assigned'
                                    }
                                </p>
                            </div>
                            <div className="col-span-3">
                                <p className="text-xs font-bold text-gray-600 uppercase mb-2">Executive Director</p>
                                <p className="text-sm font-semibold">
                                    {orgMapping?.org_head?.name 
                                        ? `${orgMapping.org_head.name} (${orgMapping.org_head.rank}, ${orgMapping.org_head.title})`
                                        : 'Not assigned'
                                    }
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs font-bold text-gray-600 uppercase mb-2">Job Code</p>
                                <p className="text-sm">직무코드</p>
                            </div>
                            <div className="col-span-4">
                                <p className="text-xs font-bold text-gray-600 uppercase mb-2">Reporting Hierarchy</p>
                                <p className="text-sm font-medium">{reportingHierarchy || 'Team Leader → Director → CEO'}</p>
                            </div>
                        </div>

                        <Separator className="bg-gray-300" />

                        {/* Job Responsibilities */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-primary" />
                                Job Responsibilities
                            </h3>
                            {responsibilities.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {responsibilities.map((resp, idx) => (
                                        <div key={idx} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 hover:bg-blue-100 transition-colors">
                                            <p className="text-sm font-medium">{resp}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['HR policy planning and improvement', 'Management & compliance with labor laws', 
                                      'Recruitment and training operations', 'Performance management',
                                      'Compensation administration', 'HR-ERP operation & enhancement'].map((resp, idx) => (
                                        <div key={idx} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
                                            <p className="text-sm text-muted-foreground">{resp}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator className="bg-gray-300" />

                        {/* Required and Preferred Qualifications - Table Format */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Qualifications
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border-2 border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border-2 border-gray-300 p-2 text-left text-xs font-bold uppercase">Category</th>
                                            <th className="border-2 border-gray-300 p-2 text-left text-xs font-bold uppercase bg-red-50">Required</th>
                                            <th className="border-2 border-gray-300 p-2 text-left text-xs font-bold uppercase bg-green-50">Preferred</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border-2 border-gray-300 p-2 font-semibold text-sm">Education</td>
                                            <td className="border-2 border-gray-300 p-2 text-sm bg-red-50">{spec.education?.required || '-'}</td>
                                            <td className="border-2 border-gray-300 p-2 text-sm bg-green-50">{spec.education?.preferred || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="border-2 border-gray-300 p-2 font-semibold text-sm">Major</td>
                                            <td className="border-2 border-gray-300 p-2 text-sm bg-red-50">{spec.major?.required || spec.experience?.required || '-'}</td>
                                            <td className="border-2 border-gray-300 p-2 text-sm bg-green-50">{spec.major?.preferred || spec.experience?.preferred || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="border-2 border-gray-300 p-2 font-semibold text-sm">Certification</td>
                                            <td className="border-2 border-gray-300 p-2 text-sm bg-red-50">{spec.certification?.required || '-'}</td>
                                            <td className="border-2 border-gray-300 p-2 text-sm bg-green-50">{spec.certification?.preferred || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="border-2 border-gray-300 p-2 font-semibold text-sm">Tech. Skills</td>
                                            <td className="border-2 border-gray-300 p-2 text-sm bg-red-50">{spec.skills?.required || '-'}</td>
                                            <td className="border-2 border-gray-300 p-2 text-sm bg-green-50">{spec.skills?.preferred || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="border-2 border-gray-300 p-2 font-semibold text-sm">Language</td>
                                            <td className="border-2 border-gray-300 p-2 text-sm bg-red-50">{spec.language?.required || '-'}</td>
                                            <td className="border-2 border-gray-300 p-2 text-sm bg-green-50">{spec.language?.preferred || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className="border-2 border-gray-300 p-2 font-semibold text-sm">Other</td>
                                            <td className="border-2 border-gray-300 p-2 text-sm bg-red-50">{spec.other?.required || '-'}</td>
                                            <td className="border-2 border-gray-300 p-2 text-sm bg-green-50">{spec.other?.preferred || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <Separator className="bg-gray-300" />

                        {/* Job Competency Leveling - Table Format */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Job Competency Leveling
                            </h3>
                            {competencyLevels.length > 0 ? (
                                <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border-2 border-gray-300 p-3 text-left text-xs font-bold uppercase">Level</th>
                                                <th className="border-2 border-gray-300 p-3 text-left text-xs font-bold uppercase">Expected Behavior by Level</th>
                                                <th className="border-2 border-gray-300 p-3 text-left text-xs font-bold uppercase w-32">Dev. Period</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {competencyLevels.map((level, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="border-2 border-gray-300 p-3">
                                                        <Badge variant="outline" className="font-bold">
                                                            {level.level}
                                                        </Badge>
                                                    </td>
                                                    <td className="border-2 border-gray-300 p-3 text-sm whitespace-pre-line">
                                                        {level.description}
                                                    </td>
                                                    <td className="border-2 border-gray-300 p-3 text-sm font-medium text-center">
                                                        {level.development_period || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800">No competency levels defined. Default levels (LV1-LV3) will be used.</p>
                                </div>
                            )}
                        </div>

                        <Separator className="bg-gray-300" />

                        {/* Job Value Assessment Framework Pre-View */}
                        <div>
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg mb-0">
                                <h3 className="text-xl font-bold">Job Value Assessment Framework Pre-View</h3>
                            </div>
                            <div className="bg-blue-50 border-2 border-blue-200 border-t-0 rounded-b-lg p-6">
                                <p className="text-xs text-blue-700 mb-4 italic bg-yellow-100 border border-yellow-300 rounded p-2">
                                    <strong>Note:</strong> Job Value calculation logic will be available in the full version. This is a preview section.
                                </p>
                                
                                {/* Three Metrics */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-yellow-200 border-2 border-yellow-400 rounded-lg p-4 text-center">
                                        <p className="text-xs font-bold text-gray-700 uppercase mb-2">Job Complexity</p>
                                        <Badge className="bg-blue-600 text-white text-base px-4 py-1">High</Badge>
                                    </div>
                                    <div className="bg-yellow-200 border-2 border-yellow-400 rounded-lg p-4 text-center">
                                        <p className="text-xs font-bold text-gray-700 uppercase mb-2">Business Impact</p>
                                        <Badge className="bg-blue-600 text-white text-base px-4 py-1">Medium</Badge>
                                    </div>
                                    <div className="bg-yellow-200 border-2 border-yellow-400 rounded-lg p-4 text-center">
                                        <p className="text-xs font-bold text-gray-700 uppercase mb-2">Replacement Difficulty</p>
                                        <Badge className="bg-blue-600 text-white text-base px-4 py-1">Medium</Badge>
                                    </div>
                                </div>

                                {/* Summary Metrics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white border-2 border-gray-300 rounded-lg p-3">
                                        <p className="text-xs font-bold text-gray-600 uppercase mb-1">Total Job Grade Points</p>
                                        <p className="text-lg font-bold">3,500 / 9,850</p>
                                    </div>
                                    <div className="bg-white border-2 border-gray-300 rounded-lg p-3">
                                        <p className="text-xs font-bold text-gray-600 uppercase mb-1">Job Rank within Company</p>
                                        <p className="text-lg font-bold">7 / 20</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-gray-300" />

                        {/* CSF Matrix - 3x3 Grid */}
                        {sortedCsfs.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary" />
                                    Critical Success Factors (CSF) Matrix
                                </h3>
                                
                                <div className="grid grid-cols-4 gap-2">
                                    {/* Empty top-left corner */}
                                    <div></div>
                                    
                                    {/* Column headers */}
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-gray-600 uppercase">Low</p>
                                        <p className="text-xs font-bold text-gray-600 uppercase">Capability</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-gray-600 uppercase">Medium</p>
                                        <p className="text-xs font-bold text-gray-600 uppercase">Capability</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-gray-600 uppercase">High</p>
                                        <p className="text-xs font-bold text-gray-600 uppercase">Capability</p>
                                    </div>

                                    {/* High Strategic Importance Row */}
                                    <div className="flex items-center justify-center bg-red-100 border-2 border-red-300 rounded p-2">
                                        <p className="text-xs font-bold text-gray-700 uppercase -rotate-90 whitespace-nowrap">High</p>
                                    </div>
                                    {['low', 'medium', 'high'].map(capability => (
                                        <div key={`high-${capability}`} className="min-h-[120px] border-2 border-gray-300 rounded-lg p-2 bg-yellow-50">
                                            {csfMatrix.high[capability as keyof typeof csfMatrix.high].map((csf, idx) => (
                                                <div key={idx} className="mb-2 last:mb-0 bg-yellow-200 border border-yellow-400 rounded p-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-xs font-semibold flex-1">{csf.name}</p>
                                                        {csf.rank && (
                                                            <Badge variant="outline" className="text-xs">Rank {csf.rank}</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {csfMatrix.high[capability as keyof typeof csfMatrix.high].length === 0 && (
                                                <p className="text-xs text-gray-400 text-center mt-4">-</p>
                                            )}
                                        </div>
                                    ))}

                                    {/* Medium Strategic Importance Row */}
                                    <div className="flex items-center justify-center bg-orange-100 border-2 border-orange-300 rounded p-2">
                                        <p className="text-xs font-bold text-gray-700 uppercase -rotate-90 whitespace-nowrap">Medium</p>
                                    </div>
                                    {['low', 'medium', 'high'].map(capability => (
                                        <div key={`medium-${capability}`} className="min-h-[120px] border-2 border-gray-300 rounded-lg p-2 bg-gray-50">
                                            {csfMatrix.medium[capability as keyof typeof csfMatrix.medium].map((csf, idx) => (
                                                <div key={idx} className="mb-2 last:mb-0 bg-gray-200 border border-gray-400 rounded p-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-xs font-semibold flex-1">{csf.name}</p>
                                                        {csf.rank && (
                                                            <Badge variant="outline" className="text-xs">Rank {csf.rank}</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {csfMatrix.medium[capability as keyof typeof csfMatrix.medium].length === 0 && (
                                                <p className="text-xs text-gray-400 text-center mt-4">-</p>
                                            )}
                                        </div>
                                    ))}

                                    {/* Low Strategic Importance Row */}
                                    <div className="flex items-center justify-center bg-green-100 border-2 border-green-300 rounded p-2">
                                        <p className="text-xs font-bold text-gray-700 uppercase -rotate-90 whitespace-nowrap">Low</p>
                                    </div>
                                    {['low', 'medium', 'high'].map(capability => (
                                        <div key={`low-${capability}`} className="min-h-[120px] border-2 border-gray-300 rounded-lg p-2 bg-red-50">
                                            {csfMatrix.low[capability as keyof typeof csfMatrix.low].map((csf, idx) => (
                                                <div key={idx} className="mb-2 last:mb-0 bg-red-200 border border-red-400 rounded p-2">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-xs font-semibold flex-1">{csf.name}</p>
                                                        {csf.rank && (
                                                            <Badge variant="outline" className="text-xs">Rank {csf.rank}</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {csfMatrix.low[capability as keyof typeof csfMatrix.low].length === 0 && (
                                                <p className="text-xs text-gray-400 text-center mt-4">-</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Legend */}
                                <div className="mt-4 flex items-center gap-4 justify-end">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
                                        <span className="text-xs font-medium">Strategic Initiatives</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></div>
                                        <span className="text-xs font-medium">Process Improvement</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
                                        <span className="text-xs font-medium">Operational Efficiency</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fallback: Simple CSF List if no matrix data */}
                        {sortedCsfs.length > 0 && !csfs.some(c => c.strategic_importance && c.execution_capability) && (
                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary" />
                                    Critical Success Factors (CSFs)
                                </h3>
                                <div className="space-y-3">
                                    {sortedCsfs.map((csf, idx) => (
                                        <div key={idx} className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h4 className="font-semibold text-base">{csf.name}</h4>
                                                {csf.rank && (
                                                    <Badge variant="outline" className="text-sm">Rank {csf.rank}</Badge>
                                                )}
                                            </div>
                                            {csf.description && (
                                                <p className="text-sm text-muted-foreground">{csf.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
