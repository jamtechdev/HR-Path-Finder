import { Plus, Trash2 } from 'lucide-react';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import FieldErrorMessage, { type FieldErrors } from '@/components/Forms/FieldErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompensationPageHeader from '../components/CompensationPageHeader';
import type {
    PayBand,
    SalaryTable,
    PayBandOperationCriteria,
    SalaryTableGrade,
    SalaryTableCells,
} from '../types';

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
    [['LV.4'], ['LV.5']].forEach((extra, i) => {
        if (levelsSet.has(extra[0]) || levels.length + i < 5) {
            if (!levels.includes(extra[0])) levels.push(extra[0]);
        }
    });
    while (levels.length < 3) levels.push(`LV.${levels.length + 1}`);
    const numLevels = Math.max(3, levels.length);
    cells.forEach((gradeRows) => {
        gradeRows.forEach((row) => {
            while (row.length < numLevels) row.push(null);
        });
    });
    return { grades, levels: levels.slice(0, Math.min(MAX_LV, levels.length)), cells };
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
    fieldErrors = {},
}: PayBandSalaryTableTabProps) {
    const [activeType, setActiveType] = useState<'pay_band' | 'salary_table'>(
        salaryDeterminationStandard === 'salary_table' ? 'salary_table' : 'pay_band'
    );

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
        const name = window.prompt('새 직급 이름을 입력하세요', 'New Grade')?.trim();
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
            if (!window.confirm(`'${grades[gi].name}' 직급을 삭제할까요?`)) return;
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
        if (levels.length <= 1) return;
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
        const bandsOk =
            payBands.length > 0 &&
            payBands.every((b) => b.job_grade && (b.min_salary > 0 || b.max_salary > 0));
        const tablesOk =
            grades.length > 0 &&
            cells.some((gRows) => gRows.some((row) => row.some((v) => v != null)));
        const criteriaOk = Object.keys(operationCriteria).length > 0;
        let n = 0;
        if (bandsOk || tablesOk) n += 1;
        if (criteriaOk) n += 1;
        return Math.min(n * 50, 100);
    }, [payBands, grades, cells, operationCriteria]);

    return (
        <div className="space-y-0">
            <CompensationPageHeader
                eyebrowTag="Compensation Structure"
                stepLabel="Step 3 of 6 · Pay Band / Salary Table"
                title="Pay Band / Salary Table"
                description={
                    salaryDeterminationStandard === 'pay_band'
                        ? 'Create and configure your pay band structure with visual representation.'
                        : 'Create and configure your salary table structure.'
                }
                completionPct={filledCount}
            />
            <FieldErrorMessage fieldKey="comp-pay-band" errors={fieldErrors} className="mt-4 px-1" />
            <div className="pt-6 space-y-6">
                <Tabs
                    value={activeType}
                    onValueChange={(v) => setActiveType(v as 'pay_band' | 'salary_table')}
                >
                    <TabsList>
                        <TabsTrigger value="pay_band">Pay Band</TabsTrigger>
                        <TabsTrigger value="salary_table">Salary Table</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pay_band" className="mt-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-base font-semibold">Pay Band Structure</Label>
                                <Button
                                    onClick={() =>
                                        onPayBandsUpdate([
                                            ...payBands,
                                            {
                                                id: Date.now(),
                                                job_grade: '',
                                                min_salary: 0,
                                                max_salary: 0,
                                                order: payBands.length,
                                            },
                                        ])
                                    }
                                    size="sm"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Pay Band
                                </Button>
                            </div>
                            {payBands.map((band, idx) => (
                                <Card key={band.id || idx}>
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <Label>Job Grade</Label>
                                                <Input
                                                    value={band.job_grade}
                                                    onChange={(e) => {
                                                        const updated = [...payBands];
                                                        updated[idx].job_grade = e.target.value;
                                                        onPayBandsUpdate(updated);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Label>Min Salary (KRW)</Label>
                                                <Input
                                                    type="number"
                                                    value={band.min_salary || ''}
                                                    onChange={(e) => {
                                                        const updated = [...payBands];
                                                        updated[idx].min_salary =
                                                            parseFloat(e.target.value) || 0;
                                                        onPayBandsUpdate(updated);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Label>Max Salary (KRW)</Label>
                                                <Input
                                                    type="number"
                                                    value={band.max_salary || ''}
                                                    onChange={(e) => {
                                                        const updated = [...payBands];
                                                        updated[idx].max_salary =
                                                            parseFloat(e.target.value) || 0;
                                                        onPayBandsUpdate(updated);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Label>Target Salary (KRW)</Label>
                                                <Input
                                                    type="number"
                                                    value={band.target_salary ?? ''}
                                                    onChange={(e) => {
                                                        const updated = [...payBands];
                                                        updated[idx].target_salary =
                                                            parseFloat(e.target.value) || undefined;
                                                        onPayBandsUpdate(updated);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() =>
                                                onPayBandsUpdate(payBands.filter((_, i) => i !== idx))
                                            }
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                            {payBands.length === 0 && (
                                <Card className="border-dashed">
                                    <CardContent className="p-8 text-center">
                                        <p className="text-muted-foreground">
                                            No pay bands configured. Click &quot;Add Pay Band&quot; to
                                            get started.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="salary_table" className="mt-6">
                        <div className="space-y-4">
                            <div
                                id="structCtrl"
                                className="flex items-center gap-4 mb-2 p-3 bg-muted/50 rounded-lg border"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                                        역량 레벨
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={addLv}
                                        disabled={levels.length >= MAX_LV}
                                    >
                                        + LV 추가
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs text-destructive hover:text-destructive"
                                        onClick={removeLv}
                                        disabled={levels.length <= 1}
                                    >
                                        − LV 삭제
                                    </Button>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                        {levels.length} / {MAX_LV}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase text-muted-foreground">
                                        직급
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={addGrade}
                                        disabled={grades.length >= MAX_GRADE}
                                    >
                                        + 직급 추가
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
                                                                        + 연차
                                                                    </Button>
                                                                )}
                                                                {yi === 1 && g.years > 1 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 text-xs w-full text-destructive hover:text-destructive"
                                                                        onClick={() =>
                                                                            removeYear(gi)
                                                                        }
                                                                    >
                                                                        − 연차
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
                                                                        − 직급
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
                                                    + 직급 추가
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
                                            No salary table configured. Click &quot;+ 직급 추가&quot; to
                                            get started.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-base">Operation Criteria</CardTitle>
                    </CardHeader>
                    <CardContent>
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
            </div>
        </div>
    );
}
