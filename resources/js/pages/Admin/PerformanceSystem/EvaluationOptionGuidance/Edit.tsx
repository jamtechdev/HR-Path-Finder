import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';

interface Props {
    guidance: {
        id: number;
        option_key: string;
        option_value: string;
        concept?: string;
        key_characteristics?: string;
        example?: string;
        pros?: string;
        cons?: string;
        best_fit_organizations?: string;
        is_active: boolean;
    };
    optionKeys: Record<string, string>;
}

export default function EvaluationOptionGuidanceEdit({ guidance, optionKeys }: Props) {
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        option_key: guidance.option_key || '',
        option_value: guidance.option_value || '',
        concept: guidance.concept || '',
        key_characteristics: guidance.key_characteristics || '',
        example: guidance.example || '',
        pros: guidance.pros || '',
        cons: guidance.cons || '',
        best_fit_organizations: guidance.best_fit_organizations || '',
        is_active: guidance.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/evaluation-option-guidance/${guidance.id}`);
    };

    return (
        <SidebarProvider>
            <Sidebar>
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset>
                <AppHeader />
                <div className="p-6 md:p-8 max-w-4xl mx-auto">
                    <Head title="Edit Evaluation Option Guidance" />
                    
                    <div className="mb-6">
                        <Link href="/admin/evaluation-option-guidance">
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">Edit Evaluation Option Guidance</h1>
                        <p className="text-muted-foreground mt-1">
                            Update guidance content for evaluation structure options
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Guidance Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label htmlFor="option_key">Option Key *</Label>
                                    <Select value={data.option_key} onValueChange={(value) => setData('option_key', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select option key" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(optionKeys).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.option_key && <p className="text-sm text-destructive mt-1">{errors.option_key}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="option_value">Option Value *</Label>
                                    <Input
                                        id="option_value"
                                        value={data.option_value}
                                        onChange={(e) => setData('option_value', e.target.value)}
                                    />
                                    {errors.option_value && <p className="text-sm text-destructive mt-1">{errors.option_value}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="concept">Concept</Label>
                                    <Textarea
                                        id="concept"
                                        value={data.concept}
                                        onChange={(e) => setData('concept', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="key_characteristics">Key Characteristics</Label>
                                    <Textarea
                                        id="key_characteristics"
                                        value={data.key_characteristics}
                                        onChange={(e) => setData('key_characteristics', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="example">Example</Label>
                                    <Textarea
                                        id="example"
                                        value={data.example}
                                        onChange={(e) => setData('example', e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="pros">Pros</Label>
                                    <Textarea
                                        id="pros"
                                        value={data.pros}
                                        onChange={(e) => setData('pros', e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="cons">Cons</Label>
                                    <Textarea
                                        id="cons"
                                        value={data.cons}
                                        onChange={(e) => setData('cons', e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="best_fit_organizations">Best Fit Organizations</Label>
                                    <Textarea
                                        id="best_fit_organizations"
                                        value={data.best_fit_organizations}
                                        onChange={(e) => setData('best_fit_organizations', e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked === true)}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Active
                                    </Label>
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <Link href="/admin/evaluation-option-guidance">
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
