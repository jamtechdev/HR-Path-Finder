import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';

interface Company {
    id: number;
    name: string;
}

interface PageProps {
    companies: Company[];
}

export default function CreateCEO({ companies }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        address: '',
        city: '',
        state: '',
        latitude: '',
        longitude: '',
        company_id: '',
        send_invitation: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/hr-manager/ceos', {
            forceFormData: false,
        });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Add CEO" />
                    
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
                                    title="Add New CEO"
                                    subtitle="Create a new CEO account and associate them with a company"
                                    breadcrumbs={[
                                        { title: 'CEO Management', href: '/hr-manager/ceos' },
                                        { title: 'Add CEO' }
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="max-w-4xl">
                            <Card className="shadow-sm">
                                <CardHeader className="pb-6">
                                    <CardTitle className="text-xl">CEO Information</CardTitle>
                                    <CardDescription className="text-base mt-2">
                                        Enter the CEO's details. They will receive login credentials via email if you choose to send an invitation.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <form onSubmit={submit} className="space-y-6">
                                        {/* Required Fields Section */}
                                        <div className="space-y-6 pb-6 border-b">
                                            <div>
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                                                    Required Information
                                                </h3>
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name" className="text-sm font-medium">
                                                            Full Name <span className="text-destructive">*</span>
                                                        </Label>
                                                        <Input
                                                            id="name"
                                                            type="text"
                                                            value={data.name}
                                                            onChange={(e) => setData('name', e.target.value)}
                                                            placeholder="Enter full name"
                                                            className="h-11"
                                                            required
                                                        />
                                                        {errors.name && (
                                                            <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="email" className="text-sm font-medium">
                                                            Email Address <span className="text-destructive">*</span>
                                                        </Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            value={data.email}
                                                            onChange={(e) => setData('email', e.target.value)}
                                                            placeholder="ceo@example.com"
                                                            className="h-11"
                                                            required
                                                        />
                                                        {errors.email && (
                                                            <p className="text-sm text-destructive mt-1">{errors.email}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-6 space-y-2">
                                                    <Label htmlFor="company_id" className="text-sm font-medium">
                                                        Company <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Select
                                                        value={data.company_id}
                                                        onValueChange={(value) => setData('company_id', value)}
                                                        required
                                                    >
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue placeholder="Select a company" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {companies.map((company) => (
                                                                <SelectItem key={company.id} value={company.id.toString()}>
                                                                    {company.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.company_id && (
                                                        <p className="text-sm text-destructive mt-1">{errors.company_id}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Optional Fields Section */}
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                                                    Additional Information (Optional)
                                                </h3>
                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="address" className="text-sm font-medium">
                                                            Address
                                                        </Label>
                                                        <Input
                                                            id="address"
                                                            type="text"
                                                            value={data.address}
                                                            onChange={(e) => setData('address', e.target.value)}
                                                            placeholder="Street address"
                                                            className="h-11"
                                                        />
                                                        {errors.address && (
                                                            <p className="text-sm text-destructive mt-1">{errors.address}</p>
                                                        )}
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="city" className="text-sm font-medium">
                                                                City
                                                            </Label>
                                                            <Input
                                                                id="city"
                                                                type="text"
                                                                value={data.city}
                                                                onChange={(e) => setData('city', e.target.value)}
                                                                placeholder="City"
                                                                className="h-11"
                                                            />
                                                            {errors.city && (
                                                                <p className="text-sm text-destructive mt-1">{errors.city}</p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="state" className="text-sm font-medium">
                                                                State
                                                            </Label>
                                                            <Input
                                                                id="state"
                                                                type="text"
                                                                value={data.state}
                                                                onChange={(e) => setData('state', e.target.value)}
                                                                placeholder="State"
                                                                className="h-11"
                                                            />
                                                            {errors.state && (
                                                                <p className="text-sm text-destructive mt-1">{errors.state}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="latitude" className="text-sm font-medium">
                                                                Latitude
                                                            </Label>
                                                            <Input
                                                                id="latitude"
                                                                type="number"
                                                                step="any"
                                                                value={data.latitude}
                                                                onChange={(e) => setData('latitude', e.target.value)}
                                                                placeholder="e.g., 28.6139"
                                                                className="h-11"
                                                            />
                                                            {errors.latitude && (
                                                                <p className="text-sm text-destructive mt-1">{errors.latitude}</p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="longitude" className="text-sm font-medium">
                                                                Longitude
                                                            </Label>
                                                            <Input
                                                                id="longitude"
                                                                type="number"
                                                                step="any"
                                                                value={data.longitude}
                                                                onChange={(e) => setData('longitude', e.target.value)}
                                                                placeholder="e.g., 77.2090"
                                                                className="h-11"
                                                            />
                                                            {errors.longitude && (
                                                                <p className="text-sm text-destructive mt-1">{errors.longitude}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Invitation Option */}
                                        <div className="pt-6 border-t">
                                            <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                                                <Checkbox
                                                    id="send_invitation"
                                                    checked={data.send_invitation}
                                                    onCheckedChange={(checked) => setData('send_invitation', checked as boolean)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <Label htmlFor="send_invitation" className="cursor-pointer text-sm font-medium">
                                                        Send invitation email with login credentials
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        The CEO will receive an email with their login credentials to access the platform.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Form Actions */}
                                        <div className="flex items-center justify-end gap-4 pt-6 border-t">
                                            <Button 
                                                type="button" 
                                                variant="outline"
                                                onClick={() => router.visit('/hr-manager/ceos')}
                                                className="min-w-[100px]"
                                            >
                                                Cancel
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                disabled={processing}
                                                className="min-w-[140px]"
                                            >
                                                <UserPlus className="h-4 w-4 mr-2" />
                                                {processing ? 'Creating...' : 'Add CEO'}
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
