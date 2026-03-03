import React from 'react';
import ChartGallery from './ChartGallery';

interface OrgChartsTabProps {
    organizationalCharts?: Record<string, string>;
}

export default function OrgChartsTab({ organizationalCharts }: OrgChartsTabProps) {
    if (!organizationalCharts || Object.keys(organizationalCharts).length === 0) {
        return (
            <div className="p-12 text-center border-2 border-dashed rounded-lg bg-muted/30">
                <p className="text-muted-foreground">No organizational charts uploaded.</p>
            </div>
        );
    }

    return <ChartGallery charts={organizationalCharts} title="Organizational Charts" />;
}
