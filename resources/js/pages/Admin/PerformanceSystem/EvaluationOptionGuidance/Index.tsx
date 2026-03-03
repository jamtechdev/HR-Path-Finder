import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface EvaluationOptionGuidance {
    id: number;
    option_key: string;
    option_value: string;
    concept?: string;
    key_characteristics?: string;
    example?: string;
    pros?: string;
    cons?: string;
    best_fit_organizations?: string;
    is_active: boolean;
}

interface Props {
    guidances: EvaluationOptionGuidance[];
    optionKeys: string[];
}

export default function EvaluationOptionGuidanceIndex({ guidances, optionKeys }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterKey, setFilterKey] = useState<string>('');

    const filteredGuidances = guidances.filter(g => {
        const matchesSearch = g.option_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             g.option_value.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = !filterKey || g.option_key === filterKey;
        return matchesSearch && matchesFilter;
    });

    const handleDelete = (guidanceId: number) => {
        if (confirm('Are you sure you want to delete this guidance?')) {
            router.delete(`/admin/evaluation-option-guidance/${guidanceId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <SidebarProvider>
            <Sidebar>
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset>
                <AppHeader />
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <Head title="Evaluation Option Guidance Management" />
                    
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Evaluation Option Guidance</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage guidance content for evaluation structure options
                            </p>
                        </div>
                        <Link href="/admin/evaluation-option-guidance/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Guidance
                            </Button>
                        </Link>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                        <Input
                                            placeholder="Search by option key or value..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={filterKey}
                                    onChange={(e) => setFilterKey(e.target.value)}
                                    className="px-3 py-2 border rounded-md"
                                >
                                    <option value="">All Option Keys</option>
                                    {optionKeys.map(key => (
                                        <option key={key} value={key}>{key}</option>
                                    ))}
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredGuidances.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No guidance found. Click "Add Guidance" to create one.
                                    </div>
                                ) : (
                                    filteredGuidances.map((guidance) => (
                                        <Card key={guidance.id} className="hover:shadow-md transition-shadow">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline">{guidance.option_key}</Badge>
                                                        <span className="font-semibold">{guidance.option_value}</span>
                                                        {!guidance.is_active && (
                                                            <Badge variant="secondary">Inactive</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/admin/evaluation-option-guidance/${guidance.id}/edit`}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(guidance.id)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            {guidance.concept && (
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {guidance.concept}
                                                    </p>
                                                </CardContent>
                                            )}
                                        </Card>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
