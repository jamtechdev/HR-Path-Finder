import { History } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ReviewLog {
    id: number;
    field_name: string;
    original_value: string;
    modified_value: string;
    created_at: string;
    modifier: {
        name: string;
    };
}

interface ChangeHistoryTabProps {
    reviewLogs: ReviewLog[];
}

export default function ChangeHistoryTab({ reviewLogs }: ChangeHistoryTabProps) {
    return (
        <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Change History
                </CardTitle>
                <CardDescription>
                    All modifications made during CEO review are logged here.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                {reviewLogs.length === 0 ? (
                    <div className="text-center py-12">
                        <History className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">No changes recorded yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviewLogs.map((log) => (
                            <div key={log.id} className="p-5 border-2 border-border rounded-lg hover:border-primary/40 transition-colors bg-card shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-semibold text-base">{log.field_name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Modified by <span className="font-medium">{log.modifier.name}</span> on {new Date(log.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase">Original:</p>
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg break-words">
                                            <p className="text-sm">{log.original_value || '(empty)'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase">Modified:</p>
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg break-words">
                                            <p className="text-sm">{log.modified_value || '(empty)'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
