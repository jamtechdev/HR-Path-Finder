import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
                    <Head title="KPI Edit History" />
                    
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold">KPI Edit History</h1>
                        <p className="text-muted-foreground mt-1">
                            View all modifications made to organizational KPIs
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Edit History Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {editHistory.data.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    No edit history found.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date & Time</TableHead>
                                                <TableHead>KPI</TableHead>
                                                <TableHead>Organization</TableHead>
                                                <TableHead>Project</TableHead>
                                                <TableHead>Edited By</TableHead>
                                                <TableHead>Editor Type</TableHead>
                                                <TableHead>Description</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {editHistory.data.map((history) => (
                                                <TableRow key={history.id}>
                                                    <TableCell>
                                                        {new Date(history.created_at).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {history.organizational_kpi?.kpi_name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {history.organizational_kpi?.organization_name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {history.organizational_kpi?.hr_project?.company?.name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {history.edited_by_name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getEditorTypeBadge(history.edited_by_type)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-xs">
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {history.changes?.description || 'KPI modified'}
                                                            </p>
                                                            {history.changes?.old_values && history.changes?.new_values && (
                                                                <details className="mt-1">
                                                                    <summary className="text-xs text-primary cursor-pointer">
                                                                        View Changes
                                                                    </summary>
                                                                    <div className="mt-2 text-xs space-y-1">
                                                                        <div>
                                                                            <strong>Old:</strong>
                                                                            <pre className="bg-muted p-2 rounded mt-1 overflow-auto">
                                                                                {JSON.stringify(history.changes.old_values, null, 2)}
                                                                            </pre>
                                                                        </div>
                                                                        <div>
                                                                            <strong>New:</strong>
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
