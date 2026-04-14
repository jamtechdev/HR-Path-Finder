import { Head, Link } from '@inertiajs/react';
import { Download } from 'lucide-react';
import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

type ProjectItem = {
    id: number;
    company?: { name?: string } | null;
    step_statuses?: Record<string, string>;
};

type SnapshotRow = {
    question_id: number;
    question_order: number;
    question_text: string;
    answer_type: string;
    response?: unknown;
    text_response?: string | null;
    numeric_response?: number | null;
    updated_at?: string | null;
};

type SelectedProjectPayload = {
    id: number;
    company_name: string;
    status: string;
    headcount: { total: number | null; full_time_ratio: number | null };
    snapshot_rows: SnapshotRow[];
};

interface Props {
    projects: ProjectItem[];
    selectedProject: SelectedProjectPayload | null;
}

function statusLabel(status?: string): string {
    const s = String(status || '').toLowerCase();
    if (['submitted', 'approved', 'locked', 'completed'].includes(s)) return 'Done';
    if (s === 'not_started' || s === '') return 'Not started';
    return 'In progress';
}

function statusVariant(status?: string): 'default' | 'secondary' | 'outline' {
    const s = String(status || '').toLowerCase();
    if (['submitted', 'approved', 'locked', 'completed'].includes(s)) return 'default';
    if (s === 'not_started' || s === '') return 'outline';
    return 'secondary';
}

function formatSnapshotValue(row?: SnapshotRow): string {
    if (!row) return 'No data';
    if (row.text_response && row.text_response.trim() !== '') return row.text_response;
    if (row.numeric_response !== null && row.numeric_response !== undefined) return String(row.numeric_response);
    if (row.response === null || row.response === undefined) return 'No data';
    if (Array.isArray(row.response)) {
        return row.response
            .map((entry) => {
                if (entry && typeof entry === 'object') {
                    const label = String((entry as any).function ?? '').trim();
                    const amount = (entry as any).amount;
                    if (label) return `${label}: ${amount ?? '-'}`;
                }
                return String(entry);
            })
            .join(' · ');
    }
    if (typeof row.response === 'object') {
        return Object.entries(row.response as Record<string, unknown>)
            .map(([k, v]) => `${k}: ${v ?? '-'}`)
            .join(' · ');
    }
    return String(row.response);
}

export default function CBSnapshotReview({ projects, selectedProject }: Props) {
    const selectedId = selectedProject?.id;
    const q8 = selectedProject?.snapshot_rows.find((row) => row.question_order === 8);
    const q9 = selectedProject?.snapshot_rows.find((row) => row.question_order === 9);
    const q11 = selectedProject?.snapshot_rows.find((row) => row.question_order === 11);
    const latestUpdated = selectedProject?.snapshot_rows
        .map((row) => row.updated_at)
        .filter((v): v is string => Boolean(v))
        .sort()
        .at(-1);

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="C&B Snapshot Review" />
                    <div className="mx-auto max-w-7xl p-6 md:p-8">
                        <h1 className="mb-4 text-2xl font-bold">C&B snapshot review</h1>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                            <Card className="lg:col-span-4">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Clients</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {projects.map((project) => {
                                        const compStatus = project.step_statuses?.compensation ?? 'not_started';
                                        const active = selectedId === project.id;
                                        return (
                                            <Link
                                                key={project.id}
                                                href={`/admin/cb-snapshot-review/${project.id}`}
                                                className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                                                    active ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                                                }`}
                                            >
                                                <div>
                                                    <p className="font-medium">{project.company?.name ?? `Project #${project.id}`}</p>
                                                    <p className="text-xs text-muted-foreground">ID: {project.id}</p>
                                                </div>
                                                <Badge variant={statusVariant(compStatus)}>{statusLabel(compStatus)}</Badge>
                                            </Link>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-8">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <CardTitle>
                                                {selectedProject?.company_name ?? 'Select a client'}
                                            </CardTitle>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Last updated {latestUpdated ? new Date(latestUpdated).toLocaleDateString() : '—'}
                                            </p>
                                        </div>
                                        {selectedProject && (
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/admin/report/${selectedProject.id}`}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Export
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {!selectedProject ? (
                                        <p className="text-sm text-muted-foreground">Choose a client to review C&B snapshot answers.</p>
                                    ) : (
                                        <>
                                            <div>
                                                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    Headcount overview
                                                </h3>
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div className="rounded-lg border bg-muted/30 p-3">
                                                        <p className="text-xs text-muted-foreground">Total headcount</p>
                                                        <p className="text-lg font-bold">
                                                            {selectedProject.headcount.total ? `${selectedProject.headcount.total} employees` : '—'}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg border bg-muted/30 p-3">
                                                        <p className="text-xs text-muted-foreground">Full-time ratio</p>
                                                        <p className="text-lg font-bold">
                                                            {selectedProject.headcount.full_time_ratio !== null
                                                                ? `${selectedProject.headcount.full_time_ratio}%`
                                                                : '—'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    Compensation
                                                </h3>
                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                    <div className="rounded-lg border bg-muted/30 p-3">
                                                        <p className="text-xs text-muted-foreground">Avg. salary increase rate (3yr)</p>
                                                        <p className="mt-1 text-sm">{formatSnapshotValue(q8)}</p>
                                                    </div>
                                                    <div className="rounded-lg border bg-muted/30 p-3">
                                                        <p className="text-xs text-muted-foreground">Personnel cost ratio (3yr)</p>
                                                        <p className="mt-1 text-sm">{formatSnapshotValue(q9)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    Salary by job category
                                                </h3>
                                                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                                                    {formatSnapshotValue(q11)}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    All answers
                                                </h3>
                                                <div className="max-h-80 space-y-2 overflow-auto pr-1">
                                                    {selectedProject.snapshot_rows.map((row) => (
                                                        <div key={row.question_id} className="rounded-lg border p-3">
                                                            <p className="text-sm font-semibold">
                                                                Q{row.question_order}. {row.question_text}
                                                            </p>
                                                            <p className="mt-1 text-xs text-muted-foreground">Type: {row.answer_type}</p>
                                                            <p className="mt-2 text-sm">{formatSnapshotValue(row)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
