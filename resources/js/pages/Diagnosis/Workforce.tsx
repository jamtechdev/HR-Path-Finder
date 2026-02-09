import React, { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Diagnosis {
    id: number;
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

export default function Workforce({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
}: Props) {
    const [malePercentage, setMalePercentage] = useState<number | null>(null);
    const [femalePercentage, setFemalePercentage] = useState<number | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        present_headcount: diagnosis?.present_headcount || 0,
        expected_headcount_1y: diagnosis?.expected_headcount_1y || 0,
        expected_headcount_2y: diagnosis?.expected_headcount_2y || 0,
        expected_headcount_3y: diagnosis?.expected_headcount_3y || 0,
        average_tenure_active: diagnosis?.average_tenure_active || 0,
        average_tenure_leavers: diagnosis?.average_tenure_leavers || 0,
        average_age: diagnosis?.average_age || 0,
        gender_male: diagnosis?.gender_male || 0,
        gender_female: diagnosis?.gender_female || 0,
        gender_other: diagnosis?.gender_other || 0,
    });

    // Calculate gender percentages
    useEffect(() => {
        const total = data.gender_male + data.gender_female + (data.gender_other || 0);
        if (total > 0) {
            setMalePercentage(Math.round((data.gender_male / total) * 100 * 10) / 10);
            setFemalePercentage(Math.round((data.gender_female / total) * 100 * 10) / 10);
        } else {
            setMalePercentage(null);
            setFemalePercentage(null);
        }
    }, [data.gender_male, data.gender_female, data.gender_other]);

    // Validate gender composition
    const genderSum = data.gender_male + data.gender_female + (data.gender_other || 0);
    const genderError = genderSum > data.present_headcount 
        ? `Gender sum (${genderSum}) cannot exceed total workforce (${data.present_headcount})` 
        : null;

    // Removed auto-save - only save on review and submit

    return (
        <>
            <Head title={`Workforce Overview - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title="Workforce Overview"
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="company-info"
                nextRoute="executives"
                formData={data}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                <Card>
                    <CardContent className="p-6 space-y-6">
                        {/* Current Workforce Size */}
                        <div className="space-y-2">
                            <Label htmlFor="present_headcount">
                                Current Workforce Size (Active employees) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="present_headcount"
                                type="number"
                                min="0"
                                value={data.present_headcount || ''}
                                onChange={(e) => setData('present_headcount', parseInt(e.target.value) || 0)}
                                placeholder="Enter number of employees"
                                className={errors.present_headcount ? 'border-destructive' : ''}
                                required
                            />
                            {errors.present_headcount && (
                                <p className="text-sm text-destructive">{errors.present_headcount}</p>
                            )}
                        </div>

                        {/* Workforce Forecast */}
                        <div className="space-y-4">
                            <Label className="text-sm font-semibold">
                                Workforce Forecast <span className="text-destructive">*</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expected_headcount_1y">After 1 year (expected)</Label>
                                    <Input
                                        id="expected_headcount_1y"
                                        type="number"
                                        min="0"
                                        value={data.expected_headcount_1y || ''}
                                        onChange={(e) => setData('expected_headcount_1y', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expected_headcount_2y">After 2 years (expected)</Label>
                                    <Input
                                        id="expected_headcount_2y"
                                        type="number"
                                        min="0"
                                        value={data.expected_headcount_2y || ''}
                                        onChange={(e) => setData('expected_headcount_2y', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expected_headcount_3y">After 3 years (expected)</Label>
                                    <Input
                                        id="expected_headcount_3y"
                                        type="number"
                                        min="0"
                                        value={data.expected_headcount_3y || ''}
                                        onChange={(e) => setData('expected_headcount_3y', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Average Tenure */}
                        <div className="space-y-4">
                            <Label className="text-sm font-semibold">
                                Average Tenure (years) <span className="text-destructive">*</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="average_tenure_active">Active Employees</Label>
                                    <Input
                                        id="average_tenure_active"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={data.average_tenure_active || ''}
                                        onChange={(e) => setData('average_tenure_active', parseFloat(e.target.value) || 0)}
                                        placeholder="0.0"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="average_tenure_leavers">Leavers</Label>
                                    <Input
                                        id="average_tenure_leavers"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={data.average_tenure_leavers || ''}
                                        onChange={(e) => setData('average_tenure_leavers', parseFloat(e.target.value) || 0)}
                                        placeholder="0.0"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Average Age */}
                        <div className="space-y-2">
                            <Label htmlFor="average_age">
                                Average Age of Active Employees (years) <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="average_age"
                                type="number"
                                step="0.1"
                                min="18"
                                max="100"
                                value={data.average_age || ''}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    // Validate age range (18-100)
                                    if (value >= 18 && value <= 100) {
                                        setData('average_age', value);
                                    } else if (value === 0 || e.target.value === '') {
                                        setData('average_age', 0);
                                    }
                                }}
                                placeholder="0.0"
                                className={errors.average_age ? 'border-destructive' : ''}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Please enter age between 18 and 100 years</p>
                            {errors.average_age && (
                                <p className="text-sm text-destructive">{errors.average_age}</p>
                            )}
                        </div>

                        {/* Gender Composition */}
                        <div className="space-y-4">
                            <Label className="text-sm font-semibold">
                                Gender Composition <span className="text-destructive">*</span>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gender_male">Male (count)</Label>
                                    <Input
                                        id="gender_male"
                                        type="number"
                                        min="0"
                                        value={data.gender_male || ''}
                                        onChange={(e) => setData('gender_male', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        required
                                    />
                                    {malePercentage !== null && (
                                        <p className="text-xs text-muted-foreground">Male: {malePercentage}%</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender_female">Female (count)</Label>
                                    <Input
                                        id="gender_female"
                                        type="number"
                                        min="0"
                                        value={data.gender_female || ''}
                                        onChange={(e) => setData('gender_female', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        required
                                    />
                                    {femalePercentage !== null && (
                                        <p className="text-xs text-muted-foreground">Female: {femalePercentage}%</p>
                                    )}
                                </div>
                            </div>
                            {genderError && (
                                <p className="text-sm text-destructive">{genderError}</p>
                            )}
                            {errors.gender_male && (
                                <p className="text-sm text-destructive">{errors.gender_male}</p>
                            )}
                            {errors.gender_female && (
                                <p className="text-sm text-destructive">{errors.gender_female}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </FormLayout>
        </>
    );
}
