import { Head } from '@inertiajs/react';
import { AlertCircle, Check, Download, Eye, List, OctagonAlert, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';

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

export default function AdminReportIndex({
    project,
    stepStatuses,
    projectId,
    reportUploads = [],
    adminComment,
}: Props) {
    const { t } = useTranslation();
    const [showMissingReportDialog, setShowMissingReportDialog] = useState(false);
    const [showFinalConfirmDialog, setShowFinalConfirmDialog] = useState(false);
    const [showContactDialog, setShowContactDialog] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string>('');

    const isCompleted = (status: string) =>
        ['submitted', 'approved', 'locked', 'completed'].includes(status);
    const allMainDone =
        isCompleted(stepStatuses.diagnosis || 'not_started') &&
        isCompleted(stepStatuses.job_analysis || 'not_started') &&
        isCompleted(stepStatuses.performance || 'not_started') &&
        isCompleted(stepStatuses.compensation || 'not_started');

    const latestUpload = useMemo(() => reportUploads[0] ?? null, [reportUploads]);

    const getReportUrl = (type: 'view' | 'download') => {
        if (latestUpload) {
            // uploaded consultant report — only download available
            return `/admin/report/${projectId}/upload/${latestUpload.id}/download`;
        }
        if (allMainDone) {
            return type === 'view'
                ? `/admin/report/${projectId}/view`
                : `/admin/report/${projectId}/download`;
        }
        return null;
    };

    const handleView = () => {
        const url = getReportUrl('view');
        if (!url) {
            setShowMissingReportDialog(true);
            return;
        }
        setPdfUrl(url);
        setShowPdfModal(true);
    };

    const handleDownload = () => {
        const url = getReportUrl('download');
        if (!url) {
            setShowMissingReportDialog(true);
            return;
        }
        window.location.href = url;
    };

    const hasConsultantReport = Boolean(latestUpload);
    const statusStep = hasConsultantReport ? 4 : allMainDone ? 2 : 1;

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-muted/20 to-background">
                    <Head title={t('hr_report.page_title', { company: project.company.name })} />
                    <div className="px-6 py-12 md:px-8 md:py-12 max-w-[760px] mx-auto space-y-4">
                        <div className="mb-6">
                            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#4F8EF7] dark:text-blue-400">
                                {t('hr_report.eyebrow')}
                            </p>
                            <h1 className="text-[28px] leading-[1.2] font-serif font-normal text-[#1A1744] dark:text-slate-100 mt-2">{t('hr_report.title')}</h1>
                            <p className="text-[13px] text-[#6b6a66] dark:text-slate-400 mt-[6px]">
                                {project.company.name} · HR System Design
                            </p>
                        </div>

                        <Card className="rounded-xl border border-[#eeede9] dark:border-slate-700 shadow-sm bg-[#fafaf8] dark:bg-slate-900 border-l-[3px] border-l-[#1A1744] dark:border-l-slate-300">
                            <CardContent className="px-8 py-7">
                                <p className="text-[11px] font-semibold tracking-[0.10em] uppercase text-[#aaa9a3] dark:text-slate-400 mb-3">
                                    {t('hr_report.completion.title')}
                                </p>
                                <p className="text-[14px] leading-[1.75] text-[#2e2e2c] dark:text-slate-200">
                                    {t('hr_report.completion.line1_prefix')} <strong>{project.company.name}</strong> {t('hr_report.completion.line1_suffix')}
                                </p>
                                <p className="text-[14px] leading-[1.75] text-[#2e2e2c] dark:text-slate-200 mt-[10px]">
                                    {t('hr_report.completion.line2', { company: project.company.name })}
                                </p>
                                <p className="text-[14px] leading-[1.75] text-[#2e2e2c] dark:text-slate-200 mt-[10px]">
                                    {t('hr_report.completion.line3')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-[#eeede9] dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
                            <CardContent className="px-8 py-7">
                                <p className="text-[11px] font-semibold tracking-[0.10em] uppercase text-[#aaa9a3] dark:text-slate-400 mb-5">
                                    {t('hr_report.review_status.title')}
                                </p>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4].map((i) => {
                                        const done = i < statusStep;
                                        const active = i === statusStep;
                                        return (
                                            <div key={i} className="text-center relative">
                                                {i < 4 && (
                                                    <div
                                                        className={`absolute top-[14px] left-1/2 w-full h-[2px] ${
                                                            done || active ? 'bg-[#3d3880] dark:bg-slate-500' : 'bg-[#eeede9] dark:bg-slate-700'
                                                        }`}
                                                    />
                                                )}
                                                <div
                                                    className={`relative z-10 mx-auto w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${
                                                        done
                                                            ? 'bg-[#1A1744] border-[#1A1744] text-white'
                                                            : active
                                                              ? 'bg-[#4F8EF7] border-[#4F8EF7] text-white shadow-[0_0_0_4px_rgba(79,142,247,0.18)]'
                                                              : 'bg-[#eeede9] border-[#eeede9] text-[#aaa9a3] dark:bg-slate-700 dark:border-slate-700 dark:text-slate-400'
                                                    }`}
                                                >
                                                    {done ? <Check className="w-3 h-3" /> : i}
                                                </div>
                                                <p className={`mt-2 text-[11px] leading-[1.4] ${active ? 'text-[#4F8EF7] dark:text-blue-400 font-semibold' : done ? 'text-[#1A1744] dark:text-slate-200 font-medium' : 'text-[#aaa9a3] dark:text-slate-400'}`}>
                                                    {i === 1 && <>{t('hr_report.review_status.step1_line1')}<br />{t('hr_report.review_status.step1_line2')}</>}
                                                    {i === 2 && <>{t('hr_report.review_status.step2_line1')}<br />{t('hr_report.review_status.step2_line2')}</>}
                                                    {i === 3 && <>{t('hr_report.review_status.step3_line1')}<br />{t('hr_report.review_status.step3_line2')}</>}
                                                    {i === 4 && <>{t('hr_report.review_status.step4_line1')}<br />{t('hr_report.review_status.step4_line2')}</>}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-[#eeede9] dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
                            <CardContent className="px-8 py-7">
                                <p className="text-[11px] font-semibold tracking-[0.10em] uppercase text-[#aaa9a3] dark:text-slate-400 mb-3">
                                    {t('hr_report.comment.title')} <span className="normal-case tracking-normal font-normal">{t('hr_report.comment.by_admin')}</span>
                                </p>
                                <div className="rounded-lg border border-[#eeede9] dark:border-slate-700 bg-[#f8f8f6] dark:bg-slate-800 min-h-[90px] px-[18px] py-4 text-[14px] leading-[1.7] text-[#2e2e2c] dark:text-slate-200">
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
                                <div className="flex gap-3 flex-wrap">
                                    <Button
                                        variant="outline"
                                        className="h-10 px-5 rounded-lg border-[1.5px] border-[#eeede9] dark:border-slate-600 text-[#2e2e2c] dark:text-slate-200 hover:border-[#1A1744] dark:hover:border-slate-300 hover:text-[#1A1744] dark:hover:text-white"
                                        onClick={handleView}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        {t('hr_report.actions.view_report')}
                                    </Button>
                                    <Button
                                        className="h-10 px-5 rounded-lg bg-[#1A1744] hover:bg-[#2a2660] dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white text-white"
                                        onClick={handleDownload}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        {t('hr_report.actions.download_report')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-[#eeede9] dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
                            <CardContent className="px-8 py-7">
                                <div className="flex gap-3 flex-wrap">
                                    <Button variant="outline" className="h-10 px-5 rounded-lg border-[1.5px] border-[#eeede9] dark:border-slate-600 text-[#2e2e2c] dark:text-slate-200" onClick={() => setShowContactDialog(true)}>
                                        <List className="w-4 h-4 mr-2" />
                                        {t('hr_report.actions.contact_consultant')}
                                    </Button>
                                    <Button variant="outline" className="h-10 px-5 rounded-lg border-[1.5px] border-[#fca5a5] text-[#b91c1c] hover:bg-[#fff5f5] hover:text-[#991b1b]" onClick={() => setShowFinalConfirmDialog(true)}>
                                        <OctagonAlert className="w-4 h-4 mr-2" />
                                        {t('hr_report.actions.final_confirmation')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>

            {/* PDF Preview Modal */}
            {showPdfModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative w-[90vw] h-[90vh] bg-white dark:bg-slate-900 rounded-xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-[#eeede9] dark:border-slate-700 shrink-0">
                            <span className="text-sm font-semibold text-[#1A1744] dark:text-slate-100">
                                {project.company.name} — HR System Report
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    className="h-8 px-4 bg-[#1A1744] hover:bg-[#2a2660] text-white text-xs"
                                    onClick={handleDownload}
                                >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download
                                </Button>
                                <button
                                    onClick={() => setShowPdfModal(false)}
                                    className="p-1.5 rounded-lg hover:bg-[#f3f3f0] dark:hover:bg-slate-700 text-[#6b6a66] dark:text-slate-400"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <iframe
                            src={pdfUrl}
                            className="flex-1 w-full border-0"
                            title="HR Report Preview"
                        />
                    </div>
                </div>
            )}

            <Dialog open={showMissingReportDialog} onOpenChange={setShowMissingReportDialog}>
                <DialogContent className="sm:max-w-[520px] rounded-[14px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            {t('hr_report.dialogs.missing_report.title')}
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-[#4b5563] dark:text-slate-300 pt-2">
                            {t('hr_report.dialogs.missing_report.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowMissingReportDialog(false)}>{t('hr_report.dialogs.ok')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                <DialogContent className="sm:max-w-[520px] rounded-[14px]">
                    <DialogHeader>
                        <DialogTitle>{t('hr_report.dialogs.contact.title')}</DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-[#4b5563] dark:text-slate-300 pt-2">
                            {t('hr_report.dialogs.contact.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowContactDialog(false)}>{t('hr_report.dialogs.ok')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showFinalConfirmDialog} onOpenChange={setShowFinalConfirmDialog}>
                <DialogContent className="sm:max-w-[560px] rounded-[14px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#1A1744] dark:text-slate-100">
                            <OctagonAlert className="w-5 h-5 text-[#dc2626]" />
                            {t('hr_report.dialogs.final_confirm.title')}
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-[#4b5563] dark:text-slate-300 pt-2">
                            {t('hr_report.dialogs.final_confirm.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFinalConfirmDialog(false)}>{t('common.cancel')}</Button>
                        <Button className="bg-[#dc2626] hover:bg-[#b91c1c]" onClick={() => setShowFinalConfirmDialog(false)}>{t('common.confirm')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
