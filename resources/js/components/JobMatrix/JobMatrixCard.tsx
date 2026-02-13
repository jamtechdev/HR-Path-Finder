import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, User, Users, Award, BookOpen, Languages, Briefcase } from 'lucide-react';

interface JobSpecification {
    education?: {
        required?: string;
        preferred?: string;
    };
    experience?: {
        required?: string;
        preferred?: string;
    };
    skills?: {
        required?: string;
        preferred?: string;
    };
    communication?: {
        required?: string;
        preferred?: string;
    };
}

interface CompetencyLevel {
    level: string;
    description: string;
    dev_period?: string;
}

interface JobDefinition {
    id: number;
    job_name: string;
    job_description?: string;
    job_specification?: JobSpecification;
    competency_levels?: CompetencyLevel[];
    csfs?: Array<{ name: string; description: string }>;
    job_keyword?: {
        id: number;
        name: string;
        category?: string;
    };
    reporting_structure?: {
        executive_director?: string;
        reporting_hierarchy?: string;
    };
    job_group?: string;
    job_code?: string;
}

interface JobMatrixCardProps {
    job: JobDefinition;
    companyName?: string;
    companyLogo?: string;
    isAdminView?: boolean;
    adminRecommendations?: any;
    showCSFs?: boolean;
}

export default function JobMatrixCard({
    job,
    companyName,
    companyLogo,
    isAdminView = false,
    adminRecommendations,
    showCSFs = true,
}: JobMatrixCardProps) {
    const spec = job.job_specification || {};
    const edu = spec.education || {};
    const exp = spec.experience || {};
    const skills = spec.skills || {};
    const comm = spec.communication || {};

    return (
        <Card className="w-full border-2 shadow-lg">
            {/* Header */}
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        {companyName && (
                            <h2 className="text-2xl font-bold mb-1">{companyName}</h2>
                        )}
                        <h3 className="text-xl font-semibold">Job Matrix Card</h3>
                    </div>
                    {companyLogo && (
                        <img
                            src={`/storage/${companyLogo}`}
                            alt={companyName || 'Company Logo'}
                            className="h-12 w-12 rounded object-contain bg-white p-1"
                        />
                    )}
                </div>
            </CardHeader>

            <CardContent className="px-6">
                {/* Job Purpose */}
                {job.job_description && (
                    <div>
                        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                            Job Purpose
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {job.job_description}
                        </p>
                    </div>
                )}

                <Separator />

                {/* Job Information Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Job Group */}
                    <div>
                        <Label>Job Group</Label>
                        <div className="mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <span className="text-sm font-medium">
                                {job.job_group || job.job_keyword?.category || 'Management'}
                            </span>
                        </div>
                    </div>

                    {/* Job Name */}
                    <div>
                        <Label>Job Name</Label>
                        <div className="mt-1 p-2 bg-gray-50 border rounded">
                            <span className="text-sm font-medium">{job.job_name}</span>
                        </div>
                    </div>

                    {/* Job Code (if available) */}
                    {job.job_code && (
                        <div>
                            <Label>Job Code</Label>
                            <div className="mt-1 p-2 bg-gray-50 border rounded">
                                <span className="text-sm">{job.job_code}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Reporting Structure */}
                {job.reporting_structure && (
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Reporting Structure</h4>
                        <div className="space-y-2">
                            {job.reporting_structure.executive_director && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground w-32">Executive Director:</span>
                                    <span className="text-sm font-medium">
                                        {job.reporting_structure.executive_director}
                                    </span>
                                </div>
                            )}
                            {job.reporting_structure.reporting_hierarchy && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground w-32">Reporting Hierarchy:</span>
                                    <span className="text-sm font-medium">
                                        {job.reporting_structure.reporting_hierarchy}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <Separator />

                {/* Job Responsibilities */}
                {job.job_description && (
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Job Responsibilities</h4>
                        <div className="space-y-1">
                            {job.job_description.split('\n').filter(line => line.trim()).map((line, idx) => (
                                <div key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">•</span>
                                    <span>{line.trim()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Separator />

                {/* Qualifications */}
                <div>
                    <h4 className="font-semibold text-lg mb-4">Qualifications</h4>
                    
                    {/* Required Qualifications */}
                    <div className="mb-4">
                        <h5 className="font-semibold text-sm mb-3 text-red-600">Required Qualifications</h5>
                        <div className="grid grid-cols-2 gap-3">
                            {edu.required && (
                                <QualificationItem
                                    icon={BookOpen}
                                    label="Education"
                                    value={edu.required}
                                />
                            )}
                            {exp.required && (
                                <QualificationItem
                                    icon={Briefcase}
                                    label="Experience"
                                    value={exp.required}
                                />
                            )}
                            {skills.required && (
                                <QualificationItem
                                    icon={Award}
                                    label="Skills"
                                    value={skills.required}
                                />
                            )}
                            {comm.required && (
                                <QualificationItem
                                    icon={Languages}
                                    label="Language"
                                    value={comm.required}
                                />
                            )}
                        </div>
                    </div>

                    {/* Preferred Qualifications */}
                    {(edu.preferred || exp.preferred || skills.preferred || comm.preferred) && (
                        <div>
                            <h5 className="font-semibold text-sm mb-3 text-blue-600">Preferred Qualifications</h5>
                            <div className="grid grid-cols-2 gap-3">
                                {edu.preferred && (
                                    <QualificationItem
                                        icon={BookOpen}
                                        label="Education"
                                        value={edu.preferred}
                                    />
                                )}
                                {exp.preferred && (
                                    <QualificationItem
                                        icon={Briefcase}
                                        label="Experience"
                                        value={exp.preferred}
                                    />
                                )}
                                {skills.preferred && (
                                    <QualificationItem
                                        icon={Award}
                                        label="Skills"
                                        value={skills.preferred}
                                    />
                                )}
                                {comm.preferred && (
                                    <QualificationItem
                                        icon={Languages}
                                        label="Language"
                                        value={comm.preferred}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Job Competency Leveling */}
                {job.competency_levels && job.competency_levels.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-lg mb-4">Job Competency Leveling</h4>
                        <div className="space-y-4">
                            {job.competency_levels.map((level, idx) => (
                                <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline" className="font-semibold">
                                            {level.level}
                                        </Badge>
                                        {level.dev_period && (
                                            <span className="text-xs text-muted-foreground">
                                                Dev. Period: {level.dev_period}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium mb-1">Expected Behavior:</p>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {level.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CSFs Section */}
                {showCSFs && job.csfs && job.csfs.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <h4 className="font-semibold text-lg mb-4">Critical Success Factors (CSF)</h4>
                            <div className="space-y-3">
                                {job.csfs.map((csf, idx) => (
                                    <div key={idx} className="border rounded-lg p-3">
                                        <h5 className="font-semibold text-sm mb-1">{csf.name}</h5>
                                        <p className="text-sm text-muted-foreground">{csf.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Admin Recommendations - shown to all users if available */}
                {adminRecommendations && (
                    <>
                        <Separator />
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-semibold text-sm mb-2 text-yellow-800 flex items-center gap-2">
                                <span>Admin Recommendations</span>
                                {isAdminView && (
                                    <Badge variant="outline" className="text-xs">You provided this</Badge>
                                )}
                            </h4>
                            <p className="text-sm text-yellow-700 whitespace-pre-wrap">
                                {adminRecommendations.comment || 'No recommendations yet.'}
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

interface QualificationItemProps {
    icon: React.ElementType;
    label: string;
    value: string;
}

function QualificationItem({ icon: Icon, label, value }: QualificationItemProps) {
    return (
        <div className="flex items-start gap-2">
            <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{label}:</p>
                <p className="text-sm">{value}</p>
            </div>
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {children}
        </label>
    );
}
