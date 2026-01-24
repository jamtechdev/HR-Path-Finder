import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function CreateCompany() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        industry: '',
        size: '',
        growth_stage: '',
        logo: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.post('/companies', data, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Create Company" />
            <div className="container mx-auto max-w-2xl py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Company Workspace Setup</CardTitle>
                        <CardDescription>
                            Create a new company workspace to begin designing your HR system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Company Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry</Label>
                                <Input
                                    id="industry"
                                    value={data.industry}
                                    onChange={(e) => setData('industry', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="size">Company Size</Label>
                                <Select value={data.size} onValueChange={(value) => setData('size', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="small">Small (1-50)</SelectItem>
                                        <SelectItem value="medium">Medium (51-200)</SelectItem>
                                        <SelectItem value="large">Large (201+)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="growth_stage">Growth Stage</Label>
                                <Select
                                    value={data.growth_stage}
                                    onValueChange={(value) => setData('growth_stage', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select growth stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="early">Early</SelectItem>
                                        <SelectItem value="growth">Growth</SelectItem>
                                        <SelectItem value="maturity">Maturity</SelectItem>
                                        <SelectItem value="decline">Decline</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="logo">Company Logo</Label>
                                <Input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('logo', e.target.files?.[0] || null)}
                                />
                            </div>

                            <Button type="submit" disabled={processing} className="w-full">
                                {processing ? 'Creating...' : 'Create Company & Start HR Project'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
