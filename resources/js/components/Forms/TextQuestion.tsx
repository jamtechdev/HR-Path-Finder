import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TextQuestionProps {
    question: string;
    value?: string;
    onChange: (value: string) => void;
    type?: 'text' | 'textarea' | 'number';
    placeholder?: string;
    required?: boolean;
    error?: string;
    rows?: number;
}

export default function TextQuestion({
    question,
    value = '',
    onChange,
    type = 'text',
    placeholder,
    required = false,
    error,
    rows = 4,
}: TextQuestionProps) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">
                {question}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {type === 'textarea' ? (
                <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    rows={rows}
                    className={error ? 'border-red-500' : ''}
                />
            ) : (
                <Input
                    type={type === 'number' ? 'number' : 'text'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    className={error ? 'border-red-500' : ''}
                />
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
