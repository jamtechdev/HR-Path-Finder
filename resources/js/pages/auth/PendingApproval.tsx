import { Head, Link } from '@inertiajs/react';
import { Clock, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { logout, home } from '@/routes';

export default function PendingApproval() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            </div>
            <div className="w-full max-w-md relative z-10">
                <Head title={t('pending_approval_page.page_title')} />
                <div className="mb-6 text-center">
                    <Link href={home()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        {t('pending_approval_page.back_home')}
                    </Link>
                </div>
                <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/15 mx-auto flex items-center justify-center">
                        <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold font-display">{t('pending_approval_page.heading')}</h1>
                        <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
                            {t('pending_approval_page.description')}
                        </p>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href={logout()} className="no-underline">
                            {t('pending_approval_page.logout')}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
