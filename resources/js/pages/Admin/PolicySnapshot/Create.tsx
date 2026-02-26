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
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft } from 'lucide-react';

export default function PolicySnapshotCreate() {
    const { data, setData, post, processing, errors } = useForm({
        question_text: '',
        order: 0,
        is_active: true,
        has_conditional_text: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/policy-snapshot', {
            onSuccess: () => {
                router.visit('/admin/policy-snapshot');
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
                    <Head title="Create Policy Snapshot Question" />
                    <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/policy-snapshot')}
                                className="mb-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <h1 className="text-3xl font-bold">Create Policy Snapshot Question</h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Question Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Question Text <span className="text-destructive">*</span></Label>
                                        <Textarea
                                            value={data.question_text}
                                            onChange={(e) => setData('question_text', e.target.value)}
                                            rows={3}
                                            required
                                        />
                                        {errors.question_text && (
                                            <p className="text-sm text-destructive mt-1">{errors.question_text}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Order</Label>
                                        <Input
                                            type="number"
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                            min="0"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="has_conditional_text"
                                            checked={data.has_conditional_text}
                                            onCheckedChange={(checked) => setData('has_conditional_text', checked as boolean)}
                                        />
                                        <Label htmlFor="has_conditional_text" className="cursor-pointer">
                                            Has conditional text field (shows text input when "Yes" is selected)
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Active
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/admin/policy-snapshot')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Create Question
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
