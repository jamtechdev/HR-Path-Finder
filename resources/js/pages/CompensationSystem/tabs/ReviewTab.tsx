import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import type { 
    CompensationSnapshotQuestion, 
    BaseSalaryFramework, 
    PayBand, 
    SalaryTable, 
    BonusPoolConfiguration, 
    BenefitsConfiguration 
} from '../types';

interface ReviewTabProps {
    snapshotQuestions: CompensationSnapshotQuestion[];
    snapshotResponses: Record<number, string[] | string | number | object | null>;
    baseSalaryFramework: BaseSalaryFramework;
    payBands: PayBand[];
    salaryTables: SalaryTable[];
    bonusPool: BonusPoolConfiguration;
    benefits: BenefitsConfiguration;
}

export default function ReviewTab({
    snapshotQuestions,
    snapshotResponses,
    baseSalaryFramework,
    payBands,
    salaryTables,
    bonusPool,
    benefits,
}: ReviewTabProps) {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Review & Submit Compensation System</h3>
            
            {/* Snapshot Summary */}
            <div>
                <h4 className="text-md font-semibold mt-6 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Strategic Compensation Snapshot
                </h4>
                {snapshotQuestions.length > 0 ? (
                    snapshotQuestions.slice(0, 3).map((question) => (
                        <Card key={question.id} className="mb-2">
                            <CardContent className="p-4">
                                <p className="font-medium">{question.question_text}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {Array.isArray(snapshotResponses[question.id])
                                        ? (snapshotResponses[question.id] as string[]).join(', ')
                                        : snapshotResponses[question.id] || '-'}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No snapshot questions answered.</p>
                )}
            </div>

            {/* Base Salary Framework Summary */}
            <div>
                <h4 className="text-md font-semibold mt-6 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Base Salary Framework
                </h4>
                <Card>
                    <CardContent className="p-4">
                        <strong>Salary Structure Type:</strong> {baseSalaryFramework.salary_structure_type || '-'} | 
                        <strong> Adjustment Unit:</strong> {baseSalaryFramework.salary_adjustment_unit || '-'} | 
                        <strong> Determination Standard:</strong> {baseSalaryFramework.salary_determination_standard || '-'}
                    </CardContent>
                </Card>
            </div>

            {/* Pay Band/Salary Table Summary */}
            <div>
                <h4 className="text-md font-semibold mt-6 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> {baseSalaryFramework.salary_determination_standard === 'pay_band' ? 'Pay Band Structure' : 'Salary Table Structure'}
                </h4>
                {baseSalaryFramework.salary_determination_standard === 'pay_band' ? (
                    payBands.length > 0 ? (
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm"><strong>{payBands.length}</strong> pay bands configured</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <p className="text-sm text-muted-foreground">No pay bands configured.</p>
                    )
                ) : (
                    salaryTables.length > 0 ? (
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-sm"><strong>{salaryTables.length}</strong> salary table rows configured</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <p className="text-sm text-muted-foreground">No salary table rows configured.</p>
                    )
                )}
            </div>

            {/* Bonus Pool Summary */}
            <div>
                <h4 className="text-md font-semibold mt-6 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Bonus Pool Configuration
                </h4>
                <Card>
                    <CardContent className="p-4">
                        <strong>Payment Trigger:</strong> {bonusPool.payment_trigger_condition || '-'} | 
                        <strong> Determination Criteria:</strong> {bonusPool.bonus_pool_determination_criteria || '-'} | 
                        <strong> Eligibility Scope:</strong> {bonusPool.eligibility_scope || '-'}
                    </CardContent>
                </Card>
            </div>

            {/* Benefits Summary */}
            <div>
                <h4 className="text-md font-semibold mt-6 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Benefits Configuration
                </h4>
                <Card>
                    <CardContent className="p-4">
                        <strong>Benefits Expense Ratio:</strong> {benefits.benefits_expense_ratio ? (typeof benefits.benefits_expense_ratio === 'number' ? benefits.benefits_expense_ratio.toFixed(2) : parseFloat(benefits.benefits_expense_ratio).toFixed(2)) : '-'}% | 
                        <strong> Strategic Direction:</strong> {benefits.benefits_strategic_direction?.map(d => d.value).join(', ') || '-'}
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-success/10 border-success/20 mt-6">
                <CardContent className="p-4">
                    <p className="text-sm font-medium text-success">
                        Congratulations! After submission, all 4 steps will be complete. The consultant will review your HR system, and then the CEO can give final approval.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
