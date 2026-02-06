import { Button } from '@/components/ui/button';
import { AlertCircle, Mail } from 'lucide-react';
import { router } from '@inertiajs/react';

interface SMTPWarningProps {
    onConfigure?: () => void;
}

export default function SMTPWarning({ onConfigure }: SMTPWarningProps) {
    const handleConfigure = () => {
        if (onConfigure) {
            onConfigure();
        } else {
            router.visit('/settings/index');
        }
    };

    return (
        <div className="rounded-lg border border-orange-500/50 bg-orange-50 dark:bg-orange-950/20 p-4">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                        SMTP Configuration Required
                    </h3>
                    <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                        Email services are not configured. You must configure SMTP settings before you can send CEO invitations and other emails.
                    </p>
                    <Button
                        onClick={handleConfigure}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        size="sm"
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        Configure SMTP Settings
                    </Button>
                </div>
            </div>
        </div>
    );
}
