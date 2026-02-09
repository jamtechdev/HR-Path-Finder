import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Field {
    id: string;
    [key: string]: any;
}

interface DynamicFieldListProps {
    label: string;
    fields: Field[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, field: Partial<Field>) => void;
    renderField: (field: Field, index: number) => React.ReactNode;
    addLabel?: string;
    className?: string;
    minFields?: number;
}

export default function DynamicFieldList({
    label,
    fields,
    onAdd,
    onRemove,
    onUpdate,
    renderField,
    addLabel = 'Add Item',
    className,
    minFields = 0,
}: DynamicFieldListProps) {
    return (
        <div className={cn('space-y-4', className)}>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{label}</label>
                <Button type="button" variant="outline" size="sm" onClick={onAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    {addLabel}
                </Button>
            </div>
            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-1">{renderField(field, index)}</div>
                        {fields.length > minFields && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemove(field.id)}
                                className="flex-shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))}
                {fields.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No items added yet. Click "{addLabel}" to add one.
                    </p>
                )}
            </div>
        </div>
    );
}
