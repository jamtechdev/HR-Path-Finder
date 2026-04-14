import React, { useState, useMemo, useCallback, useEffect } from 'react';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import CompensationPageHeader from '../components/CompensationPageHeader';
import type {
    PayBand,
    SalaryTable,
    PayBandOperationCriteria,
    SalaryTableGrade,
    SalaryTableCells,
} from '../types';
import PayBandCreatorPanel from './PayBandCreatorPanel';

const MAX_LV = 4;
const MAX_GRADE = 7;
const INIT_LV = ['LV.1', 'LV.2', 'LV.3'];
const INIT_GRADES: SalaryTableGrade[] = [
    { name: 'Asso.', years: 3 },
    { name: 'Assis.Man.', years: 4 },
    { name: 'Man.', years: 5 },
    { name: 'Seni.Man.', years: 5 },
    { name: 'Director', years: 5 },
];

function salaryTablesToGrid(tables: SalaryTable[]): {
    grades: SalaryTableGrade[];
    levels: string[];
    cells: SalaryTableCells;
} {
    if (!tables || tables.length === 0) {
        const grades = INIT_GRADES.map((g) => ({ ...g }));
        const levels = [...INIT_LV];
        const cells: SalaryTableCells = grades.map((g) =>
            Array.from({ length: g.years }, () => levels.map(() => null))
        );
        return { grades, levels, cells };
    }
    const byGrade = new Map<string, SalaryTable[]>();
    tables
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .forEach((row) => {
            const key = row.job_role || row.grade || 'Grade';
            if (!byGrade.has(key)) byGrade.set(key, []);
            byGrade.get(key)!.push(row);
        });
    const grades: SalaryTableGrade[] = [];
    const levelsSet = new Set<string>();
    const cells: SalaryTableCells = [];
    byGrade.forEach((rows, name) => {
        const yearCount = rows.length;
        const minYears = Math.max(1, yearCount);
        grades.push({ name, years: minYears });
        const gradeCells: (number | null)[][] = [];
        for (let yi = 0; yi < minYears; yi++) {
            const row = rows[yi];
            const levs: (number | null)[] = [
                row?.level_1 ?? null,
                row?.level_2 ?? null,
                row?.level_3 ?? null,
                row?.level_4 ?? null,
                row?.level_5 ?? null,
            ].filter((_, i) => i < 5) as (number | null)[];
            while (levs.length < 5) levs.push(null);
            ['LV.1', 'LV.2', 'LV.3', 'LV.4', 'LV.5'].forEach((l, i) => {
                if (levs[i] != null) levelsSet.add(l);
            });
            gradeCells.push(levs);
        }
        cells.push(gradeCells);
    });
    const levels = INIT_LV.slice();
    if (levelsSet.has('LV.4')) levels.push('LV.4');
    if (levelsSet.has('LV.5')) levels.push('LV.5');

    // Keep at least 3 levels so the table has a sensible structure.
    while (levels.length < 3) levels.push(`LV.${levels.length + 1}`);

    // Trim to MAX_LV and also trim cell rows to the same length.
    const trimmedLevels = levels.slice(0, Math.min(MAX_LV, levels.length));
    const numLevels = Math.max(3, trimmedLevels.length);
    cells.forEach((gradeRows) => {
        gradeRows.forEach((row) => {
            while (row.length < numLevels) row.push(null);
            if (row.length > numLevels) row.splice(numLevels);
        });
    });
    return { grades, levels: trimmedLevels, cells };
}

function gridToSalaryTables(
    grades: SalaryTableGrade[],
    levels: string[],
    cells: SalaryTableCells
): SalaryTable[] {
    const out: SalaryTable[] = [];
    grades.forEach((g, gi) => {
        const gradeCells = cells[gi] || [];
        for (let yi = 0; yi < g.years; yi++) {
            const row = gradeCells[yi] || levels.map(() => null);
            const level1 = row[0] ?? undefined;
            const level2 = row[1] ?? undefined;
            const level3 = row[2] ?? undefined;
            const level4 = row[3] ?? undefined;
            const level5 = row[4] ?? undefined;
            out.push({
                id: gi * 100 + yi,
                job_role: g.name,
                grade: g.name,
                years_in_grade: yi + 1,
                level_1: level1,
                level_2: level2,
                level_3: level3,
                level_4: level4,
                level_5: level5,
                order: gi * 100 + yi,
            });
        }
    });
    return out;
}

interface PayBandSalaryTableTabProps {
    projectId: number;
    salaryDeterminationStandard?: string;
    payBands: PayBand[];
    salaryTables: SalaryTable[];
    operationCriteria: PayBandOperationCriteria;
    onPayBandsUpdate: (bands: PayBand[]) => void;
    onSalaryTablesUpdate: (tables: SalaryTable[]) => void;
    onOperationCriteriaUpdate: (criteria: PayBandOperationCriteria) => void;
    onRequestStructureSwitch?: (target: 'pay_band' | 'salary_table') => void;
    fieldErrors?: FieldErrors;
}

export default function PayBandSalaryTableTab({
    projectId,
    salaryDeterminationStandard,
    payBands,
    salaryTables,
    operationCriteria,
    onPayBandsUpdate,
    onSalaryTablesUpdate,
    onOperationCriteriaUpdate,
    onRequestStructureSwitch,
    fieldErrors = {},
}: PayBandSalaryTableTabProps) {
    const { t } = useTranslation();
    const UI = 'compensation_system.base_salary_ui' as const;
    const selectedStandard: 'pay_band' | 'salary_table' =
        salaryDeterminationStandard === 'salary_table' ? 'salary_table' : 'pay_band';
    const [activeType, setActiveType] = useState<'pay_band' | 'salary_table'>(
        selectedStandard
    );
    const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
    const [pendingType, setPendingType] = useState<'pay_band' | 'salary_table' | null>(null);

    // Keep the active UI in sync with the Base Salary Framework selection.
    useEffect(() => {
        const next: 'pay_band' | 'salary_table' = selectedStandard;
        setActiveType(next);
    }, [selectedStandard]);

    const openSwitchDialog = useCallback((target: 'pay_band' | 'salary_table') => {
        if (target === selectedStandard) return;
        setPendingType(target);
        setSwitchDialogOpen(true);
    }, [selectedStandard]);

    const confirmSwitch = useCallback(() => {
        if (pendingType && onRequestStructureSwitch) {
            onRequestStructureSwitch(pendingType);
        }
        setSwitchDialogOpen(false);
        setPendingType(null);
    }, [pendingType, onRequestStructureSwitch]);

    const { grades, levels, cells } = useMemo(
        () => salaryTablesToGrid(salaryTables),
        [salaryTables]
    );

    const pushSalaryTables = useCallback(
        (newGrades: SalaryTableGrade[], newCells: SalaryTableCells, newLevels: string[]) => {
            onSalaryTablesUpdate(gridToSalaryTables(newGrades, newLevels, newCells));
        },
        [onSalaryTablesUpdate]
    );

    const addGrade = useCallback(() => {
        if (grades.length >= MAX_GRADE) return;
        const name = window.prompt('Enter a new grade name', 'New Grade')?.trim();
        if (!name) return;
        const newGrades = [...grades, { name, years: 3 }];
        const newCells = [...cells.map((g) => g.map((r) => [...r]))];
        newCells.push(
            Array.from({ length: 3 }, () => levels.map(() => null))
        );
        pushSalaryTables(newGrades, newCells, levels);
    }, [grades, levels, cells, pushSalaryTables]);

    const removeGrade = useCallback(
        (gi: number) => {
            if (grades.length <= 1) return;
            if (!window.confirm(`Delete grade '${grades[gi].name}'?`)) return;
            const newGrades = grades.filter((_, i) => i !== gi);
            const newCells = cells.filter((_, i) => i !== gi);
            pushSalaryTables(newGrades, newCells, levels);
        },
        [grades, cells, levels, pushSalaryTables]
    );

    const addYear = useCallback(
        (gi: number) => {
            const newGrades = grades.map((g, i) =>
                i === gi ? { ...g, years: g.years + 1 } : g
            );
            const newCells = cells.map((gRows, i) => {
                if (i !== gi) return gRows.map((r) => [...r]);
                return [...gRows.map((r) => [...r]), levels.map(() => null)];
            });
            pushSalaryTables(newGrades, newCells, levels);
        },
        [grades, cells, levels, pushSalaryTables]
    );

    const removeYear = useCallback(
        (gi: number) => {
            if (grades[gi].years <= 1) return;
            const newGrades = grades.map((g, i) =>
                i === gi ? { ...g, years: g.years - 1 } : g
            );
            const newCells = cells.map((gRows, i) => {
                if (i !== gi) return gRows.map((r) => [...r]);
                return gRows.slice(0, -1).map((r) => [...r]);
            });
            pushSalaryTables(newGrades, newCells, levels);
        },
        [grades, cells, levels, pushSalaryTables]
    );

    const addLv = useCallback(() => {
        if (levels.length >= MAX_LV) return;
        const newLevels = [...levels, `LV.${levels.length + 1}`];
        const newCells = cells.map((gRows) =>
            gRows.map((row) => [...row, null])
        );
        pushSalaryTables(grades, newCells, newLevels);
    }, [grades, levels, cells, pushSalaryTables]);

    const removeLv = useCallback(() => {
        // Keep at least 3 competency levels to match the intended salary-table structure.
        if (levels.length <= 3) return;
        const newLevels = levels.slice(0, -1);
        const newCells = cells.map((gRows) =>
            gRows.map((row) => row.slice(0, -1))
        );
        pushSalaryTables(grades, newCells, newLevels);
    }, [grades, levels, cells, pushSalaryTables]);

    const setCell = useCallback(
        (gi: number, yi: number, li: number, value: number | null) => {
            const newCells = cells.map((gRows, gIdx) =>
                gRows.map((row, yIdx) =>
                    row.map((v, lIdx) =>
                        gIdx === gi && yIdx === yi && lIdx === li ? value : v
                    )
                )
            );
            pushSalaryTables(grades, newCells, levels);
        },
        [grades, levels, cells, pushSalaryTables]
    );

    const setGradeName = useCallback(
        (gi: number, name: string) => {
            const newGrades = grades.map((g, i) =>
                i === gi ? { ...g, name: name || g.name } : g
            );
            pushSalaryTables(newGrades, cells, levels);
        },
        [grades, cells, levels, pushSalaryTables]
    );

    const filledCount = useMemo(() => {
        const opFilled =
            String(operationCriteria.outlier_handling || '').trim() !== '' &&
            String(operationCriteria.promotion_movement_rule || '').trim() !== '' &&
            String(operationCriteria.band_review_cycle || '').trim() !== '';

        const bandsOk =
            selectedStandard === 'pay_band' &&
            payBands.length > 0 &&
            payBands.every(
                (b) =>
                    !!(b.job_grade && String(b.job_grade).trim()) &&
                    (Number(b.min_salary) > 0 || Number(b.max_salary) > 0)
            );

        const tablesOk =
            selectedStandard === 'salary_table' &&
            grades.length > 0 &&
            cells.some((gRows) => gRows.some((row) => row.some((v) => v != null && Number(v) > 0)));

        let pct = 0;
        if (selectedStandard === 'pay_band') {
            if (bandsOk) pct += 50;
            if (opFilled) pct += 50;
        } else {
            if (tablesOk) pct += 50;
            if (opFilled) pct += 50;
        }
        return pct;
    }, [selectedStandard, payBands, grades, cells, operationCriteria]);

    return (
        <div className="space-y-0">
            <CompensationPageHeader
                eyebrowTag={t('compensation_system.snapshot.header_eyebrow')}
                stepLabel={t('compensation_system.step_labels.step3')}
                title={t('compensation_system.tabs.pay_band_salary_table')}
                description={t('compensation_system.step_desc.pay_band_salary_table')}
                completionPct={filledCount}
            />
            <Collapsible defaultOpen={false} className="mt-3 px-1">
                <CollapsibleTrigger
                    className={cn(
                        'w-full flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-left',
                        'hover:bg-muted/60 transition-colors'
                    )}
                >
                    <span className="w-[26px] h-[26px] rounded-md bg-primary/15 text-[#2ec4a0] border border-primary/25 flex items-center justify-center text-xs shrink-0">
                        ✦
                    </span>
                    <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground flex-1">
                        {t(`${UI}.purpose_title`)} — {t('compensation_system.pay_band_tab.guidance_sub')}
                    </span>
                    <span className="text-muted-foreground text-[11px]">▾</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 pb-1">
                    <div className="rounded-lg border border-border bg-card/80 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
                        {selectedStandard === 'pay_band'
                            ? t('compensation_system.step_desc_payband')
                            : t('compensation_system.step_desc_salarytable')}
                    </div>
                </CollapsibleContent>
            </Collapsible>
            <FieldErrorMessage fieldKey="comp-pay-band" errors={fieldErrors} className="mt-4 px-1" />
            <div className="pt-5">
                <Card className="shadow-sm border rounded-xl overflow-hidden">
                    <CardHeader className="pb-2 pt-5 px-5 border-b border-border/60 bg-muted/20">
                        <CardTitle className="text-base font-semibold">
                            {t('compensation_system.pay_band_tab.workspace_title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-4 space-y-4">
                <Tabs
                    value={activeType}
                    onValueChange={(v) => {
                        const next = v as 'pay_band' | 'salary_table';
                        if (next === selectedStandard) {
                            setActiveType(next);
                            return;
                        }
                        openSwitchDialog(next);
                    }}
                >
                    <TabsList>
                        <TabsTrigger
                            value="pay_band"
                            disabled={selectedStandard !== 'pay_band'}
                            onClick={() => {
                                if (selectedStandard !== 'pay_band') openSwitchDialog('pay_band');
                            }}
                        >
                            Pay Band
                        </TabsTrigger>
                        <TabsTrigger
                            value="salary_table"
                            disabled={selectedStandard !== 'salary_table'}
                            onClick={() => {
                                if (selectedStandard !== 'salary_table') openSwitchDialog('salary_table');
                            }}
                        >
                            Salary Table
                        </TabsTrigger>
                    </TabsList>
                    <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                        Active structure: <span className="font-semibold text-foreground">
                            {selectedStandard === 'pay_band' ? 'Pay Band' : 'Salary Table'}
                        </span>. To switch structure, change the option in `Base Salary Framework`.
                    </div>

                    <TabsContent value="pay_band" className="mt-6">
                        <PayBandCreatorPanel
                            payBands={payBands}
                            onPayBandsUpdate={onPayBandsUpdate}
                            operationCriteria={operationCriteria}
                            onOperationCriteriaUpdate={onOperationCriteriaUpdate}
                            fieldErrors={fieldErrors}
                        />
                    </TabsContent>

                    <TabsContent value="salary_table" className="mt-6">
                        <div className="space-y-4">
                            <div
                                id="structCtrl"
                                className="flex items-center gap-4 flex-wrap mb-2 p-3 bg-muted/50 rounded-lg border"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                                        Competency Levels
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={addLv}
                                        disabled={levels.length >= MAX_LV}
                                    >
                                        + Add LV
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs text-destructive hover:text-destructive"
                                        onClick={removeLv}
                                        disabled={levels.length <= 3}
                                    >
                                        − Delete LV
                                    </Button>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                        {levels.length} / {MAX_LV}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                                        Grade
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={addGrade}
                                        disabled={grades.length >= MAX_GRADE}
                                    >
                                        + Add Grade
                                    </Button>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                        {grades.length} / {MAX_GRADE}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <Label className="text-base font-semibold">Salary Table Structure</Label>
                            </div>
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[88px] min-w-[88px] font-semibold text-xs uppercase">
                                                Grade
                                            </TableHead>
                                            <TableHead className="w-[76px] min-w-[76px] font-semibold text-xs uppercase text-center">
                                                Year
                                            </TableHead>
                                            {levels.map((lv) => (
                                                <TableHead
                                                    key={lv}
                                                    className="min-w-[96px] font-semibold text-xs text-center"
                                                >
                                                    {lv}
                                                </TableHead>
                                            ))}
                                            <TableHead className="w-[100px] min-w-[100px] text-center font-semibold text-xs">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {grades.map((g, gi) => (
                                            <React.Fragment key={gi}>
                                                {Array.from({ length: g.years }, (_, yi) => (
                                                    <TableRow
                                                        key={`${gi}-${yi}`}
                                                        className={
                                                            yi === g.years - 1 && gi < grades.length - 1
                                                                ? 'border-b-2 border-amber-200'
                                                                : ''
                                                        }
                                                    >
                                                        {yi === 0 ? (
                                                            <TableCell
                                                                rowSpan={g.years}
                                                                className="bg-[#1B2E4B] text-white align-middle text-center font-semibold border-r"
                                                            >
                                                                <Input
                                                                    value={g.name}
                                                                    onChange={(e) =>
                                                                        setGradeName(gi, e.target.value)
                                                                    }
                                                                    className="h-8 w-24 bg-white/10 border-white/20 text-white font-semibold text-center placeholder:text-white/60"
                                                                />
                                                            </TableCell>
                                                        ) : null}
                                                        <TableCell className="text-center text-muted-foreground font-medium bg-muted/30">
                                                            Year {yi + 1}
                                                        </TableCell>
                                                        {levels.map((_, li) => (
                                                            <TableCell
                                                                key={li}
                                                                className="p-0 text-right"
                                                            >
                                                                <Input
                                                                    type="number"
                                                                    className="h-9 border-0 text-right font-semibold rounded-none focus-visible:ring-1"
                                                                    value={
                                                                        cells[gi]?.[yi]?.[li] ?? ''
                                                                    }
                                                                    onChange={(e) => {
                                                                        const v = e.target.value;
                                                                        setCell(
                                                                            gi,
                                                                            yi,
                                                                            li,
                                                                            v === ''
                                                                                ? null
                                                                                : parseFloat(v) || 0
                                                                        );
                                                                    }}
                                                                />
                                                            </TableCell>
                                                        ))}
                                                        <TableCell className="p-2 align-middle">
                                                            <div className="flex flex-col gap-1 items-center">
                                                                {yi === 0 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 text-xs w-full"
                                                                        onClick={() => addYear(gi)}
                                                                    >
                                                                        + Add Year
                                                                    </Button>
                                                                )}
                                                                {yi === 0 && g.years > 1 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 text-xs w-full text-destructive hover:text-destructive"
                                                                        onClick={() =>
                                                                            removeYear(gi)
                                                                        }
                                                                    >
                                                                        − Remove Year
                                                                    </Button>
                                                                )}
                                                                {yi === g.years - 1 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 text-xs w-full text-destructive hover:text-destructive"
                                                                        onClick={() =>
                                                                            removeGrade(gi)
                                                                        }
                                                                        disabled={grades.length <= 1}
                                                                    >
                                                                        − Remove Grade
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                        <TableRow className="bg-muted/30">
                                            <TableCell
                                                colSpan={2 + levels.length}
                                                className="text-center py-3"
                                            >
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addGrade}
                                                    disabled={grades.length >= MAX_GRADE}
                                                >
                                                    + Add Grade
                                                </Button>
                                            </TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                            {grades.length === 0 && (
                                <Card className="border-dashed">
                                    <CardContent className="p-8 text-center">
                                        <p className="text-muted-foreground">
                                            No salary table configured. Click &quot;+ Add Grade&quot; to
                                            get started.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {activeType === 'salary_table' && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-base">Operation Criteria</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FieldErrorMessage fieldKey="comp-operation-criteria" errors={fieldErrors} className="mb-3" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label className="mb-2 block">Outlier (Above Max, Below Min)</Label>
                                <Select
                                    value={operationCriteria.outlier_handling || ''}
                                    onValueChange={(v) =>
                                        onOperationCriteriaUpdate({
                                            ...operationCriteria,
                                            outlier_handling: v,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="not_allowed">Not allowed</SelectItem>
                                        <SelectItem value="allowed_with_ceo_approval">
                                            Allowed by CEO&apos;s Approval
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="mb-2 block">Promotion Movement Rule</Label>
                                <Select
                                    value={operationCriteria.promotion_movement_rule || ''}
                                    onValueChange={(v) =>
                                        onOperationCriteriaUpdate({
                                            ...operationCriteria,
                                            promotion_movement_rule: v,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="guarantee_minimum">
                                            Minimum of the new pay band is guaranteed
                                        </SelectItem>
                                        <SelectItem value="below_minimum_allowed">
                                            Below minimum allowed
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="mb-2 block">Band Review Cycle</Label>
                                <Select
                                    value={operationCriteria.band_review_cycle || ''}
                                    onValueChange={(v) =>
                                        onOperationCriteriaUpdate({
                                            ...operationCriteria,
                                            band_review_cycle: v,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select cycle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="annual">Annual</SelectItem>
                                        <SelectItem value="every_2_years">Every 2 years</SelectItem>
                                        <SelectItem value="ad_hoc">Ad-hoc only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                )}
                    </CardContent>
                </Card>
            <Dialog open={switchDialogOpen} onOpenChange={setSwitchDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Switch compensation structure?</DialogTitle>
                        <DialogDescription>
                            You currently have{' '}
                            <strong>{selectedStandard === 'pay_band' ? 'Pay Band' : 'Salary Table'}</strong>{' '}
                            selected. Would you like to switch to{' '}
                            <strong>{pendingType === 'pay_band' ? 'Pay Band' : 'Salary Table'}</strong>? Previous data may be reset.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setSwitchDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={confirmSwitch}>
                            Switch Structure
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </div>
    );
}
