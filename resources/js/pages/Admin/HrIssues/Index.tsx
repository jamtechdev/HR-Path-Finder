import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '@/layouts/AdminLayout';
import AdminPagination from '@/components/Admin/AdminPagination';
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

interface HrIssue {
    id: number;
    category: string;
    name: string;
    is_active: boolean;
    created_at?: string | null;
}

interface Props {
    issues: {
        data: HrIssue[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    categories: Record<string, string>;
    currentCategory?: string;
}

export default function HrIssuesIndex({
    issues,
    categories,
    currentCategory,
}: Props) {
    const formatRelativeTime = (value?: string | null) => {
        if (!value) return '-';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '-';
        const secs = Math.round((d.getTime() - Date.now()) / 1000);
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const abs = Math.abs(secs);
        if (abs < 60) return rtf.format(secs, 'second');
        const mins = Math.round(secs / 60);
        if (Math.abs(mins) < 60) return rtf.format(mins, 'minute');
        const hours = Math.round(mins / 60);
        if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
        const days = Math.round(hours / 24);
        return rtf.format(days, 'day');
    };

    const { t } = useTranslation();

    const handleDelete = (issueId: number) => {
        if (confirm(t('admin_hr_issues.confirm_delete'))) {
            router.delete(`/admin/hr-issues/${issueId}`);
        }
    };

    return (
        <AdminLayout>
            <Head title={t('admin_hr_issues.page_title')} />
                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold text-foreground">
                                    {t('admin_hr_issues.heading')}
                                </h1>
                                <p className="text-muted-foreground">
                                    {t('admin_hr_issues.subheading')}
                                </p>
                            </div>
                            <Link href="/admin/hr-issues/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('admin_hr_issues.actions.add_issue')}
                                </Button>
                            </Link>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{t('admin_hr_issues.list_title')}</CardTitle>
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
                                                {t('admin_hr_issues.filters.all_categories')}
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
                                    {issues.data.map((issue) => (
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
                                                            {t('admin_hr_issues.badges.inactive')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium">
                                                    {issue.name}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Created: {formatRelativeTime(issue.created_at)}
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
                                    {issues.data.length === 0 && (
                                        <p className="py-8 text-center text-muted-foreground">
                                            {t('admin_hr_issues.empty')}
                                        </p>
                                    )}
                                </div>
                                <AdminPagination links={issues.links} />
                            </CardContent>
                        </Card>
                    </div>
        </AdminLayout>
    );
}
