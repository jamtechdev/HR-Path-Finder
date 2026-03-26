import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { toastCopy } from '@/lib/toastCopy';
import { toast } from '@/hooks/use-toast';

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

export default function HrIssuesIndex({
    issues,
    categories,
    currentCategory,
}: Props) {
    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) {
            toast({ title: toastCopy.success, description: flash.success });
        }

        if (flash?.error) {
            toast({ title: toastCopy.error, description: flash.error, variant: 'destructive' });
        }
    }, [flash]);

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
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title="HR Issues Management" />
                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-foreground">
                                    HR Issues Management
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage HR issue items that can be selected
                                    by HR managers and CEOs
                                </p>
                            </div>
                            <Link href="/admin/hr-issues/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
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
                                            router.visit(
                                                value === 'all'
                                                    ? '/admin/hr-issues'
                                                    : `/admin/hr-issues?category=${value}`,
                                            );
                                        }}
                                    >
                                        <SelectTrigger className="w-64">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Categories
                                            </SelectItem>
                                            {Object.entries(categories).map(
                                                ([key, label]) => (
                                                    <SelectItem
                                                        key={key}
                                                        value={key}
                                                    >
                                                        {label}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {issues.map((issue) => (
                                        <div
                                            key={issue.id}
                                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                                        >
                                            <div className="flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <Badge variant="outline">
                                                        {categories[
                                                            issue.category
                                                        ] || issue.category}
                                                    </Badge>
                                                    {!issue.is_active && (
                                                        <Badge variant="destructive">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium">
                                                    {issue.name}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Order: {issue.order}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/hr-issues/${issue.id}/edit`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(issue.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {issues.length === 0 && (
                                        <p className="py-8 text-center text-muted-foreground">
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
