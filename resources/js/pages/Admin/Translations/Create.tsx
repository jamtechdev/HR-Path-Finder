import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
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
import { ChevronLeft } from 'lucide-react';

interface Props {
    locales: Record<string, string>;
    namespaces: Record<string, string>;
}

export default function TranslationsCreate({ locales, namespaces }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        locale: 'ko',
        namespace: 'translation',
        key: '',
        value: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/translations', {
            onSuccess: () => {
                router.visit('/admin/translations');
            },
        });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title="Create Translation" />
                    <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/translations')}
                                className="mb-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back to Translations
                            </Button>
                            <h1 className="text-3xl font-bold">Create Translation</h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Translation Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Language <span className="text-destructive">*</span></Label>
                                            <Select
                                                value={data.locale}
                                                onValueChange={(v) => setData('locale', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(locales).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.locale && (
                                                <p className="text-sm text-destructive mt-1">{errors.locale}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label>Namespace <span className="text-destructive">*</span></Label>
                                            <Select
                                                value={data.namespace}
                                                onValueChange={(v) => setData('namespace', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(namespaces).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.namespace && (
                                                <p className="text-sm text-destructive mt-1">{errors.namespace}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Translation Key <span className="text-destructive">*</span></Label>
                                        <Input
                                            value={data.key}
                                            onChange={(e) => setData('key', e.target.value)}
                                            required
                                            placeholder="e.g., common.save, buttons.continue"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Use dot notation for nested keys (e.g., common.save, buttons.continue)
                                        </p>
                                        {errors.key && (
                                            <p className="text-sm text-destructive mt-1">{errors.key}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Translation Value <span className="text-destructive">*</span></Label>
                                        <Textarea
                                            value={data.value}
                                            onChange={(e) => setData('value', e.target.value)}
                                            rows={3}
                                            required
                                            placeholder="Enter the translated text..."
                                        />
                                        {errors.value && (
                                            <p className="text-sm text-destructive mt-1">{errors.value}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Active (translation will be used in the application)
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/admin/translations')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Create Translation
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
