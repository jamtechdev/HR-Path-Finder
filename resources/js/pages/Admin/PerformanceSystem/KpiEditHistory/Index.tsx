import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from 'react-i18next';

interface KpiEditHistory {
    id: number;
    organizational_kpi_id: number;
    edited_by_type: 'hr_manager' | 'org_manager' | 'ceo';
    edited_by_id?: number;
    edited_by_name?: string;
    changes: {
        old_values?: any;
        new_values?: any;
        description?: string;
    };
    created_at: string;
    organizational_kpi?: {
        id: number;
        kpi_name: string;
        organization_name: string;
        hr_project_id: number;
        hr_project?: {
            id: number;
            company?: {
                name: string;
            };
        };
    };
}

interface Props {
    editHistory: {
        data: KpiEditHistory[];
        links?: any;
        meta?: any;
    };
    projectId?: number;
}

export default function KpiEditHistoryIndex({ editHistory, projectId }: Props) {
    const { t } = useTranslation();
    const getEditorTypeBadge = (type: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            hr_manager: 'default',
            org_manager: 'secondary',
            ceo: 'destructive',
        };
        return <Badge variant={variants[type] || 'default'}>{type.replace('_', ' ').toUpperCase()}</Badge>;
    };

    return (
        <SidebarProvider>
            <Sidebar>
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset>
                <AppHeader />
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <Head title={t('admin_kpi_edit_history.page_title')} />
                    
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold">{t('admin_kpi_edit_history.heading')}</h1>
                        <p className="text-muted-foreground mt-1">
                            {t('admin_kpi_edit_history.subheading')}
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('admin_kpi_edit_history.log_title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {editHistory.data.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    {t('admin_kpi_edit_history.empty')}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t('admin_kpi_edit_history.table.date_time')}</TableHead>
                                                <TableHead>{t('admin_kpi_edit_history.table.kpi')}</TableHead>
                                                <TableHead>{t('admin_kpi_edit_history.table.organization')}</TableHead>
                                                <TableHead>{t('admin_kpi_edit_history.table.project')}</TableHead>
                                                <TableHead>{t('admin_kpi_edit_history.table.edited_by')}</TableHead>
                                                <TableHead>{t('admin_kpi_edit_history.table.editor_type')}</TableHead>
                                                <TableHead>{t('admin_kpi_edit_history.table.description')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {editHistory.data.map((history) => (
                                                <TableRow key={history.id}>
                                                    <TableCell>
                                                        {new Date(history.created_at).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {history.organizational_kpi?.kpi_name || t('admin_kpi_edit_history.na')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {history.organizational_kpi?.organization_name || t('admin_kpi_edit_history.na')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {history.organizational_kpi?.hr_project?.company?.name || t('admin_kpi_edit_history.na')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {history.edited_by_name || t('admin_kpi_edit_history.na')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getEditorTypeBadge(history.edited_by_type)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-xs">
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {history.changes?.description || t('admin_kpi_edit_history.kpi_modified')}
                                                            </p>
                                                            {history.changes?.old_values && history.changes?.new_values && (
                                                                <details className="mt-1">
                                                                    <summary className="text-xs text-primary cursor-pointer">
                                                                        {t('admin_kpi_edit_history.view_changes')}
                                                                    </summary>
                                                                    <div className="mt-2 text-xs space-y-1">
                                                                        <div>
                                                                            <strong>{t('admin_kpi_edit_history.old')}:</strong>
                                                                            <pre className="bg-muted p-2 rounded mt-1 overflow-auto">
                                                                                {JSON.stringify(history.changes.old_values, null, 2)}
                                                                            </pre>
                                                                        </div>
                                                                        <div>
                                                                            <strong>{t('admin_kpi_edit_history.new')}:</strong>
                                                                            <pre className="bg-muted p-2 rounded mt-1 overflow-auto">
                                                                                {JSON.stringify(history.changes.new_values, null, 2)}
                                                                            </pre>
                                                                        </div>
                                                                    </div>
                                                                </details>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
