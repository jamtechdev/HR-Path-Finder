import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { Head, Link, useForm } from '@inertiajs/react';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { ArrowLeft, Save } from 'lucide-react';

interface Company {
    id: number;
    name: string;
}

interface Ceo {
    id: number;
    name: string;
    email: string;
    companies: Company[];
}

interface Props {
    ceo: Ceo;
    companies: Company[];
}

export default function Edit({ ceo, companies }: Props) {
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        name: ceo.name,
        email: ceo.email,
        company_id: ceo.companies?.[0]?.id ?? null,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        put(`/admin/ceos/${ceo.id}`);
    }

    return (
        <SidebarProvider defaultOpen>
            <Sidebar collapsible="icon">
                <RoleBasedSidebar />
            </Sidebar>

            <SidebarInset className="flex flex-col">
                <AppHeader />

                <main className="flex-1 p-6 md:p-8">
                    <Head title="Edit CEO" />

                    <div className="mx-auto max-w-3xl">
                        {/* Header */}
                        <div className="mb-6 flex items-center gap-3">
                            <Link href="/admin/ceo">
                                <Button variant="outline" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </Link>

                            <h1 className="text-2xl font-bold">Edit CEO</h1>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>CEO Information</CardTitle>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={submit} className="space-y-4">
                                    <div>
                                        <Label>Name</Label>

                                        <Input
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                        />

                                        {errors.name && (
                                            <p className="text-sm text-red-500">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Email</Label>

                                        <Input
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                        />

                                        {errors.email && (
                                            <p className="text-sm text-red-500">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Company</Label>

                                        <Select
                                            value={
                                                data.company_id
                                                    ? String(data.company_id)
                                                    : 'none'
                                            }
                                            onValueChange={(value) =>
                                                setData(
                                                    'company_id',
                                                    value === 'none'
                                                        ? null
                                                        : Number(value),
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Company" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="none">
                                                    No Company
                                                </SelectItem>

                                                {companies.map((company) => (
                                                    <SelectItem
                                                        key={company.id}
                                                        value={String(
                                                            company.id,
                                                        )}
                                                    >
                                                        {company.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            Update CEO
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
