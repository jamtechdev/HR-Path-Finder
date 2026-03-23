import { X } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface OptionGuidance {
    concept?: string;
    keyCharacteristics?: string[];
    example?: string;
    pros?: string[];
    cons?: string[];
    bestFitOrganizations?: string[];
}

interface RightSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    optionName?: string;
    guidance?: OptionGuidance;
}

export default function RightSidePanel({
    isOpen,
    onClose,
    optionName,
    guidance,
}: RightSidePanelProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto border-l">
            <Card className="h-full rounded-none border-0 shadow-none">
                <CardHeader className="sticky top-0 bg-white z-10 border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{optionName || 'Option Details'}</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    {guidance?.concept && (
                        <div>
                            <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
                                Concept
                            </h3>
                            <p className="text-sm leading-relaxed">{guidance.concept}</p>
                        </div>
                    )}

                    {guidance?.keyCharacteristics && guidance.keyCharacteristics.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                                    Key Characteristics
                                </h3>
                                <ul className="space-y-2">
                                    {guidance.keyCharacteristics.map((characteristic, idx) => (
                                        <li key={idx} className="text-sm flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span>{characteristic}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}

                    {guidance?.example && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wide">
                                    Example
                                </h3>
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-sm leading-relaxed whitespace-pre-line">
                                        {guidance.example}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {(guidance?.pros || guidance?.cons) && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                                    Pros & Cons
                                </h3>
                                {guidance.pros && guidance.pros.length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-medium text-sm mb-2 text-green-700">Advantages</h4>
                                        <ul className="space-y-1">
                                            {guidance.pros.map((pro, idx) => (
                                                <li key={idx} className="text-sm flex items-start gap-2 text-green-600">
                                                    <span className="mt-1">✓</span>
                                                    <span>{pro}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {guidance.cons && guidance.cons.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-sm mb-2 text-red-700">Potential Drawbacks</h4>
                                        <ul className="space-y-1">
                                            {guidance.cons.map((con, idx) => (
                                                <li key={idx} className="text-sm flex items-start gap-2 text-red-600">
                                                    <span className="mt-1">✗</span>
                                                    <span>{con}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {guidance?.bestFitOrganizations && guidance.bestFitOrganizations.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                                    Best Fit Organizations
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {guidance.bestFitOrganizations.map((org, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                            {org}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {!guidance && (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">No guidance available for this option.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
