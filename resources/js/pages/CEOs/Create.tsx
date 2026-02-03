import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, Link, useForm } from '@inertiajs/react';
import { UserPlus, ArrowLeft, Mail, Building2 } from 'lucide-react';
import { FormEventHandler } from 'react';

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
        post('/ceos', {
            forceFormData: false,
        });
    };

    return (
        <AppLayout>
            <Head title="Add CEO" />
            <div className="container mx-auto max-w-3xl py-8 px-4">
                <div className="mb-6">
                    <Link href="/ceos">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to CEOs
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <UserPlus className="h-8 w-8" />
                        Add New CEO
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Create a new CEO account and associate them with a company
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>CEO Information</CardTitle>
                        <CardDescription>
                            Enter the CEO's details. They will receive login credentials via email if you choose to send an invitation.
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
                                <Label htmlFor="company_id">Company *</Label>
                                <Select
                                    value={data.company_id}
                                    onValueChange={(value) => setData('company_id', value)}
                                    required
                                >
                                    <SelectTrigger>
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
                                    <p className="text-sm text-destructive">{errors.company_id}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="send_invitation"
                                    checked={data.send_invitation}
                                    onCheckedChange={(checked) => setData('send_invitation', checked as boolean)}
                                />
                                <Label htmlFor="send_invitation" className="cursor-pointer">
                                    Send invitation email with login credentials
                                </Label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    {processing ? 'Creating...' : 'Add CEO'}
                                </Button>
                                <Link href="/ceos">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
