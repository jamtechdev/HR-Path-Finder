import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { Head, Link, useForm } from '@inertiajs/react';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';
import React from 'react';

export default function Create({
    categories,
}: {
    categories: Record<string, string>;
}) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: '',
        order: '',
        category: Object.keys(categories)[0] || '',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/hr-issues', data); // ✅ correct URL
    };

    return (
        <SidebarProvider>
            <Sidebar>
                <RoleBasedSidebar />
            </Sidebar>

            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <Head title="Create HR Issue" />

                <main className="flex-1 overflow-auto bg-background">
                    <div className="mx-auto max-w-4xl p-6 md:p-8">
                        <div className="mb-6">
                            <Link
                                href="/admin/hr-issues"
                                className="text-sm text-muted-foreground hover:underline"
                            >
                                &larr; Back to HR Issues
                            </Link>
                            <h1 className="mt-2 text-3xl font-bold">
                                Create HR Issue
                            </h1>
                        </div>

                        <form onSubmit={submit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>HR Issue Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>
                                            Issue Name{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Category</Label>
                                        <select
                                            value={data.category}
                                            onChange={(e) =>
                                                setData(
                                                    'category',
                                                    e.target.value,
                                                )
                                            }
                                            className="mt-1 block w-full rounded border p-2"
                                        >
                                            {Object.entries(categories).map(
                                                ([key, label]) => (
                                                    <option
                                                        key={key}
                                                        value={key}
                                                    >
                                                        {label}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                        {errors.category && (
                                            <p className="mt-1 text-sm text-destructive">
                                                {errors.category}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Order</Label>
                                        <Input
                                            type="number"
                                            value={data.order}
                                            onChange={(e) =>
                                                setData('order', e.target.value)
                                            }
                                            placeholder="Auto-assigned if left empty"
                                        />
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Lower numbers appear first.
                                        </p>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_active',
                                                    checked as boolean,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="is_active"
                                            className="cursor-pointer"
                                        >
                                            Active
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex justify-end gap-2">
                                <Link href="/admin/hr-issues">
                                    <Button variant="outline">Cancel</Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    Create
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
