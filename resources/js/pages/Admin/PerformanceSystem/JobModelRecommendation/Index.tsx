import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface JobEvaluationModelRecommendation {
    id: number;
    job_keyword_id: number;
    recommended_model: 'mbo' | 'bsc' | 'okr';
    is_active: boolean;
    job_keyword?: {
        id: number;
        name: string;
    };
}

interface Props {
    recommendations: JobEvaluationModelRecommendation[];
    jobKeywords: Array<{ id: number; name: string }>;
    modelTypes: Record<string, string>;
}

export default function JobModelRecommendationIndex({ recommendations, jobKeywords, modelTypes }: Props) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        job_keyword_id: '',
        recommended_model: '',
        is_active: true,
    });

    const handleAdd = () => {
        setShowAddDialog(true);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/job-model-recommendation', {
            onSuccess: () => {
                setShowAddDialog(false);
                reset();
            },
        });
    };

    const handleUpdate = (recommendation: JobEvaluationModelRecommendation) => {
        router.put(`/admin/job-model-recommendation/${recommendation.id}`, {
            recommended_model: recommendation.recommended_model === 'mbo' ? 'bsc' : recommendation.recommended_model === 'bsc' ? 'okr' : 'mbo',
            is_active: !recommendation.is_active,
        });
    };

    const handleDelete = (recommendationId: number) => {
        if (confirm('Are you sure you want to delete this recommendation?')) {
            router.delete(`/admin/job-model-recommendation/${recommendationId}`);
        }
    };

    const availableJobKeywords = jobKeywords.filter(
        job => !recommendations.some(rec => rec.job_keyword_id === job.id)
    );

    return (
        <SidebarProvider>
            <Sidebar>
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset>
                <AppHeader />
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <Head title="Job Evaluation Model Recommendations" />
                    
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Job Evaluation Model Recommendations</h1>
                            <p className="text-muted-foreground mt-1">
                                Configure recommended evaluation models for each job keyword
                            </p>
                        </div>
                        <Button onClick={handleAdd}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Recommendation
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recommendations.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No recommendations found. Click "Add Recommendation" to create one.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-3">Job Keyword</th>
                                                    <th className="text-left p-3">Recommended Model</th>
                                                    <th className="text-left p-3">Status</th>
                                                    <th className="text-right p-3">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recommendations.map((rec) => (
                                                    <tr key={rec.id} className="border-b hover:bg-muted/50">
                                                        <td className="p-3">{rec.job_keyword?.name || 'N/A'}</td>
                                                        <td className="p-3">
                                                            <Badge>{modelTypes[rec.recommended_model]}</Badge>
                                                        </td>
                                                        <td className="p-3">
                                                            <Badge variant={rec.is_active ? 'default' : 'secondary'}>
                                                                {rec.is_active ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleUpdate(rec)}
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(rec.id)}
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add Dialog */}
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Job Model Recommendation</DialogTitle>
                                <DialogDescription>
                                    Select a job keyword and its recommended evaluation model
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="job_keyword_id">Job Keyword *</Label>
                                    <Select
                                        value={data.job_keyword_id}
                                        onValueChange={(value) => setData('job_keyword_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select job keyword" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableJobKeywords.map((job) => (
                                                <SelectItem key={job.id} value={job.id.toString()}>
                                                    {job.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.job_keyword_id && (
                                        <p className="text-sm text-destructive mt-1">{errors.job_keyword_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="recommended_model">Recommended Model *</Label>
                                    <Select
                                        value={data.recommended_model}
                                        onValueChange={(value) => setData('recommended_model', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(modelTypes).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.recommended_model && (
                                        <p className="text-sm text-destructive mt-1">{errors.recommended_model}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAddDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Create
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
