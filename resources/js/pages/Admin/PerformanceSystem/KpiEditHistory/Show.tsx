import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

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
}

interface Props {
    kpi: {
        id: number;
        kpi_name: string;
        organization_name: string;
    };
    editHistory: KpiEditHistory[];
}

export default function KpiEditHistoryShow({ kpi, editHistory }: Props) {
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
                    <Head title={`KPI Edit History - ${kpi.kpi_name}`} />
                    
                    <div className="mb-6">
                        <Link href="/admin/kpi-edit-history">
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">KPI Edit History</h1>
                        <p className="text-muted-foreground mt-1">
                            {kpi.kpi_name} - {kpi.organization_name}
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Edit History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {editHistory.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    No edit history found for this KPI.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {editHistory.map((history) => (
                                        <Card key={history.id} className="border-l-4 border-l-primary">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-semibold">
                                                            {new Date(history.created_at).toLocaleString()}
                                                        </span>
                                                        {getEditorTypeBadge(history.edited_by_type)}
                                                    </div>
                                                    {history.edited_by_name && (
                                                        <span className="text-sm text-muted-foreground">
                                                            Edited by: {history.edited_by_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {history.changes?.description && (
                                                    <p className="text-sm mb-3">{history.changes.description}</p>
                                                )}
                                                {history.changes?.old_values && history.changes?.new_values && (
                                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                                        <div>
                                                            <h4 className="text-sm font-semibold mb-2">Old Values</h4>
                                                            <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">
                                                                {JSON.stringify(history.changes.old_values, null, 2)}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-semibold mb-2">New Values</h4>
                                                            <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-64">
                                                                {JSON.stringify(history.changes.new_values, null, 2)}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
