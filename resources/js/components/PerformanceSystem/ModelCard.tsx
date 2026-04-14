import { GripVertical, Info } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GuidanceContent {
    concept?: string;
    key_characteristics?: string;
    example?: string;
    pros?: string;
    cons?: string;
    best_fit_organizations?: string;
    recommended_job_keyword_ids?: number[];
}

interface Props {
    modelType: 'mbo' | 'bsc' | 'okr';
    title: string;
    concept: string;
    keyCharacteristics: string;
    example: string;
    recommendedJobs: string[];
    assignedJobs: Array<{ id: number; name: string }>;
    onDrop: (jobId: number) => void;
    onClick: () => void;
    guidance?: GuidanceContent;
}

export default function ModelCard({
    modelType,
    title,
    concept,
    keyCharacteristics,
    example,
    recommendedJobs,
    assignedJobs,
    onDrop,
    onClick,
    guidance,
}: Props) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const jobId = parseInt(e.dataTransfer.getData('jobId'));
        if (jobId) {
            onDrop(jobId);
        }
    };

    return (
        <Card
            className={cn(
                'h-full transition-all cursor-pointer',
                isDragOver ? 'border-primary border-4 bg-primary/5' : 'border-2 hover:border-primary/50'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={onClick}
        >
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b-2">
                <div className="flex items-center justify-between flex-wrap">
                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                    <Info className="w-5 h-5 text-primary cursor-pointer hover:text-primary/80" />
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div>
                    <h4 className="text-sm font-semibold mb-2">Concept</h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">{concept}</p>
                </div>
                
                <div>
                    <h4 className="text-sm font-semibold mb-2">Recommended Job Types</h4>
                    <div className="flex flex-wrap gap-1">
                        {recommendedJobs.slice(0, 3).map((job, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                                {job}
                            </Badge>
                        ))}
                        {recommendedJobs.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                                +{recommendedJobs.length - 3} more
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2">Assigned Jobs</h4>
                    {assignedJobs.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Drop jobs here or use dropdown</p>
                    ) : (
                        <div className="space-y-1">
                            {assignedJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs"
                                >
                                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                                    <span>{job.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
