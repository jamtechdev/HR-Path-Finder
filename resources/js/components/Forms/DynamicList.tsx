import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface DynamicListProps {
    label: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
    addLabel?: string;
    required?: boolean;
    error?: string;
}

export default function DynamicList({
    label,
    items = [],
    onChange,
    placeholder = 'Enter item',
    addLabel = 'Add Item',
    required = false,
    error,
}: DynamicListProps) {
    const addItem = () => {
        onChange([...items, '']);
    };

    const updateItem = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        onChange(newItems);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    return (
        <div className="space-y-3">
            <Label className="text-sm font-medium">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input
                            value={item || ''}
                            onChange={(e) => updateItem(index, e.target.value)}
                            placeholder={placeholder}
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="w-full"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {addLabel}
                </Button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
