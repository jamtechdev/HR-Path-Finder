import { Head } from '@inertiajs/react';
import { AlertCircle, Check, Download, Eye, List, OctagonAlert } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/AppLayout';

interface HrSystemSnapshot {
    company: {
        name: string;
        industry: string;
        size: number;
    };
    ceo_philosophy: {
        main_trait?: string;
        secondary_trait?: string;
    };
    job_architecture: {
        jobs_defined: number;
    };
    performance_management: {
        model?: string;
        cycle?: string;
        rating_scale?: string;
    };
    compensation_benefits: {
        salary_system?: string;
        salary_increase_process?: string;
        bonus_metric?: string;
        benefits_level?: number;
        welfare_program?: string;
    };
    hr_system_report: {
        status: string;
    };
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    stepStatuses: Record<string, string>;
    projectId: number;
    hrSystemSnapshot: HrSystemSnapshot;
    reportUploads?: Array<{
        id: number;
        original_name?: string | null;
        created_at?: string;
    }>;
}

export default function HrReportIndex({
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
        window.open(
            `/hr-manager/report/${projectId}/upload/${latestUpload.id}/download`,
            '_blank'
        );
    };

    return (
        <AppLayout showWorkflowSteps={true} stepStatuses={stepStatuses} projectId={projectId}>
            <Head title={`Report - ${project.company.name}`} />
            <div className="p-6 md:p-8 max-w-4xl mx-auto bg-background space-y-4">
                <div className="mb-2">
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#4F8EF7]">
                        For HR Manager · CEO
                    </p>
                    <h1 className="text-[44px] leading-tight font-serif text-[#1A1744]">Consultant Report</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {project.company.name} · HR System Design
                    </p>
                </div>

                <Card className="border border-[#eeede9] shadow-sm bg-[#fafaf8]">
                    <CardContent className="p-7">
                        <p className="text-[11px] font-semibold tracking-[0.10em] uppercase text-[#aaa9a3] mb-3">
                            Completion Notification
                        </p>
                        <p className="text-sm leading-7 text-[#2e2e2c]">
                            The initial HR system design for <strong>{project.company.name}</strong> has
                            been completed.
                        </p>
                        <p className="text-sm leading-7 text-[#2e2e2c] mt-2">
                            Once the consultant review and final report upload are finished, a separate
                            email notification will be sent to the HR Manager of {project.company.name}.
                        </p>
                        <p className="text-sm leading-7 text-[#2e2e2c] mt-2">
                            Please use the link provided in the email to review the report and decide
                            whether to request revisions or proceed with final confirmation.
                        </p>
                    </CardContent>
                </div>

                <Card className="border border-[#eeede9] shadow-sm">
                    <CardContent className="p-7">
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
                                        <p className={`mt-2 text-[11px] leading-4 ${active ? 'text-[#4F8EF7] font-semibold' : done ? 'text-[#1A1744] font-medium' : 'text-[#aaa9a3]'}`}>
                                            {i === 1 && (
                                                <>
                                                    Client Draft
                                                    <br />
                                                    Review Complete
                                                </>
                                            )}
                                            {i === 2 && (
                                                <>
                                                    Comment Review
                                                    <br />
                                                    In Progress
                                                </>
                                            )}
                                            {i === 3 && (
                                                <>
                                                    Report Preparation
                                                    <br />
                                                    In Progress
                                                </>
                                            )}
                                            {i === 4 && (
                                                <>
                                                    Report
                                                    <br />
                                                    Finalized
                                                </>
                                            )}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-[#eeede9] shadow-sm">
                    <CardContent className="p-7">
                        <p className="text-[11px] font-semibold tracking-[0.10em] uppercase text-[#aaa9a3] mb-3">
                            Consultant Brief Comment <span className="normal-case tracking-normal font-normal">(by admin)</span>
                        </p>
                        <div className="rounded-lg border border-[#eeede9] bg-[#f8f8f6] min-h-[90px] p-4 text-sm text-[#aaa9a3] italic">
                            No comment has been added yet.
                        </div>
                        <hr className="my-5 border-[#eeede9]" />
                        <div className="flex gap-3 flex-wrap">
                            <Button variant="outline" className="border-[#eeede9] text-[#2e2e2c]" onClick={openOrWarn}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Report
                            </Button>
                            <Button className="bg-[#1A1744] hover:bg-[#2a2660]" onClick={openOrWarn}>
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-[#eeede9] shadow-sm">
                    <CardContent className="p-7">
                        <div className="flex gap-3 flex-wrap">
                            <Button
                                variant="outline"
                                className="h-11 border-[#eeede9] text-[#2e2e2c]"
                                onClick={() => setShowContactDialog(true)}
                            >
                                <List className="w-4 h-4 mr-2" />
                                Contact Consultant Before Final Confirmation
                            </Button>
                            <Button
                                variant="outline"
                                className="h-11 border-[#fca5a5] text-[#b91c1c] hover:bg-[#fff5f5] hover:text-[#991b1b]"
                                onClick={() => setShowFinalConfirmDialog(true)}
                            >
                                <OctagonAlert className="w-4 h-4 mr-2" />
                                Final Confirmation
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showMissingReportDialog} onOpenChange={setShowMissingReportDialog}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Report Not Uploaded Yet
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-[#4b5563] pt-2">
                            A consultant is reviewing your company's entire design draft and writing a report.
                            An alarm email will be sent to the HR manager upon completion, so please refer to this.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowMissingReportDialog(false)}>OK</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                <DialogContent className="sm:max-w-[520px]">
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
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#1A1744]">
                            <OctagonAlert className="w-5 h-5 text-[#dc2626]" />
                            Proceed with Final Confirmation?
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-[#4b5563] pt-2">
                            Once you proceed with final confirmation, the current HR system will be officially
                            established, and further modifications or consultant review will no longer be available.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFinalConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-[#dc2626] hover:bg-[#b91c1c]"
                            onClick={() => setShowFinalConfirmDialog(false)}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
