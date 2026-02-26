import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface IntroText {
    id: number;
    key: string;
    title?: string;
    content: string;
    is_active: boolean;
}

interface Props {
    texts: IntroText[];
}

export default function IntroTextsIndex({ texts }: Props) {
    const handleDelete = (textId: number) => {
        if (confirm('Are you sure you want to delete this intro text?')) {
            router.delete(`/admin/intro-texts/${textId}`, {
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
                    <Head title="Intro Texts Management" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2 text-foreground">Intro Texts Management</h1>
                                <p className="text-muted-foreground">
                                    Manage introductory and consent texts shown to users before surveys
                                </p>
                            </div>
                            <Link href="/admin/intro-texts/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Intro Text
                                </Button>
                            </Link>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Intro Texts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {texts.map((text) => (
                                        <div
                                            key={text.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline">{text.key}</Badge>
                                                    {text.title && (
                                                        <span className="font-medium">{text.title}</span>
                                                    )}
                                                    {!text.is_active && (
                                                        <Badge variant="destructive">Inactive</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {text.content}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/intro-texts/${text.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(text.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {texts.length === 0 && (
                                        <p className="text-center text-muted-foreground py-8">
                                            No intro texts found.
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
