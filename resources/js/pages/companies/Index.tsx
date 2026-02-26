import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, UserPlus, Mail, Users, CheckCircle2, Copy, Eye, EyeOff, Plus, FileText } from 'lucide-react';

interface Company {
    id: number;
    name: string;
    registration_number?: string;
    hq_location?: string;
    public_listing_status: string;
    hasCeo: boolean;
    ceo?: {
        id: number;
        name: string;
        email: string;
    };
    activeProject?: {
        id: number;
        status: string;
    };
    created_at: string;
}

interface Props {
    companies: Company[];
}

export default function CompaniesIndex({ companies }: Props) {
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showCustomPassword, setShowCustomPassword] = useState(false);
    const [ceoCredentials, setCeoCredentials] = useState<{name: string; email: string; password: string} | null>(null);
    
    const { flash } = usePage().props as any;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        hr_project_id: null as number | null,
    });

    // Check for CEO credentials in flash message
    useEffect(() => {
        if (flash?.ceo_password && flash?.ceo_email && flash?.ceo_name) {
            setCeoCredentials({
                name: flash.ceo_name,
                email: flash.ceo_email,
                password: flash.ceo_password,
            });
            setShowPasswordDialog(true);
            setShowInviteDialog(false);
        }
    }, [flash]);

    const openInviteDialog = (company: Company) => {
        setSelectedCompany(company);
        setData('hr_project_id', company.activeProject?.id || null);
        setShowInviteDialog(true);
    };

    const handleInviteCeo = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCompany) {
            setData('hr_project_id', selectedCompany.activeProject?.id || null);
            post(`/companies/${selectedCompany.id}/invite-ceo`, {
                onSuccess: () => {
                    reset();
                    setShowInviteDialog(false);
                },
            });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const closePasswordDialog = () => {
        setShowPasswordDialog(false);
        setCeoCredentials(null);
        // Reload page to refresh companies list
        window.location.reload();
    };

    return (
        <AppLayout>
            <Head title="Companies - HR Manager" />
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">My Companies</h1>
                                <p className="text-muted-foreground mt-1">
                                    Manage your companies and invite CEOs
                                </p>
                            </div>
                            <Link href="/companies/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Company
                                </Button>
                            </Link>
                        </div>

                        {companies.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Create your first company to get started
                                    </p>
                                    <Link href="/companies/create">
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Company
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {companies.map((company) => (
                                    <Card key={company.id} className="flex flex-col">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-xl">{company.name}</CardTitle>
                                                    {company.registration_number && (
                                                        <CardDescription className="mt-1">
                                                            Reg: {company.registration_number}
                                                        </CardDescription>
                                                    )}
                                                </div>
                                                {company.hasCeo && (
                                                    <Badge variant="outline" className="ml-2">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        CEO
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-4">
                                            <div className="space-y-2 text-sm">
                                                {company.hq_location && (
                                                    <p className="text-muted-foreground">
                                                        <strong>Location:</strong> {company.hq_location}
                                                    </p>
                                                )}
                                                <p className="text-muted-foreground">
                                                    <strong>Status:</strong> {company.public_listing_status}
                                                </p>
                                                {company.ceo && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Users className="w-4 h-4" />
                                                        <span>CEO: {company.ceo.name}</span>
                                                    </div>
                                                )}
                                                {company.activeProject && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <FileText className="w-4 h-4" />
                                                        <span>Active Project</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2 pt-2">
                                                <Link href={`/companies/${company.id}`} className="flex-1">
                                                    <Button variant="outline" className="w-full">
                                                        View Details
                                                    </Button>
                                                </Link>
                                                {!company.hasCeo && (
                                                    <Button
                                                        onClick={() => openInviteDialog(company)}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        <UserPlus className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Invite CEO Dialog */}
                        {selectedCompany && (
                            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Create & Invite CEO for {selectedCompany.name}</DialogTitle>
                                        <DialogDescription>
                                            {selectedCompany.activeProject 
                                                ? `Create a CEO account or invite a CEO to join ${selectedCompany.name} and complete the Management Philosophy Survey for this HR project.`
                                                : `Create a CEO account or invite a CEO to join ${selectedCompany.name}. Once you create a project, the CEO will be assigned to it.`}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleInviteCeo} className="space-y-4">
                                        <div>
                                            <Label htmlFor="ceo-email">CEO Email Address *</Label>
                                            <Input
                                                id="ceo-email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="ceo@example.com"
                                                required
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-destructive mt-1">{errors.email}</p>
                                            )}
                                            {selectedCompany.activeProject && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    This invitation will be linked to the active HR project for {selectedCompany.name}.
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowInviteDialog(false);
                                                    reset();
                                                    setSelectedCompany(null);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                                                {processing ? 'Sending...' : 'Send Invitation'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* Password Display Dialog */}
                        {ceoCredentials && selectedCompany && (
                            <Dialog open={showPasswordDialog} onOpenChange={closePasswordDialog}>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            CEO Account Created Successfully
                                        </DialogTitle>
                                        <DialogDescription>
                                            The CEO account has been created and assigned to {selectedCompany.name}. Please save these credentials securely.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="p-4 bg-muted rounded-lg space-y-3">
                                            <div>
                                                <Label className="text-xs text-muted-foreground uppercase">Name</Label>
                                                <p className="text-sm font-medium mt-1">{ceoCredentials.name}</p>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground uppercase">Email</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-sm font-medium flex-1">{ceoCredentials.email}</p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(ceoCredentials.email)}
                                                        className="h-7 px-2"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-muted-foreground uppercase">Password</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 flex items-center gap-2 p-2 bg-background border rounded-md">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            value={ceoCredentials.password}
                                                            readOnly
                                                            className="border-0 p-0 h-auto font-mono text-sm"
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="h-7 px-2"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="w-3 h-3" />
                                                        ) : (
                                                            <Eye className="w-3 h-3" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(ceoCredentials.password)}
                                                        className="h-7 px-2"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Button onClick={closePasswordDialog}>
                                                Done
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
        </AppLayout>
    );
}
