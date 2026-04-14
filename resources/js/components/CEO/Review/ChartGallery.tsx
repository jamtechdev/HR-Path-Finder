import { X, ZoomIn, FileText } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ChartGalleryProps {
    charts: Record<string, string>;
    title?: string;
    showTitle?: boolean;
}

export default function ChartGallery({ charts, title = 'Reference Charts', showTitle = true }: ChartGalleryProps) {
    const [selectedChart, setSelectedChart] = useState<{ year: string; url: string } | null>(null);
    const chartEntries = Object.entries(charts || {});

    if (chartEntries.length === 0) {
        return null;
    }

    const getChartUrl = (path: string): string => {
        if (path.startsWith('/') || path.startsWith('http')) {
            return path;
        }
        return `/storage/${path}`;
    };

    const isImage = (path: string): boolean => {
        return /\.(png|jpg|jpeg|gif|webp)$/i.test(path);
    };

    const isPdf = (path: string): boolean => {
        return /\.pdf$/i.test(path);
    };

    return (
        <>
            <Card className="shadow-md">
                {showTitle && (
                    <CardHeader>
                        <CardTitle className="text-lg">{title}</CardTitle>
                    </CardHeader>
                )}
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {chartEntries.map(([year, path]) => {
                            const chartUrl = getChartUrl(path);
                            const isImg = isImage(path);
                            const isPdfFile = isPdf(path);

                            return (
                                <div
                                    key={year}
                                    className="group relative border-2 border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all cursor-pointer bg-muted/30"
                                    onClick={() => setSelectedChart({ year, url: chartUrl })}
                                >
                                    <div className="aspect-video relative bg-white flex items-center justify-center">
                                        {isImg ? (
                                            <>
                                                <img
                                                    src={chartUrl}
                                                    alt={`Organizational chart ${year}`}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
                                                </div>
                                            </>
                                        ) : isPdfFile ? (
                                            <div className="flex flex-col items-center justify-center p-4">
                                                <FileText className="w-12 h-12 text-muted-foreground mb-2" />
                                                <span className="text-xs text-muted-foreground">PDF Document</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-4">
                                                <FileText className="w-12 h-12 text-muted-foreground mb-2" />
                                                <span className="text-xs text-muted-foreground">View File</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 bg-background border-t">
                                        <p className="text-sm font-semibold text-center">{year}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Modal for full-size view */}
            <Dialog open={!!selectedChart} onOpenChange={() => setSelectedChart(null)}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between flex-wrap">
                            <span>Organizational Chart - {selectedChart?.year}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedChart(null)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        {selectedChart && (
                            <>
                                {isImage(selectedChart.url) ? (
                                    <img
                                        src={selectedChart.url}
                                        alt={`Organizational chart ${selectedChart.year}`}
                                        className="w-full h-auto rounded-lg border"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-chart.png';
                                        }}
                                    />
                                ) : isPdf(selectedChart.url) ? (
                                    <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/30">
                                        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground mb-4">PDF Document</p>
                                        <Button asChild>
                                            <a href={selectedChart.url} target="_blank" rel="noopener noreferrer">
                                                Open PDF in New Tab
                                            </a>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/30">
                                        <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                                        <Button asChild>
                                            <a href={selectedChart.url} target="_blank" rel="noopener noreferrer">
                                                View File
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
