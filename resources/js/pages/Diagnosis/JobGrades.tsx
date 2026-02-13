import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';

interface Diagnosis {
    id: number;
    job_grade_names?: string[];
    promotion_years?: Record<string, number | null>;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    company: {
        name: string;
    };
    diagnosis?: Diagnosis;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
}

interface JobGrade {
    id: string;
    name: string;
    promotion_years: number | null;
    no_promotion_period: boolean;
}

const DEFAULT_GRADES = ['Associate', 'Assistant Manager', 'Manager', 'Senior Manager', 'General Manager'];

export default function JobGrades({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
}: Props) {
    const [grades, setGrades] = useState<JobGrade[]>(() => {
        if (diagnosis?.job_grade_names && diagnosis?.promotion_years) {
            return diagnosis.job_grade_names.map((name, index) => {
                const promotionYears = diagnosis.promotion_years?.[name];
                return {
                    id: `grade-${index}`,
                    name,
                    promotion_years: promotionYears ?? null,
                    no_promotion_period: promotionYears === null,
                };
            });
        }
        // Initialize with default grades
        return DEFAULT_GRADES.map((name, index) => ({
            id: `grade-${index}`,
            name,
            promotion_years: index + 3, // Default: 3, 4, 4, 4, null
            no_promotion_period: false,
        }));
    });

    const { data, setData, post, processing, errors } = useForm({
        job_grade_names: [] as string[],
        promotion_years: {} as Record<string, number | null>,
    });

    // Update form data when grades change
    useEffect(() => {
        const names = grades.map((g) => g.name).filter(Boolean);
        const years: Record<string, number | null> = {};
        grades.forEach((g) => {
            if (g.name) {
                years[g.name] = g.no_promotion_period ? null : (g.promotion_years || null);
            }
        });
        setData('job_grade_names', names);
        setData('promotion_years', years);
    }, [grades]);

    // Removed auto-save - only save on review and submit

    const addGrade = () => {
        setGrades([...grades, { id: `grade-${Date.now()}`, name: '', promotion_years: 0, no_promotion_period: false }]);
    };

    const removeGrade = (id: string) => {
        setGrades(grades.filter((g) => g.id !== id));
    };

    const updateGrade = (id: string, updates: Partial<JobGrade>) => {
        setGrades(grades.map((g) => {
            if (g.id === id) {
                const updated = { ...g, ...updates };
                // If "no promotion period" is checked, set promotion_years to null
                if (updated.no_promotion_period) {
                    updated.promotion_years = null;
                }
                return updated;
            }
            return g;
        }));
    };

    return (
        <>
            <Head title={`Job Grade System - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title="Job Grade System"
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="leaders"
                nextRoute="organizational-charts"
                formData={{
                    job_grade_names: grades.map(g => g.name),
                    promotion_years: grades.reduce((acc, grade) => {
                        acc[grade.name] = grade.no_promotion_period ? null : grade.promotion_years;
                        return acc;
                    }, {} as Record<string, number | null>),
                }}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                <Card>
                    <CardContent className="px-6">
                        <div className="space-y-4">
                            <Label className="text-sm font-semibold">Grade Names and Promotion Duration</Label>
                            <div className="space-y-3">
                                {grades.map((grade) => (
                                    <div key={grade.id} className="flex items-center gap-3 p-3 border rounded-md">
                                        <Input
                                            placeholder="Grade name"
                                            value={grade.name}
                                            onChange={(e) => updateGrade(grade.id, { name: e.target.value })}
                                            className="flex-1"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Years"
                                                value={grade.no_promotion_period ? '' : (grade.promotion_years || '')}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 0;
                                                    updateGrade(grade.id, { promotion_years: value, no_promotion_period: false });
                                                }}
                                                min="0"
                                                disabled={grade.no_promotion_period}
                                                className="w-24"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`no-promotion-${grade.id}`}
                                                    checked={grade.no_promotion_period}
                                                    onCheckedChange={(checked) => {
                                                        updateGrade(grade.id, { no_promotion_period: checked as boolean });
                                                    }}
                                                />
                                                <Label
                                                    htmlFor={`no-promotion-${grade.id}`}
                                                    className="text-xs font-normal cursor-pointer whitespace-nowrap"
                                                >
                                                    No fixed period
                                                </Label>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeGrade(grade.id)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addGrade}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Grade
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </FormLayout>
        </>
    );
}
