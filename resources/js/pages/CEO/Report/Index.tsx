import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    Check,
    Download,
    Eye,
    List,
    OctagonAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import i18n translation hook

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    stepStatuses: Record<string, string>;
    projectId: number;
    reportUploads?: Array<{
        id: number;
        original_name?: string | null;
        created_at?: string;
    }>;
    adminComment?: {
        comment?: string | null;
        author?: string | null;
        updated_at?: string | null;
    } | null;
}

export default function CeoReportIndex({
    project,
    stepStatuses,
    projectId,
    reportUploads = [],
    adminComment,
}: Props) {
    const { t } = useTranslation(); // Use the translation hook
    const [showMissingReportDialog, setShowMissingReportDialog] =
        useState(false);
    const [showFinalConfirmDialog, setShowFinalConfirmDialog] = useState(false);
    const [showContactDialog, setShowContactDialog] = useState(false);

    const isCompleted = (status: string) =>
        ['submitted', 'approved', 'locked', 'completed'].includes(status);
    const allMainDone =
        isCompleted(stepStatuses.diagnosis || 'not_started') &&
        isCompleted(stepStatuses.job_analysis || 'not_started') &&
        isCompleted(stepStatuses.performance || 'not_started') &&
        isCompleted(stepStatuses.compensation || 'not_started');

    const latestUpload = useMemo(
        () => reportUploads[0] ?? null,
        [reportUploads],
    );
    const hasConsultantReport = Boolean(latestUpload);
    const statusStep = hasConsultantReport ? 4 : allMainDone ? 2 : 1;

    const openOrWarn = () => {
        if (latestUpload) {
            window.open(
                `/ceo/report/${projectId}/upload/${latestUpload.id}/download`,
                '_blank',
            );
            return;
        }
        if (allMainDone) {
            window.open(`/ceo/report/${projectId}/download`, '_blank');
            return;
        }
        setShowMissingReportDialog(true);
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-muted/20 to-background dark:from-[#060d1f] dark:via-[#0a1630] dark:to-[#070f22]">
                    <Head
                        title={t('hr_report.page_title', {
                            company: project.company.name,
                        })}
                    />
                    <div className="mx-auto max-w-[760px] space-y-4 px-6 py-12 md:px-8 md:py-12">
                        <div className="mb-6">
                            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#4F8EF7] dark:text-blue-400 uppercase">
                                {t('hr_report.eyebrow')}
                            </p>
                            <h1 className="mt-2 font-serif text-[28px] leading-[1.2] font-normal text-[#1A1744] dark:text-slate-100">
                                {t('hr_report.title')}
                            </h1>
                            <p className="mt-[6px] text-[13px] text-[#6b6a66] dark:text-slate-400">
                                {project.company.name} ·{' '}
                                HR System Design
                            </p>
                        </div>

                        <Card className="rounded-xl border border-l-[3px] border-[#eeede9] dark:border-slate-700 border-l-[#1A1744] dark:border-l-[#9fb3d9] bg-[#fafaf8] dark:bg-[#0b1a34]/95 shadow-sm dark:shadow-[0_12px_28px_rgba(2,8,24,0.45)]">
                            <CardContent className="px-8 py-7">
                                <p className="mb-3 text-[11px] font-semibold tracking-[0.10em] text-[#aaa9a3] dark:text-slate-400 uppercase">
                                    {t('hr_report.completion.title')}
                                </p>
                                <p className="text-[14px] leading-[1.75] text-[#2e2e2c] dark:text-slate-200">
                                    {t('hr_report.completion.line1_prefix')}{' '}
                                    <strong>{project.company.name}</strong>{' '}
                                    {t('hr_report.completion.line1_suffix')}
                                </p>
                                <p className="mt-[10px] text-[14px] leading-[1.75] text-[#2e2e2c] dark:text-slate-200">
                                    {t('hr_report.completion.line2', {
                                        company: project.company.name,
                                    })}
                                </p>
                                <p className="mt-[10px] text-[14px] leading-[1.75] text-[#2e2e2c] dark:text-slate-200">
                                    {t('hr_report.completion.line3')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-[#eeede9] dark:border-slate-700 bg-white dark:bg-[#0b1a34]/95 shadow-sm dark:shadow-[0_12px_28px_rgba(2,8,24,0.45)]">
                            <CardContent className="px-8 py-7">
                                <p className="mb-5 text-[11px] font-semibold tracking-[0.10em] text-[#aaa9a3] dark:text-slate-400 uppercase">
                                    {t('hr_report.review_status.title')}
                                </p>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4].map((i) => {
                                        const done = i < statusStep;
                                        const active = i === statusStep;
                                        return (
                                            <div
                                                key={i}
                                                className="relative text-center"
                                            >
                                                {i < 4 && (
                                                    <div
                                                        className={`absolute top-[14px] left-1/2 h-[2px] w-full ${
                                                            done || active
                                                                ? 'bg-[#3d3880] dark:bg-slate-500'
                                                                : 'bg-[#eeede9] dark:bg-slate-700'
                                                        }`}
                                                    />
                                                )}
                                                <div
                                                    className={`relative z-10 mx-auto flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                                                        done
                                                            ? 'border-[#1A1744] bg-[#1A1744] text-white'
                                                            : active
                                                              ? 'border-[#4F8EF7] bg-[#4F8EF7] text-white shadow-[0_0_0_4px_rgba(79,142,247,0.18)] dark:shadow-[0_0_0_4px_rgba(59,130,246,0.2)]'
                                                              : 'border-[#eeede9] bg-[#eeede9] text-[#aaa9a3] dark:border-slate-700 dark:bg-slate-700 dark:text-slate-400'
                                                    }`}
                                                >
                                                    {done ? (
                                                        <Check className="h-3 w-3" />
                                                    ) : (
                                                        i
                                                    )}
                                                </div>
                                                <p
                                                    className={`mt-2 text-[11px] leading-[1.4] ${active ? 'font-semibold text-[#4F8EF7] dark:text-blue-400' : done ? 'font-medium text-[#1A1744] dark:text-slate-200' : 'text-[#aaa9a3] dark:text-slate-400'}`}
                                                >
                                                    {i === 1 && (
                                                        <>
                                                            {t('hr_report.review_status.step1_line1')}
                                                            <br />
                                                            {t('hr_report.review_status.step1_line2')}
                                                        </>
                                                    )}
                                                    {i === 2 && (
                                                        <>
                                                            {t('hr_report.review_status.step2_line1')}
                                                            <br />
                                                            {t('hr_report.review_status.step2_line2')}
                                                        </>
                                                    )}
                                                    {i === 3 && (
                                                        <>
                                                            {t('hr_report.review_status.step3_line1')}
                                                            <br />
                                                            {t('hr_report.review_status.step3_line2')}
                                                        </>
                                                    )}
                                                    {i === 4 && (
                                                        <>
                                                            {t('hr_report.review_status.step4_line1')}
                                                            <br />
                                                            {t('hr_report.review_status.step4_line2')}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-[#eeede9] dark:border-slate-700 bg-white dark:bg-[#0b1a34]/95 shadow-sm dark:shadow-[0_12px_28px_rgba(2,8,24,0.45)]">
                            <CardContent className="px-8 py-7">
                                <p className="mb-3 text-[11px] font-semibold tracking-[0.10em] text-[#aaa9a3] dark:text-slate-400 uppercase">
                                    {t('hr_report.comment.title')}{' '}
                                    <span className="font-normal tracking-normal normal-case">
                                        {t('hr_report.comment.by_admin')}
                                    </span>
                                </p>
                                <div className="min-h-[90px] rounded-lg border border-[#eeede9] dark:border-slate-700 bg-[#f8f8f6] dark:bg-[#101f3d] px-[18px] py-4 text-[14px] leading-[1.7] text-[#2e2e2c] dark:text-slate-200">
                                    {adminComment?.comment?.trim() || t('hr_report.comment.empty')}
                                </div>
                                {adminComment?.author && (
                                    <p className="mt-2 text-xs text-[#6b6a66] dark:text-slate-400">
                                        {adminComment.author}
                                        {adminComment.updated_at
                                            ? ` · ${new Date(adminComment.updated_at).toLocaleString()}`
                                            : ''}
                                    </p>
                                )}
                                <hr className="my-5 border-[#eeede9] dark:border-slate-700" />
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        variant="outline"
                                        className="h-10 rounded-lg border-[1.5px] border-[#eeede9] dark:border-slate-600 px-5 text-[#2e2e2c] dark:text-slate-200 hover:border-[#1A1744] dark:hover:border-slate-300 hover:text-[#1A1744] dark:hover:text-white"
                                        onClick={openOrWarn}
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        {t('hr_report.actions.view_report')}
                                    </Button>
                                    <Button
                                        className="h-10 rounded-lg bg-[#1A1744] dark:bg-gradient-to-r dark:from-blue-500 dark:to-indigo-500 dark:text-white px-5 text-white hover:bg-[#2a2660] dark:hover:from-blue-400 dark:hover:to-indigo-400"
                                        onClick={openOrWarn}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        {t('hr_report.actions.download_report')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-[#eeede9] dark:border-slate-700 bg-white dark:bg-[#0b1a34]/95 shadow-sm dark:shadow-[0_12px_28px_rgba(2,8,24,0.45)]">
                            <CardContent className="px-8 py-7">
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        variant="outline"
                                        className="h-10 rounded-lg border-[1.5px] border-[#eeede9] dark:border-slate-600 px-5 text-[#2e2e2c] dark:text-slate-200"
                                        onClick={() =>
                                            setShowContactDialog(true)
                                        }
                                    >
                                        <List className="mr-2 h-4 w-4" />
                                        {t('hr_report.actions.contact_consultant')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-10 rounded-lg border-[1.5px] border-[#fca5a5] dark:border-red-500/50 px-5 text-[#b91c1c] dark:text-red-300 hover:bg-[#fff5f5] dark:hover:bg-red-900/30 hover:text-[#991b1b] dark:hover:text-red-200"
                                        onClick={() =>
                                            setShowFinalConfirmDialog(true)
                                        }
                                    >
                                        <OctagonAlert className="mr-2 h-4 w-4" />
                                        {t('hr_report.actions.final_confirmation')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>

            <Dialog
                open={showMissingReportDialog}
                onOpenChange={setShowMissingReportDialog}
            >
                <DialogContent className="rounded-[14px] sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            {t('hr_report.dialogs.missing_report.title')}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-sm leading-6 text-[#4b5563] dark:text-slate-300">
                            {t('hr_report.dialogs.missing_report.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => setShowMissingReportDialog(false)}
                        >
                            {t('hr_report.dialogs.ok')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showContactDialog}
                onOpenChange={setShowContactDialog}
            >
                <DialogContent className="rounded-[14px] sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>
                            {t('hr_report.dialogs.contact.title')}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-sm leading-6 text-[#4b5563] dark:text-slate-300">
                            {t('hr_report.dialogs.contact.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowContactDialog(false)}>
                            {t('hr_report.dialogs.ok')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showFinalConfirmDialog}
                onOpenChange={setShowFinalConfirmDialog}
            >
                <DialogContent className="rounded-[14px] sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#1A1744] dark:text-slate-100">
                            <OctagonAlert className="h-5 w-5 text-[#dc2626]" />
                            {t('hr_report.dialogs.final_confirm.title')}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-sm leading-6 text-[#4b5563] dark:text-slate-300">
                            {t('hr_report.dialogs.final_confirm.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowFinalConfirmDialog(false)}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            className="bg-[#dc2626] hover:bg-[#b91c1c]"
                            onClick={() => setShowFinalConfirmDialog(false)}
                        >
                            {t('common.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
