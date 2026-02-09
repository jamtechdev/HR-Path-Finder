import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface HrIssue {
    id: number;
    category: string;
    name: string;
    order: number;
    is_active: boolean;
}

interface Props {
    issues: HrIssue[];
    categories: Record<string, string>;
    currentCategory?: string;
}

export default function HrIssuesIndex({ issues, categories, currentCategory }: Props) {
    const handleDelete = (issueId: number) => {
        if (confirm('Are you sure you want to delete this issue?')) {
            router.delete(`/admin/hr-issues/${issueId}`, {
                preserveScroll: true,
            });
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
                    <Head title="HR Issues Management" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">HR Issues Management</h1>
                                <p className="text-muted-foreground">
                                    Manage HR issue items that can be selected by HR managers and CEOs
                                </p>
                            </div>
                            <Link href="/admin/hr-issues/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Issue
                                </Button>
                            </Link>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>HR Issues</CardTitle>
                                    <Select
                                        value={currentCategory || 'all'}
                                        onValueChange={(value) => {
                                            router.visit(value === 'all'
                                                ? '/admin/hr-issues'
                                                : `/admin/hr-issues?category=${value}`
                                            );
                                        }}
                                    >
                                        <SelectTrigger className="w-64">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {Object.entries(categories).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {issues.map((issue) => (
                                        <div
                                            key={issue.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline">
                                                        {categories[issue.category] || issue.category}
                                                    </Badge>
                                                    {!issue.is_active && (
                                                        <Badge variant="destructive">Inactive</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium">{issue.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Order: {issue.order}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/hr-issues/${issue.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(issue.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {issues.length === 0 && (
                                        <p className="text-center text-muted-foreground py-8">
                                            No issues found.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
