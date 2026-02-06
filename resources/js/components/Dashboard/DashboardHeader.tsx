import { Link } from '@inertiajs/react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

interface BreadcrumbItem {
    title: string;
    href?: string;
}

interface DashboardHeaderProps {
    title: string;
    subtitle: string;
    userName?: string;
    breadcrumbs?: BreadcrumbItem[];
}

export default function DashboardHeader({ title, subtitle, userName, breadcrumbs }: DashboardHeaderProps) {
    return (
        <div className="space-y-4">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/dashboard" className="flex items-center gap-1.5">
                                    <Home className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {breadcrumbs.map((item, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            return (
                                <div key={index} className="flex items-center gap-1.5">
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>{item.title}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link href={item.href || '#'}>{item.title}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </div>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
            
            {/* Header Content */}
            <div>
                <h1 className="text-4xl font-display font-bold tracking-tight">
                    {userName ? `Welcome back, ${userName}` : title}
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}
