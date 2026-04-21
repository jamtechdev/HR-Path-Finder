import { Link } from '@inertiajs/react';
import { Home } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
                                    <span>{t('navigation.dashboard', 'Dashboard')}</span>
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
    <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">
                    {userName ? t('dashboard_header.welcome_back', { name: userName, defaultValue: `Welcome back, ${userName}` }) : title}
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}
