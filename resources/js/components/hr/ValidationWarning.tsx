import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ValidationWarningProps {
    warnings: string[];
    errors: string[];
}

export function ValidationWarning({ warnings, errors }: ValidationWarningProps) {
    if (errors.length === 0 && warnings.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            {errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ))}
            {warnings.map((warning, index) => (
                <Alert key={index}>
                    <AlertTriangle className="size-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>{warning}</AlertDescription>
                </Alert>
            ))}
        </div>
    );
}
