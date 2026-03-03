import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuidanceContent {
    concept?: string;
    key_characteristics?: string;
    example?: string;
    pros?: string;
    cons?: string;
    best_fit_organizations?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    content: GuidanceContent | null;
    title?: string;
}

export default function RightSidePanel({ isOpen, onClose, content, title = 'Guidance' }: Props) {
    if (!isOpen || !content) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 bg-black/50 z-40 transition-opacity',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={cn(
                    'fixed top-0 right-0 h-full w-full max-w-lg bg-background shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <Card className="h-full rounded-none border-0 shadow-none">
                    <CardHeader className="sticky top-0 bg-background border-b z-10 flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-xl font-bold">{title}</CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {content.concept && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-primary">Concept</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {content.concept}
                                </p>
                            </div>
                        )}

                        {content.key_characteristics && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-primary">Key Characteristics</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {content.key_characteristics}
                                </p>
                            </div>
                        )}

                        {content.example && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-primary">Example</h3>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                        {content.example}
                                    </p>
                                </div>
                            </div>
                        )}

                        {(content.pros || content.cons) && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-primary">Pros & Cons</h3>
                                <div className="space-y-3">
                                    {content.pros && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-green-700 mb-1">Advantages</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {content.pros}
                                            </p>
                                        </div>
                                    )}
                                    {content.cons && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-red-700 mb-1">Potential Drawbacks</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {content.cons}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {content.best_fit_organizations && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-primary">Best Fit Organizations</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {content.best_fit_organizations}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
