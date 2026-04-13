import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';

export default function Edit({
    issue,
    categories,
}: {
    issue: any;
    categories: Record<string, string>;
}) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        name: issue.name,
        category: issue.category,
        is_active: issue.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/hr-issues/${issue.id}`);
    };

    return (
        <AdminLayout>
            <Head title={t('admin_misc_page_titles.hr_issues_edit')} />
            <div className="mx-auto max-w-4xl p-6 md:p-8">
                        <div className="mb-6">
                            <Link
                                href="/admin/hr-issues"
                                className="text-sm text-muted-foreground hover:underline"
                            >
                                {t('admin_hr_issue_form.back_to_list')}
                            </Link>
                            <h1 className="mt-2 text-3xl font-bold">
                                {t('admin_hr_issue_form.edit_heading')}
                            </h1>
                        </div>

                        <form onSubmit={submit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('admin_hr_issue_form.card_title')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>
                                            {t('admin_hr_issue_form.issue_name')}{' '}
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
                                        <Label>{t('admin_hr_issue_form.category')}</Label>
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
                                            {t('admin_hr_issue_form.active')}
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex justify-end gap-2">
                                <Link href="/admin/hr-issues">
                                    <Button variant="outline">
                                        {t('admin_hr_issue_form.cancel')}
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {t('admin_hr_issue_form.update')}
                                </Button>
                            </div>
                        </form>
                    </div>
        </AdminLayout>
    );
}
