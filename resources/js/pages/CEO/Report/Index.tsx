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
}

export default function CeoReportIndex({
    project,
    stepStatuses,
    projectId,
    reportUploads = [],
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
        if (!latestUpload) {
            setShowMissingReportDialog(true);
            return;
        }
        window.open(
            `/ceo/report/${projectId}/upload/${latestUpload.id}/download`,
            '_blank',
        );
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-muted/20 to-background">
                    <Head
                        title={`${t('ceo_report_details.report')} - ${project.company.name}`}
                    />
                    <div className="mx-auto max-w-[760px] space-y-4 px-6 py-12 md:px-8 md:py-12">
                        <div className="mb-6">
                            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#4F8EF7] uppercase">
                                {t('ceo_report_details.for_hr')}
                            </p>
                            <h1 className="mt-2 font-serif text-[28px] leading-[1.2] font-normal text-[#1A1744]">
                                {t('ceo_report_details.consultant_report')}
                            </h1>
                            <p className="mt-[6px] text-[13px] text-[#6b6a66]">
                                {project.company.name} ·{' '}
                                {t('ceo_report_details.hr_system_design')}
                            </p>
                        </div>

                        <Card className="rounded-xl border border-l-[3px] border-[#eeede9] border-l-[#1A1744] bg-[#fafaf8] shadow-sm">
                            <CardContent className="px-8 py-7">
                                <p className="mb-3 text-[11px] font-semibold tracking-[0.10em] text-[#aaa9a3] uppercase">
                                    {t(
                                        'ceo_report_details.completion_notification',
                                    )}
                                </p>
                                <p className="text-[14px] leading-[1.75] text-[#2e2e2c]">
                                    {t(
                                        'ceo_report_details.initial_hr_complete',
                                        { company: project.company.name },
                                    )}
                                </p>
                                <p className="mt-[10px] text-[14px] leading-[1.75] text-[#2e2e2c]">
                                    {t('ceo_report_details.email_notice', {
                                        company: project.company.name,
                                    })}
                                </p>
                                <p className="mt-[10px] text-[14px] leading-[1.75] text-[#2e2e2c]">
                                    {t('ceo_report_details.review_link')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-[#eeede9] shadow-sm">
                            <CardContent className="px-8 py-7">
                                <p className="mb-5 text-[11px] font-semibold tracking-[0.10em] text-[#aaa9a3] uppercase">
                                    {t('ceo_report_details.consultant_status')}
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
                                                                ? 'bg-[#3d3880]'
                                                                : 'bg-[#eeede9]'
                                                        }`}
                                                    />
                                                )}
                                                <div
                                                    className={`relative z-10 mx-auto flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                                                        done
                                                            ? 'border-[#1A1744] bg-[#1A1744] text-white'
                                                            : active
                                                              ? 'border-[#4F8EF7] bg-[#4F8EF7] text-white shadow-[0_0_0_4px_rgba(79,142,247,0.18)]'
                                                              : 'border-[#eeede9] bg-[#eeede9] text-[#aaa9a3]'
                                                    }`}
                                                >
                                                    {done ? (
                                                        <Check className="h-3 w-3" />
                                                    ) : (
                                                        i
                                                    )}
                                                </div>
                                                <p
                                                    className={`mt-2 text-[11px] leading-[1.4] ${active ? 'font-semibold text-[#4F8EF7]' : done ? 'font-medium text-[#1A1744]' : 'text-[#aaa9a3]'}`}
                                                >
                                                    {i === 1 &&
                                                        t(
                                                            'ceo_report_details.step_1',
                                                        )}
                                                    {i === 2 &&
                                                        t(
                                                            'ceo_report_details.step_2',
                                                        )}
                                                    {i === 3 &&
                                                        t(
                                                            'ceo_report_details.step_3',
                                                        )}
                                                    {i === 4 &&
                                                        t(
                                                            'ceo_report_details.step_4',
                                                        )}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-[#eeede9] shadow-sm">
                            <CardContent className="px-8 py-7">
                                <p className="mb-3 text-[11px] font-semibold tracking-[0.10em] text-[#aaa9a3] uppercase">
                                    {t('ceo_report_details.consultant_comment')}{' '}
                                    <span className="font-normal tracking-normal normal-case">
                                        {t('ceo_report_details.no_comment_yet')}
                                    </span>
                                </p>
                                <div className="min-h-[90px] rounded-lg border border-[#eeede9] bg-[#f8f8f6] px-[18px] py-4 text-[14px] leading-[1.7] text-[#aaa9a3] italic">
                                    {t('ceo_report_details.no_comment_yet')}
                                </div>
                                <hr className="my-5 border-[#eeede9]" />
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        variant="outline"
                                        className="h-10 rounded-lg border-[1.5px] border-[#eeede9] px-5 text-[#2e2e2c] hover:border-[#1A1744] hover:text-[#1A1744]"
                                        onClick={openOrWarn}
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        {t('ceo_report_details.view_report')}
                                    </Button>
                                    <Button
                                        className="h-10 rounded-lg bg-[#1A1744] px-5 text-white hover:bg-[#2a2660]"
                                        onClick={openOrWarn}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        {t(
                                            'ceo_report_details.download_report',
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-[#eeede9] shadow-sm">
                            <CardContent className="px-8 py-7">
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        variant="outline"
                                        className="h-10 rounded-lg border-[1.5px] border-[#eeede9] px-5 text-[#2e2e2c]"
                                        onClick={() =>
                                            setShowContactDialog(true)
                                        }
                                    >
                                        <List className="mr-2 h-4 w-4" />
                                        {t(
                                            'ceo_report_details.contact_before_final',
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-10 rounded-lg border-[1.5px] border-[#fca5a5] px-5 text-[#b91c1c] hover:bg-[#fff5f5] hover:text-[#991b1b]"
                                        onClick={() =>
                                            setShowFinalConfirmDialog(true)
                                        }
                                    >
                                        <OctagonAlert className="mr-2 h-4 w-4" />
                                        {t(
                                            'ceo_report_details.final_confirmation',
                                        )}
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
                            {t('ceo_report_details.report_not_uploaded')}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-sm leading-6 text-[#4b5563]">
                            {t('ceo_report_details.report_not_uploaded_desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => setShowMissingReportDialog(false)}
                        >
                            {t('ceo_report_details.ok')}
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
                            {t('ceo_report_details.contact_consultant')}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-sm leading-6 text-[#4b5563]">
                            {t('ceo_report_details.contact_consultant_desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowContactDialog(false)}>
                            {t('ceo_report_details.ok')}
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
                        <DialogTitle className="flex items-center gap-2 text-[#1A1744]">
                            <OctagonAlert className="h-5 w-5 text-[#dc2626]" />
                            {t('ceo_report_details.proceed_final')}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-sm leading-6 text-[#4b5563]">
                            {t('ceo_report_details.proceed_final_desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowFinalConfirmDialog(false)}
                        >
                            {t('ceo_report_details.cancel')}
                        </Button>
                        <Button
                            className="bg-[#dc2626] hover:bg-[#b91c1c]"
                            onClick={() => setShowFinalConfirmDialog(false)}
                        >
                            {t('ceo_report_details.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
