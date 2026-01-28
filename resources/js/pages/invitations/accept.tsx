import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CheckCircle2, AlertCircle, UserPlus } from 'lucide-react';
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
}

export default function AcceptInvitation({ invitation, error, isAuthenticated }: PageProps) {
    const { props } = usePage<PageProps>();
    const user = (props as any).auth?.user;

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
        // If user is authenticated, accept directly by visiting the URL (which will process it)
        if (isAuthenticated && user) {
            // The backend will handle the acceptance when we visit the URL
            window.location.href = `/invitations/accept/${(props as any).token || ''}`;
        } else {
            // Redirect to registration - the token is already stored in session by the backend
            window.location.href = '/register';
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

                    {isAuthenticated ? (
                        <div className="space-y-2">
                            <Button onClick={handleAccept} className="w-full" size="lg">
                                Accept Invitation
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                You're logged in as {user?.email}. Click to accept and join the workspace.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Button onClick={handleAccept} className="w-full" size="lg">
                                Create Account & Accept
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                You'll need to create an account first, then you'll automatically be added to the
                                workspace.
                            </p>
                            <div className="text-center">
                                <Link href="/login" className="text-sm text-primary hover:underline">
                                    Already have an account? Sign in
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
