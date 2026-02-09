import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface RecommendationBadgeProps {
    className?: string;
}

export default function RecommendationBadge({ className }: RecommendationBadgeProps) {
    return (
        <Badge className={`bg-success text-white gap-1 ${className}`}>
            <Sparkles className="w-3 h-3" />
            Recommended
        </Badge>
    );
}
