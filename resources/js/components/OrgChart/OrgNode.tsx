import { X } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrgNodeData {
    label: string;
    orgUnitName: string;
    jobKeywordIds: number[];
    orgHead?: {
        name: string;
        rank: string;
        title: string;
        email: string;
    };
    jobSpecialists?: Array<{
        name: string;
        rank: string;
        title: string;
        email: string;
        job_keyword_id: number;
    }>;
    jobDefinitions?: Array<{ id: number; job_name: string; job_keyword_id?: number }>;
}

interface OrgNodeProps extends NodeProps {
    data: OrgNodeData;
    onDataChange?: (nodeId: string, data: Partial<OrgNodeData>) => void;
    readOnly?: boolean;
}

export default function OrgNode({ data, id, onDataChange, readOnly = false }: OrgNodeProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleJobRemove = useCallback(
        (jobKeywordId: number) => {
            if (onDataChange && !readOnly) {
                onDataChange(id, {
                    jobKeywordIds: data.jobKeywordIds.filter((id) => id !== jobKeywordId),
                });
            }
        },
        [id, data.jobKeywordIds, onDataChange, readOnly]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        if (!readOnly) {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(true);
        }
    }, [readOnly]);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        if (readOnly) return;
        
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const jobId = e.dataTransfer.getData('application/job-id');
        if (jobId && onDataChange) {
            const jobKeywordId = parseInt(jobId, 10);
            const jobName = data.jobDefinitions?.find(j => j.job_keyword_id === jobKeywordId)?.job_name || 'Job';
            
            if (!data.jobKeywordIds.includes(jobKeywordId)) {
                onDataChange(id, {
                    jobKeywordIds: [...data.jobKeywordIds, jobKeywordId],
                });
                
                // Visual feedback - briefly highlight the node
                const nodeElement = e.currentTarget as HTMLElement;
                nodeElement.classList.add('animate-pulse');
                setTimeout(() => {
                    nodeElement.classList.remove('animate-pulse');
                }, 1000);
            }
        }
    }, [id, data.jobKeywordIds, data.jobDefinitions, onDataChange, readOnly]);

    const getJobName = (jobKeywordId: number) => {
        const jobDef = data.jobDefinitions?.find((j) => j.job_keyword_id === jobKeywordId);
        return jobDef?.job_name || `Job ${jobKeywordId}`;
    };

    return (
        <div
            className="relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <Handle type="target" position={Position.Top} />
            <Card className={`w-64 shadow-md border-2 transition-all duration-200 ${
                isDragOver 
                    ? 'border-primary bg-primary/20 shadow-lg scale-105 ring-2 ring-primary/50' 
                    : 'border-primary/20 hover:border-primary/40'
            }`}>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold truncate">
                            {data.orgUnitName || data.label}
                        </CardTitle>
                        {!readOnly && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? '−' : '+'}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                {isExpanded && (
                    <CardContent className="pt-0 space-y-2">
                        {data.jobKeywordIds && data.jobKeywordIds.length > 0 ? (
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Assigned Jobs ({data.jobKeywordIds.length}):</p>
                                <div className="flex flex-wrap gap-1">
                                    {data.jobKeywordIds.map((jobKeywordId) => (
                                        <Badge
                                            key={jobKeywordId}
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {getJobName(jobKeywordId)}
                                            {!readOnly && (
                                                <button
                                                    onClick={() => handleJobRemove(jobKeywordId)}
                                                    className="ml-1 hover:text-destructive transition-colors"
                                                    title="Remove job"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-2">
                                <p className="text-xs text-muted-foreground italic">
                                    {!readOnly ? "Drop jobs here to assign them" : "No jobs assigned"}
                                </p>
                            </div>
                        )}
                        {data.orgHead && (
                            <div className="text-xs">
                                <p className="font-medium text-muted-foreground">Head:</p>
                                <p className="truncate">{data.orgHead.name || 'Not assigned'}</p>
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}
