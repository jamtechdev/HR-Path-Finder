import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Search, GripVertical } from 'lucide-react';

interface CompensationSnapshotQuestion {
    id: number;
    question_text: string;
    answer_type: 'select_one' | 'select_up_to_2' | 'multiple' | 'numeric' | 'text';
    options?: string[] | null;
    order: number;
    is_active: boolean;
    version?: string;
}

interface Props {
    questions: CompensationSnapshotQuestion[];
    answerTypes: Record<string, string>;
}

export default function CompensationSnapshotIndex({ questions, answerTypes }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredQuestions = questions.filter(q =>
        q.question_text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (questionId: number) => {
        if (confirm('Are you sure you want to delete this question?')) {
            router.delete(`/admin/compensation-snapshot/${questionId}`, {
                preserveScroll: true,
            });
        }
    };

    const getAnswerTypeLabel = (type: string) => {
        return answerTypes[type] || type;
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Compensation Snapshot Questions Management" />
                    <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Compensation Snapshot Questions</h1>
                                <p className="text-muted-foreground">
                                    Manage all questions for the Strategic Compensation Snapshot (Stage 4-1)
                                </p>
                            </div>
                            <Link href="/admin/compensation-snapshot/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Question
                                </Button>
                            </Link>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
                                    <div className="relative w-64">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search questions..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {filteredQuestions.map((question) => (
                                        <div
                                            key={question.id}
                                            className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50"
                                        >
                                            <div className="flex items-start gap-3 flex-1">
                                                <GripVertical className="w-5 h-5 text-muted-foreground mt-1 cursor-move" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline">
                                                            {getAnswerTypeLabel(question.answer_type)}
                                                        </Badge>
                                                        {question.version && (
                                                            <Badge variant="secondary">v{question.version}</Badge>
                                                        )}
                                                        {!question.is_active && (
                                                            <Badge variant="destructive">Inactive</Badge>
                                                        )}
                                                    </div>
                                                    <p className="font-medium mb-1">{question.question_text}</p>
                                                    {question.options && question.options.length > 0 && (
                                                        <div className="mt-2">
                                                            <p className="text-sm text-muted-foreground">
                                                                Options: {question.options.join(', ')}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {(question.answer_type === 'numeric' || question.answer_type === 'text') && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {question.answer_type === 'numeric' ? 'Numeric input (KRW amounts, percentages)' : 'Text input'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/compensation-snapshot/${question.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(question.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredQuestions.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            {searchTerm ? 'No questions found matching your search.' : 'No questions configured yet.'}
                                        </div>
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
