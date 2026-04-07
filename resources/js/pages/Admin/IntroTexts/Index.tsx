import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

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
    const { t } = useTranslation();
    const handleDelete = (textId: number) => {
        if (confirm(t('admin_intro_texts.confirm_delete'))) {
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
                    <Head title={t('admin_intro_texts.page_title')} />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2 text-foreground">{t('admin_intro_texts.heading')}</h1>
                                <p className="text-muted-foreground">
                                    {t('admin_intro_texts.subheading')}
                                </p>
                            </div>
                            <Link href="/admin/intro-texts/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('admin_intro_texts.add')}
                                </Button>
                            </Link>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('admin_intro_texts.card_title')}</CardTitle>
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
                                                        <Badge variant="destructive">{t('admin_intro_texts.inactive')}</Badge>
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
                                            {t('admin_intro_texts.empty')}
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
