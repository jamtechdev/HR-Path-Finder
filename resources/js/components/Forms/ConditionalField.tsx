import React from 'react';
import TextQuestion from './TextQuestion';

interface ConditionalFieldProps {
    condition: boolean;
    question: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
}

export default function ConditionalField({
    condition,
    question,
    value = '',
    onChange,
    placeholder,
    required = false,
    error,
}: ConditionalFieldProps) {
    if (!condition) {
        return null;
    }

    return (
        <TextQuestion
            question={question}
            value={value}
            onChange={onChange}
            type="text"
            placeholder={placeholder}
            required={required}
            error={error}
        />
    );
}
