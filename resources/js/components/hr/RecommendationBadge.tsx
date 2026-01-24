import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface RecommendationBadgeProps {
    recommended?: boolean;
    className?: string;
}

export function RecommendationBadge({ recommended, className }: RecommendationBadgeProps) {
    if (!recommended) {
        return null;
    }

    return (
        <Badge variant="secondary" className={className}>
            <Sparkles className="mr-1 size-3" />
            Recommended
        </Badge>
    );
}
