import { Head } from '@inertiajs/react';
import { AlertCircle, Check, Download, Eye, List, OctagonAlert } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    adminComment?: {
        comment?: string | null;
        author?: string | null;
        updated_at?: string | null;
    } | null;
}

export default function HrReportIndex({
    project,
    stepStatuses,
    projectId,
    hrSystemSnapshot,
    reportUploads = [],
    adminComment,
}: Props) {
    const { t } = useTranslation();
    const na = t('hr_report.not_configured_yet');
    const firstNonEmpty = (...vals: Array<string | number | null | undefined>) => {
        for (const v of vals) {
            if (v === null || v === undefined) continue;
            const s = String(v).trim();
            if (s !== '') return s;
        }
        return na;
    };
    const toList = (value: unknown): string => {
        if (Array.isArray(value)) {
            const out = value
                .map((v) => {
                    if (typeof v === 'string') return v.trim();
                    if (v && typeof v === 'object' && 'value' in (v as Record<string, unknown>)) {
                        return String((v as Record<string, unknown>).value ?? '').trim();
                    }
                    return '';
                })
                .filter(Boolean);
            return out.length ? out.join(', ') : na;
        }
        if (value == null) return na;
        const s = String(value).trim();
        return s || na;
    };
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
    const uploadedAt = latestUpload?.created_at
        ? new Date(latestUpload.created_at).toLocaleString()
        : null;
    const stageData = useMemo(
        () => [
            {
                key: 'diagnosis',
                label: t('steps.diagnosis'),
                values: [
                    `${t('hr_tree.final_board.diagnosis.industry')}: ${firstNonEmpty(
                        hrSystemSnapshot?.diagnosis?.industry_category,
                        hrSystemSnapshot?.company?.industry
                    )}`,
                    `${t('hr_tree.final_board.diagnosis.ceo_philosophy')}: ${firstNonEmpty(
                        hrSystemSnapshot?.ceo_philosophy?.main_trait,
                        hrSystemSnapshot?.ceo_philosophy?.secondary_trait
                    )}`,
                ],
            },
            {
                key: 'job_analysis',
                label: t('steps.job_analysis'),
                values: [
                    `${t('hr_tree.final_board.job.families')}: ${hrSystemSnapshot?.job_architecture?.jobs_defined ?? 0}`,
                    `${t('hr_tree.final_board.diagnosis.org_structure')}: ${firstNonEmpty(
                        hrSystemSnapshot?.job_architecture?.structure_type,
                        hrSystemSnapshot?.job_architecture?.job_grade_structure
                    )}`,
                ],
            },
            {
                key: 'performance',
                label: t('steps.performance'),
                values: [
                    `${t('hr_tree.final_board.performance.eval_model')}: ${firstNonEmpty(
                        hrSystemSnapshot?.performance_management?.method,
                        hrSystemSnapshot?.performance_management?.model
                    )}`,
                    `${t('hr_tree.final_board.performance.rating')}: ${firstNonEmpty(
                        hrSystemSnapshot?.performance_management?.rating_scale,
                        hrSystemSnapshot?.performance_management?.cycle
                    )}`,
                ],
            },
            {
                key: 'compensation',
                label: t('steps.compensation'),
                values: [
                    `${t('hr_tree.final_board.compensation.salary_system')}: ${firstNonEmpty(
                        hrSystemSnapshot?.compensation_benefits?.salary_system,
                        hrSystemSnapshot?.compensation_benefits?.salary_structure_type,
                        hrSystemSnapshot?.compensation_benefits?.salary_increase_process,
                        hrSystemSnapshot?.compensation_benefits?.bonus_metric
                    )}`,
                    `${t('hr_tree.final_board.compensation.benefits')}: ${firstNonEmpty(
                        hrSystemSnapshot?.compensation_benefits?.welfare_program,
                        toList(hrSystemSnapshot?.compensation_benefits?.benefits_strategic_direction),
                        hrSystemSnapshot?.compensation_benefits?.benefits_level != null
                            ? `${hrSystemSnapshot.compensation_benefits.benefits_level}%`
                            : null
                    )}`,
                ],
            },
        ],
        [hrSystemSnapshot, t]
    );
    const hasConsultantReport = Boolean(latestUpload);
    const statusStep = hasConsultantReport ? 4 : allMainDone ? 2 : 1;

    const openOrWarn = () => {
        if (latestUpload) {
            window.open(
                `/hr-manager/report/${projectId}/upload/${latestUpload.id}/download`,
                '_blank'
            );
            return;
        }
        if (allMainDone) {
            window.open(`/hr-manager/report/${projectId}/download`, '_blank');
            return;
        }
        setShowMissingReportDialog(true);
    };

    return (
        <AppLayout showWorkflowSteps={true} stepStatuses={stepStatuses} projectId={projectId}>
            <Head title={t('hr_report.page_title', { company: project.company.name })} />
            <div className="px-6 py-12 md:px-8 md:py-12 max-w-[860px] mx-auto space-y-4">
                <div className="mb-6">
                    <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-primary">
                        {t('hr_report.eyebrow')}
                    </p>
                    <h1 className="text-[28px] leading-[1.2] font-serif font-normal text-foreground mt-2">{t('hr_report.title')}</h1>
                    <p className="text-[13px] text-muted-foreground mt-[6px]">
                        {project.company.name} · HR System Design
                    </p>
                </div>

                <Card className="rounded-xl border border-border shadow-sm bg-card border-l-[3px] border-l-primary">
                    <CardContent className="px-8 py-7">
                        <p className="text-[11px] font-semibold tracking-[0.10em] uppercase text-muted-foreground mb-3">
                            {t('hr_report.completion.title')}
                        </p>
                        <p className="text-[14px] leading-[1.75] text-foreground">
                            {t('hr_report.completion.line1_prefix')} <strong>{project.company.name}</strong> {t('hr_report.completion.line1_suffix')}
                        </p>
                        <p className="text-[14px] leading-[1.75] text-foreground mt-[10px]">
                            {t('hr_report.completion.line2', { company: project.company.name })}
                        </p>
                        <p className="text-[14px] leading-[1.75] text-foreground mt-[10px]">
                            {t('hr_report.completion.line3')}
                        </p>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-border shadow-sm">
                    <CardContent className="px-8 py-7">
                        <p className="text-[11px] font-semibold tracking-[0.10em] uppercase text-muted-foreground mb-5">
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
                                                    done || active ? 'bg-primary' : 'bg-border'
                                                }`}
                                            />
                                        )}
                                        <div
                                            className={`relative z-10 mx-auto w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${
                                                done
                                                    ? 'bg-primary border-primary text-primary-foreground'
                                                    : active
                                                      ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_0_4px_rgba(79,142,247,0.18)]'
                                                      : 'bg-muted border-muted text-muted-foreground'
                                            }`}
                                        >
                                            {done ? <Check className="w-3 h-3" /> : i}
                                        </div>
                                        <p className={`mt-2 text-[11px] leading-[1.4] ${active ? 'text-primary font-semibold' : done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
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

                <Card className="rounded-xl border border-border shadow-sm">
                    <CardContent className="px-8 py-7">
                        <p className="text-[11px] font-semibold tracking-[0.10em] uppercase text-muted-foreground mb-3">
                            {t('hr_report.dynamic_snapshot_title')}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {stageData.map((stage) => (
                                <div key={stage.key} className="rounded-lg border border-border bg-muted/20 p-3">
                                    <p className="text-xs font-semibold text-foreground mb-1">{stage.label}</p>
                                    {stage.values.map((v, i) => (
                                        <p key={i} className="text-xs text-muted-foreground leading-5">{v}</p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-border shadow-sm">
                    <CardContent className="px-8 py-7">
                        <p className="text-[11px] font-semibold tracking-[0.10em] uppercase text-muted-foreground mb-3">
                            {t('hr_report.comment.title')} <span className="normal-case tracking-normal font-normal">{t('hr_report.comment.by_admin')}</span>
                        </p>
                        <div className="rounded-lg border border-border bg-muted/30 min-h-[90px] px-[18px] py-4 text-[14px] leading-[1.7] text-muted-foreground">
                            {adminComment?.comment?.trim() || t('hr_report.comment.empty')}
                        </div>
                        {adminComment?.author && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                {adminComment.author}
                                {adminComment.updated_at
                                    ? ` · ${new Date(adminComment.updated_at).toLocaleString()}`
                                    : ''}
                            </p>
                        )}
                        <hr className="my-5 border-border" />
                        {latestUpload && (
                            <p className="text-xs text-muted-foreground mb-3">
                                {latestUpload.original_name || 'report.pdf'}
                                {uploadedAt ? ` · ${uploadedAt}` : ''}
                            </p>
                        )}
                        <div className="flex gap-3 flex-wrap">
                            <Button
                                variant="outline"
                                className="h-10 px-5 rounded-lg border-[1.5px] border-border text-foreground hover:border-primary hover:text-primary"
                                onClick={openOrWarn}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                {t('hr_report.actions.view_report')}
                            </Button>
                            <Button className="h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground" onClick={openOrWarn}>
                                <Download className="w-4 h-4 mr-2" />
                                {t('hr_report.actions.download_report')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl border border-border shadow-sm">
                    <CardContent className="px-8 py-7">
                        <div className="flex gap-3 flex-wrap">
                            <Button
                                variant="outline"
                                className="h-10 px-5 rounded-lg border-[1.5px] border-border text-foreground"
                                onClick={() => setShowContactDialog(true)}
                            >
                                <List className="w-4 h-4 mr-2" />
                                {t('hr_report.actions.contact_consultant')}
                            </Button>
                            <Button
                                variant="outline"
                                className="h-10 px-5 rounded-lg border-[1.5px] border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setShowFinalConfirmDialog(true)}
                            >
                                <OctagonAlert className="w-4 h-4 mr-2" />
                                {t('hr_report.actions.final_confirmation')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showMissingReportDialog} onOpenChange={setShowMissingReportDialog}>
                <DialogContent className="sm:max-w-[520px] rounded-[14px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            {t('hr_report.dialogs.missing_report.title')}
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-muted-foreground pt-2">
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
                        <DialogDescription className="text-sm leading-6 text-muted-foreground pt-2">
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
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <OctagonAlert className="w-5 h-5 text-[#dc2626]" />
                            {t('hr_report.dialogs.final_confirm.title')}
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-6 text-muted-foreground pt-2">
                            {t('hr_report.dialogs.final_confirm.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFinalConfirmDialog(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={() => setShowFinalConfirmDialog(false)}>
                            {t('common.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
