import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <Card className="flex flex-col dark:bg-gray-900 dark:border-gray-700">
            <CardHeader>
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-6 text-primary" />
                </div>
                <CardTitle className="text-xl dark:text-white">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-base dark:text-gray-400">{description}</CardDescription>
            </CardContent>
        </Card>
    );
}
