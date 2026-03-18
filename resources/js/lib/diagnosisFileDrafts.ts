/** In-memory file picks until Review & Submit (SPA session). */

const orgCharts = new Map<string, File>();
const logos = new Map<number, File>();

function orgKey(projectId: number, year: string) {
    return `${projectId}::${year}`;
}

export function setOrgChartDraftFile(projectId: number, year: string, file: File | null): void {
    const k = orgKey(projectId, year);
    if (file) orgCharts.set(k, file);
    else orgCharts.delete(k);
}

export function getOrgChartDraftFiles(projectId: number): Record<string, File> {
    const out: Record<string, File> = {};
    for (const [key, file] of orgCharts.entries()) {
        if (key.startsWith(`${projectId}::`)) {
            const year = key.split('::')[1];
            out[year] = file;
        }
    }
    return out;
}

export function clearOrgChartDrafts(projectId: number): void {
    for (const k of [...orgCharts.keys()]) {
        if (k.startsWith(`${projectId}::`)) orgCharts.delete(k);
    }
}

export function setLogoDraftFile(projectId: number, file: File | null): void {
    if (file) logos.set(projectId, file);
    else logos.delete(projectId);
}

export function getLogoDraftFile(projectId: number): File | undefined {
    return logos.get(projectId);
}

export function clearLogoDraft(projectId: number): void {
    logos.delete(projectId);
}

export function clearAllDiagnosisFileDrafts(projectId: number): void {
    clearOrgChartDrafts(projectId);
    clearLogoDraft(projectId);
}
