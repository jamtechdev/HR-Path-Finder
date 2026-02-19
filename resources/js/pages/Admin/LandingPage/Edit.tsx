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

interface LandingPageSection {
    id: number;
    section_key: string;
    section_type: string;
    content: string;
    locale: string;
    order: number;
    is_active: boolean;
    metadata?: any;
}

interface Props {
    section: LandingPageSection;
    locales: Record<string, string>;
    sectionTypes: Record<string, string>;
}

export default function LandingPageEdit({ section, locales, sectionTypes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        section_key: section.section_key,
        section_type: section.section_type,
        content: section.content,
        locale: section.locale,
        order: section.order,
        is_active: section.is_active,
        metadata: section.metadata || null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/landing-page/${section.id}`, {
            onSuccess: () => {
                router.visit('/admin/landing-page');
            },
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
                    <Head title="Edit Landing Page Section" />
                    <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/landing-page')}
                                className="mb-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back to Landing Page
                            </Button>
                            <h1 className="text-3xl font-bold">Edit Landing Page Section</h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Section Details</CardTitle>
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
                                            <Label>Section Type <span className="text-destructive">*</span></Label>
                                            <Select
                                                value={data.section_type}
                                                onValueChange={(v) => setData('section_type', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(sectionTypes).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.section_type && (
                                                <p className="text-sm text-destructive mt-1">{errors.section_type}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Section Key <span className="text-destructive">*</span></Label>
                                        <Input
                                            value={data.section_key}
                                            onChange={(e) => setData('section_key', e.target.value)}
                                            required
                                        />
                                        {errors.section_key && (
                                            <p className="text-sm text-destructive mt-1">{errors.section_key}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Content <span className="text-destructive">*</span></Label>
                                        {data.section_type === 'textarea' || data.section_type === 'html' ? (
                                            <Textarea
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                rows={data.section_type === 'html' ? 8 : 4}
                                                required
                                            />
                                        ) : (
                                            <Input
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                required
                                            />
                                        )}
                                        {errors.content && (
                                            <p className="text-sm text-destructive mt-1">{errors.content}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Display Order</Label>
                                        <Input
                                            type="number"
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                            min="0"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Active (section will be displayed on landing page)
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/admin/landing-page')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Update Section
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
