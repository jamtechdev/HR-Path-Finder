import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CheckCircle2, AlertCircle, UserPlus, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Company {
    id: number;
    name: string;
}

interface Invitation {
    id: number;
    email: string;
    role: string;
    company: Company;
}

interface PageProps {
    invitation?: Invitation;
    error?: string;
    isAuthenticated?: boolean;
    token?: string;
    password?: string;
    message?: string;
}

export default function AcceptInvitation({ invitation, error, isAuthenticated, password, message }: PageProps) {
    const { props } = usePage<PageProps>();
    const user = (props as any).auth?.user;
    const flash = (props as any).flash || {};
    const pagePassword = password || flash.password || (props as any).password;
    const pageMessage = message || flash.message || (props as any).message;

    if (error) {
        return (
            <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <CardTitle>Invitation Error</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Link href="/">
                            <Button variant="outline" className="w-full">
                                Go to Home
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!invitation) {
        return (
            <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Loading...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Please wait while we load your invitation.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleAccept = () => {
        // If invitation is already accepted (password exists), redirect to login
        if (pagePassword) {
            router.visit('/login');
            return;
        }
        
        // POST to process acceptance (creates CEO account)
        router.post(`/invitations/accept/${(props as any).token || ''}`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Page will reload with password displayed
            },
        });
    };
    
    const handleReject = () => {
        if (confirm('Are you sure you want to reject this invitation? This action cannot be undone.')) {
            router.post(`/invitations/reject/${(props as any).token || ''}`, {}, {
                onSuccess: () => {
                    router.visit('/');
                },
            });
        }
    };

    return (
        <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
            <Head title="Accept Invitation" />
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">You're Invited!</CardTitle>
                    <CardDescription>
                        You've been invited to join <strong>{invitation.company.name}</strong> as{' '}
                        <strong>{invitation.role.toUpperCase()}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="flex items-start gap-3">
                            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                                <p className="font-medium">{invitation.company.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    Invited as {invitation.role.toUpperCase()}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">{invitation.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Show credentials if invitation is accepted */}
                    {pagePassword ? (
                        <>
                            <Alert className="border-success/50 bg-success/5">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                <AlertDescription>
                                    {pageMessage || 'Your CEO account has been created successfully!'}
                                </AlertDescription>
                            </Alert>
                            
                            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
                                <h3 className="font-semibold text-sm">Your Login Credentials:</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Email:</p>
                                        <p className="font-mono text-sm font-medium">{invitation.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Password:</p>
                                        <p className="font-mono text-sm font-medium bg-background px-2 py-1 rounded border">{pagePassword}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-3">
                                    <strong>Important:</strong> Login credentials have also been sent to your email. Please change your password after first login.
                                </p>
                            </div>
                            
                            <Button onClick={handleAccept} className="w-full" size="lg">
                                Go to Login
                            </Button>
                        </>
                    ) : (
                        <>
                            <Alert>
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertDescription>
                                    As {invitation.role.toUpperCase()}, you will be able to:
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        <li>Review and modify company information</li>
                                        <li>Complete the Management Philosophy Survey</li>
                                        <li>Collaborate on the HR project with the HR Manager</li>
                                    </ul>
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Button onClick={handleAccept} className="w-full" size="lg">
                                    Accept Invitation
                                </Button>
                                <Button 
                                    onClick={handleReject} 
                                    variant="outline" 
                                    className="w-full" 
                                    size="lg"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject Invitation
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    Click to accept. Your CEO account will be created automatically and login credentials will be sent to your email.
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
