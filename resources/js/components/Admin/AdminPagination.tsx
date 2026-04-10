import { Link } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AdminPaginationProps {
    links?: PaginationLink[];
    className?: string;
}

export default function AdminPagination({
    links = [],
    className = '',
}: AdminPaginationProps) {
    if (!links || links.length <= 1) return null;

    return (
        <div className={`mt-4 flex flex-wrap justify-center gap-2 border-t pt-4 ${className}`}>
            {links.map((link, i) => (
                <Link
                    key={i}
                    href={link.url || '#'}
                    className={
                        link.active
                            ? 'rounded border bg-primary px-3 py-1 text-primary-foreground'
                            : 'rounded border px-3 py-1 hover:bg-muted'
                    }
                >
                    {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                </Link>
            ))}
        </div>
    );
}
