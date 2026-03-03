import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';

interface Props {
    guidance: {
        id: number;
        model_type: string;
        concept: string;
        key_characteristics: string;
        example: string;
        pros?: string;
        cons?: string;
        best_fit_organizations?: string;
        recommended_job_keyword_ids?: number[];
        version?: string;
        is_active: boolean;
    };
    modelTypes: Record<string, string>;
    jobKeywords: Array<{ id: number; name: string }>;
}

export default function EvaluationModelGuidanceEdit({ guidance, modelTypes, jobKeywords }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        model_type: guidance.model_type || '',
        concept: guidance.concept || '',
        key_characteristics: guidance.key_characteristics || '',
        example: guidance.example || '',
        pros: guidance.pros || '',
        cons: guidance.cons || '',
        best_fit_organizations: guidance.best_fit_organizations || '',
        recommended_job_keyword_ids: guidance.recommended_job_keyword_ids || [],
        version: guidance.version || '',
        is_active: guidance.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/evaluation-model-guidance/${guidance.id}`);
    };

    const toggleJobKeyword = (jobKeywordId: number) => {
        const current = data.recommended_job_keyword_ids || [];
        if (current.includes(jobKeywordId)) {
            setData('recommended_job_keyword_ids', current.filter(id => id !== jobKeywordId));
        } else {
            setData('recommended_job_keyword_ids', [...current, jobKeywordId]);
        }
    };

    return (
        <SidebarProvider>
            <Sidebar>
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset>
                <AppHeader />
                <div className="p-6 md:p-8 max-w-4xl mx-auto">
                    <Head title="Edit Evaluation Model Guidance" />
                    
                    <div className="mb-6">
                        <Link href="/admin/evaluation-model-guidance">
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">Edit Evaluation Model Guidance</h1>
                        <p className="text-muted-foreground mt-1">
                            Update guidance content for evaluation models
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Guidance Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label htmlFor="model_type">Model Type *</Label>
                                    <Select value={data.model_type} onValueChange={(value) => setData('model_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select model type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(modelTypes).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.model_type && <p className="text-sm text-destructive mt-1">{errors.model_type}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="concept">Concept *</Label>
                                    <Textarea
                                        id="concept"
                                        value={data.concept}
                                        onChange={(e) => setData('concept', e.target.value)}
                                        rows={4}
                                    />
                                    {errors.concept && <p className="text-sm text-destructive mt-1">{errors.concept}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="key_characteristics">Key Characteristics *</Label>
                                    <Textarea
                                        id="key_characteristics"
                                        value={data.key_characteristics}
                                        onChange={(e) => setData('key_characteristics', e.target.value)}
                                        rows={4}
                                    />
                                    {errors.key_characteristics && <p className="text-sm text-destructive mt-1">{errors.key_characteristics}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="example">Example *</Label>
                                    <Textarea
                                        id="example"
                                        value={data.example}
                                        onChange={(e) => setData('example', e.target.value)}
                                        rows={4}
                                    />
                                    {errors.example && <p className="text-sm text-destructive mt-1">{errors.example}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="pros">Pros</Label>
                                    <Textarea
                                        id="pros"
                                        value={data.pros}
                                        onChange={(e) => setData('pros', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="cons">Cons</Label>
                                    <Textarea
                                        id="cons"
                                        value={data.cons}
                                        onChange={(e) => setData('cons', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="best_fit_organizations">Best Fit Organizations</Label>
                                    <Textarea
                                        id="best_fit_organizations"
                                        value={data.best_fit_organizations}
                                        onChange={(e) => setData('best_fit_organizations', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label>Recommended Job Keywords</Label>
                                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-4">
                                        {jobKeywords.map((job) => (
                                            <div key={job.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`job-${job.id}`}
                                                    checked={(data.recommended_job_keyword_ids || []).includes(job.id)}
                                                    onCheckedChange={() => toggleJobKeyword(job.id)}
                                                />
                                                <Label htmlFor={`job-${job.id}`} className="cursor-pointer">
                                                    {job.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="version">Version</Label>
                                        <Input
                                            id="version"
                                            value={data.version}
                                            onChange={(e) => setData('version', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 pt-8">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked === true)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Active
                                        </Label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <Link href="/admin/evaluation-model-guidance">
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        Update Guidance
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
