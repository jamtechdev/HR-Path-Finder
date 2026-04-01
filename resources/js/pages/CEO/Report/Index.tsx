import { Head } from '@inertiajs/react';
import { AlertCircle, Check, Download, Eye, List, OctagonAlert } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';

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
    const [showMissingReportDialog, setShowMissingReportDialog] = useState(false);
    const [showFinalConfirmDialog, setShowFinalConfirmDialog] = useState(false);
    const [showContactDialog, setShowContactDialog] = useState(false);

    const isCompleted = (status: string) =>
        ['submitted', 'approved', 'locked', 'completed'].includes(status);
    const allMainDone =
        isCompleted(stepStatuses.diagnosis || 'not_started') &&
        isCompleted(stepStatuses.job_analysis || 'not_started') &&
        isCompleted(stepStatuses.performance || 'not_started') &&
        isCompleted(stepStatuses.compensation || 'not_started');

    const latestUpload = useMemo(() => reportUploads[0] ?? null, [reportUploads]);
    const hasConsultantReport = Boolean(latestUpload);
    const statusStep = hasConsultantReport ? 4 : allMainDone ? 2 : 1;

    const openOrWarn = () => {
        if (!latestUpload) {
            setShowMissingReportDialog(true);
            return;
        }
        window.open(`/ceo/report/${projectId}/upload/${latestUpload.id}/download`, '_blank');
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden bg-background">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-muted/20 to-background">
                    <Head title={`Report - ${project.company.name}`} />
                    <div className="px-6 py-12 md:px-8 md:py-12 max-w-[760px] mx-auto space-y-4">
                        <div className="mb-6">
                            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#4F8EF7]">
                                For HR Manager · CEO
                            </p>
                            <h1 className="text-[28px] leading-[1.2] font-serif font-normal text-[#1A1744] mt-2">Consultant Report</h1>
                            <p className="text-[13px] text-[#6b6a66] mt-[6px]">
                                {project.company.name} · HR System Design
                            </p>
                        </div>

                        <Card className="rounded-xl border border-[#eeede9] shadow-sm bg-[#fafaf8] border-l-[3px] border-l-[#1A1744]">
                            <CardContent className="px-8 py-7">
                                <p className="text-[11px] font-semibold tracking-[0.10em] uppercase text-[#aaa9a3] mb-3">
                                    Completion Notification
                                </p>
                                <p className="text-[14px] leading-[1.75] text-[#2e2e2c]">
                                    The initial HR system design for <strong>{project.company.name}</strong> has
                                    been completed.
                                </p>
                                <p className="text-[14px] leading-[1.75] text-[#2e2e2c] mt-[10px]">
                                    Once the consultant review and final report upload are finished, a separate
                                    email notification will be sent to the HR Manager of {project.company.name}.
                                </p>
                                <p className="text-[14px] leading-[1.75] text-[#2e2e2c] mt-[10px]">
                                    Please use the link provided in the email to review the report and decide
                                    whether to request revisions or proceed with final confirmation.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-[#eeede9] shadow-sm">
                            <CardContent className="px-8 py-7">
                                <p className="text-[11px] font-semibold tracking-[0.10em] uppercase text-[#aaa9a3] mb-5">
                                    Consultant Review Status
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
                                                            done || active ? 'bg-[#3d3880]' : 'bg-[#eeede9]'
                                                        }`}
                                                    />
                                                )}
                                                <div
                                                    className={`relative z-10 mx-auto w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${
                                                        done
                                                            ? 'bg-[#1A1744] border-[#1A1744] text-white'
                                                            : active
                                                              ? 'bg-[#4F8EF7] border-[#4F8EF7] text-white shadow-[0_0_0_4px_rgba(79,142,247,0.18)]'
                                                              : 'bg-[#eeede9] border-[#eeede9] text-[#aaa9a3]'
                                                    }`}
                                                >
                                                    {done ? <Check className="w-3 h-3" /> : i}
                                                </div>
                                                <p className={`mt-2 text-[11px] leading-[1.4] ${active ? 'text-[#4F8EF7] font-semibold' : done ? 'text-[#1A1744] font-medium' : 'text-[#aaa9a3]'}`}>
                                                    {i === 1 && <>Client Draft<br />Review Complete</>}
                                                    {i === 2 && <>Comment Review<br />In Progress</>}
                                                    {i === 3 && <>Report Preparation<br />In Progress</>}
                                                    {i === 4 && <>Report<br />Finalized</>}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-[#eeede9] shadow-sm">
                            <CardContent className="px-8 py-7">
                                <p className="text-[11px] font-semibold tracking-[0.10em] uppercase text-[#aaa9a3] mb-3">
                                    Consultant Brief Comment <span className="normal-case tracking-normal font-normal">(by admin)</span>
                                </p>
                                <div className="rounded-lg border border-[#eeede9] bg-[#f8f8f6] min-h-[90px] px-[18px] py-4 text-[14px] leading-[1.7] text-[#aaa9a3] italic">
                                    No comment has been added yet.
                                </div>
                                <hr className="my-5 border-[#eeede9]" />
                                <div className="flex gap-3 flex-wrap">
                                    <Button variant="outline" className="h-10 px-5 rounded-lg border-[1.5px] border-[#eeede9] text-[#2e2e2c] hover:border-[#1A1744] hover:text-[#1A1744]" onClick={openOrWarn}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Report
                                    </Button>
                                    <Button className="h-10 px-5 rounded-lg bg-[#1A1744] hover:bg-[#2a2660] text-white" onClick={openOrWarn}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Report
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-[#eeede9] shadow-sm">
                            <CardContent className="px-8 py-7">
                                <div className="flex gap-3 flex-wrap">
                                    <Button variant="outline" className="h-10 px-5 rounded-lg border-[1.5px] border-[#eeede9] text-[#2e2e2c]" onClick={() => setShowContactDialog(true)}>
                                        <List className="w-4 h-4 mr-2" />
                                        Contact Consultant Before Final Confirmation
                                    </Button>
                                    <Button variant="outline" className="h-10 px-5 rounded-lg border-[1.5px] border-[#fca5a5] text-[#b91c1c] hover:bg-[#fff5f5] hover:text-[#991b1b]" onClick={() => setShowFinalConfirmDialog(true)}>
                                        <OctagonAlert className="w-4 h-4 mr-2" />
                                        Final Confirmation
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>

            <Dialog open={showMissingReportDialog} onOpenChange={setShowMissingReportDialog}>
                <DialogContent className="sm:max-w-[520px] rounded-[14px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Report Not Uploaded Yet
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-[#4b5563] pt-2">
                            A consultant is reviewing your company&apos;s entire design draft and writing a report.
                            An alarm email will be sent to the HR manager upon completion, so please refer to this.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowMissingReportDialog(false)}>OK</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                <DialogContent className="sm:max-w-[520px] rounded-[14px]">
                    <DialogHeader>
                        <DialogTitle>Contact Consultant</DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-[#4b5563] pt-2">
                            Please contact your consultant or admin team for revision requests before final confirmation.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowContactDialog(false)}>OK</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showFinalConfirmDialog} onOpenChange={setShowFinalConfirmDialog}>
                <DialogContent className="sm:max-w-[560px] rounded-[14px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#1A1744]">
                            <OctagonAlert className="w-5 h-5 text-[#dc2626]" />
                            Proceed with Final Confirmation?
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-[#4b5563] pt-2">
                            Once you proceed with final confirmation, the current HR system will be officially established,
                            and further modifications or consultant review will no longer be available.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFinalConfirmDialog(false)}>Cancel</Button>
                        <Button className="bg-[#dc2626] hover:bg-[#b91c1c]" onClick={() => setShowFinalConfirmDialog(false)}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
