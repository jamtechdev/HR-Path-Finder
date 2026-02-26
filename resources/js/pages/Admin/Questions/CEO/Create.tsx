import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import DynamicList from '@/components/Forms/DynamicList';
import { ChevronLeft } from 'lucide-react';

interface Props {
    categories: Record<string, string>;
    questionTypes: Record<string, string>;
}

export default function CEOQuestionCreate({ categories, questionTypes }: Props) {
    const [questionType, setQuestionType] = useState<string>('text');
    const [options, setOptions] = useState<string[]>([]);
    const [metadata, setMetadata] = useState<any>({});

    const { data, setData, post, processing, errors } = useForm({
        category: '',
        question_text: '',
        question_type: 'text',
        order: 0,
        is_active: true,
        options: null as string[] | null,
        metadata: null as any,
    });

    useEffect(() => {
        setData('question_type', questionType);
        if (questionType === 'select') {
            setData('options', options);
        } else {
            setData('options', null);
        }
        if (questionType === 'likert' || questionType === 'slider' || questionType === 'number') {
            setData('metadata', metadata);
        } else {
            setData('metadata', null);
        }
    }, [questionType, options, metadata]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/questions/ceo', {
            onSuccess: () => {
                router.visit('/admin/questions/ceo');
            },
        });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                    <Head title="Create CEO Question" />
                    <div className="p-6 md:p-8 max-w-4xl mx-auto">
                        <div className="mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/admin/questions/ceo')}
                                className="mb-4"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Back to Questions
                            </Button>
                            <h1 className="text-3xl font-bold">Create CEO Question</h1>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Question Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Category <span className="text-destructive">*</span></Label>
                                        <Select
                                            value={data.category}
                                            onValueChange={(value) => setData('category', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(categories).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && (
                                            <p className="text-sm text-destructive mt-1">{errors.category}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Question Text <span className="text-destructive">*</span></Label>
                                        <Textarea
                                            value={data.question_text}
                                            onChange={(e) => setData('question_text', e.target.value)}
                                            rows={3}
                                            required
                                        />
                                        {errors.question_text && (
                                            <p className="text-sm text-destructive mt-1">{errors.question_text}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Question Type <span className="text-destructive">*</span></Label>
                                        <Select
                                            value={questionType}
                                            onValueChange={setQuestionType}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(questionTypes).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {questionType === 'select' && (
                                        <div>
                                            <Label>Options</Label>
                                            <DynamicList
                                                label=""
                                                items={options}
                                                onChange={setOptions}
                                                placeholder="Enter option"
                                                addLabel="Add Option"
                                            />
                                        </div>
                                    )}

                                    {(questionType === 'likert' || questionType === 'slider') && (
                                        <div className="space-y-4">
                                            {questionType === 'slider' && (
                                                <>
                                                    <div>
                                                        <Label>Option A</Label>
                                                        <Input
                                                            value={metadata.option_a || ''}
                                                            onChange={(e) => setMetadata({ ...metadata, option_a: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Option B</Label>
                                                        <Input
                                                            value={metadata.option_b || ''}
                                                            onChange={(e) => setMetadata({ ...metadata, option_b: e.target.value })}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            {questionType === 'likert' && (
                                                <div>
                                                    <Label>Scale Labels (comma-separated)</Label>
                                                    <Input
                                                        value={metadata.labels?.join(', ') || ''}
                                                        onChange={(e) => setMetadata({
                                                            ...metadata,
                                                            labels: e.target.value.split(',').map(s => s.trim()),
                                                        })}
                                                        placeholder="Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {questionType === 'number' && (
                                        <div>
                                            <Label>Unit (e.g., Billions of KRW, Years, etc.)</Label>
                                            <Input
                                                value={metadata.unit || ''}
                                                onChange={(e) => setMetadata({ ...metadata, unit: e.target.value })}
                                                placeholder="Billions of KRW"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <Label>Order</Label>
                                        <Input
                                            type="number"
                                            value={data.order}
                                            onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                            min="0"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Active
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/admin/questions/ceo')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Create Question
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
