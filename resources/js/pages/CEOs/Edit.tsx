import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { UserPlus, ArrowLeft, Mail, Building2 } from 'lucide-react';
import { FormEventHandler } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';

interface Company {
    id: number;
    name: string;
}

interface CEO {
    id: number;
    name: string;
    email: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    companies: Company[];
}

interface PageProps {
    ceo: CEO;
    companies: Company[];
}

export default function EditCEO({ ceo, companies }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: ceo.name,
        email: ceo.email,
        address: ceo.address || '',
        city: ceo.city || '',
        state: ceo.state || '',
        latitude: ceo.latitude?.toString() || '',
        longitude: ceo.longitude?.toString() || '',
        company_ids: ceo.companies.map(c => c.id.toString()),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/hr-manager/ceos/${ceo.id}`, {
            forceFormData: false,
        });
    };

    const toggleCompany = (companyId: number) => {
        const companyIdStr = companyId.toString();
        if (data.company_ids.includes(companyIdStr)) {
            setData('company_ids', data.company_ids.filter(id => id !== companyIdStr));
        } else {
            setData('company_ids', [...data.company_ids, companyIdStr]);
        }
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Edit CEO" />
                    
                    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-4">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => router.visit('/hr-manager/ceos')}
                                    className="-ml-2"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to CEOs
                                </Button>
                                <DashboardHeader
                                    title="Edit CEO"
                                    subtitle="Update CEO information and company associations"
                                    breadcrumbs={[
                                        { title: 'CEO Management', href: '/hr-manager/ceos' },
                                        { title: 'Edit CEO' }
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="max-w-4xl">

                <Card>
                    <CardHeader>
                        <CardTitle>CEO Information</CardTitle>
                        <CardDescription>
                            Update the CEO's details and manage their company associations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="John Doe"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="ceo@example.com"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Street address"
                                />
                                {errors.address && (
                                    <p className="text-sm text-destructive">{errors.address}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="City"
                                    />
                                    {errors.city && (
                                        <p className="text-sm text-destructive">{errors.city}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        type="text"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        placeholder="State"
                                    />
                                    {errors.state && (
                                        <p className="text-sm text-destructive">{errors.state}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude</Label>
                                    <Input
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        value={data.latitude}
                                        onChange={(e) => setData('latitude', e.target.value)}
                                        placeholder="e.g., 28.6139"
                                    />
                                    {errors.latitude && (
                                        <p className="text-sm text-destructive">{errors.latitude}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude</Label>
                                    <Input
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        value={data.longitude}
                                        onChange={(e) => setData('longitude', e.target.value)}
                                        placeholder="e.g., 77.2090"
                                    />
                                    {errors.longitude && (
                                        <p className="text-sm text-destructive">{errors.longitude}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Associated Companies *</Label>
                                <div className="space-y-2 border rounded-lg p-4">
                                    {companies.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No companies available</p>
                                    ) : (
                                        companies.map((company) => (
                                            <div key={company.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`company-${company.id}`}
                                                    checked={data.company_ids.includes(company.id.toString())}
                                                    onCheckedChange={() => toggleCompany(company.id)}
                                                />
                                                <Label
                                                    htmlFor={`company-${company.id}`}
                                                    className="cursor-pointer flex items-center gap-2 flex-1"
                                                >
                                                    <Building2 className="h-4 w-4" />
                                                    {company.name}
                                                </Label>
                                            </div>
                                        ))
                                    )}
                                </div>
                                {errors.company_ids && (
                                    <p className="text-sm text-destructive">{errors.company_ids}</p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update CEO'}
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => router.visit('/hr-manager/ceos')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
