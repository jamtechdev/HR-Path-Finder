import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Building2, UserPlus, Mail, Users, CheckCircle2, XCircle, Clock, ChevronDown, ChevronRight, Plus, FileText } from 'lucide-react';

interface CEO {
    id: number;
    name: string;
    email: string;
    status: string;
}

interface Invitation {
    id: number;
    email: string;
    status: 'pending' | 'accepted' | 'rejected';
    invited_by: {
        id: number;
        name: string;
    } | null;
    invited_at: string;
    accepted_at: string | null;
    rejected_at: string | null;
    expires_at: string | null;
}

interface Company {
    id: number;
    name: string;
    registration_number?: string;
    hq_location?: string;
    public_listing_status: string;
    hasCeo: boolean;
    ceos: CEO[];
    invitations: Invitation[];
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
    const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(new Set());
    
    const { flash } = usePage().props as any;
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        hr_project_id: null as number | null,
    });

    const toggleCompany = (companyId: number) => {
        const newExpanded = new Set(expandedCompanies);
        if (newExpanded.has(companyId)) {
            newExpanded.delete(companyId);
        } else {
            newExpanded.add(companyId);
        }
        setExpandedCompanies(newExpanded);
    };

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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
            case 'pending':
                return <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'accepted':
                return <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Accepted</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title="Companies - HR Manager" />
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">My Companies</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your companies and CEO assignments
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
                    <div className="space-y-4">
                        {companies.map((company) => {
                            const isExpanded = expandedCompanies.has(company.id);
                            const allCeos = [...company.ceos, ...company.invitations.filter(inv => inv.status === 'accepted').map(inv => ({
                                id: 0,
                                name: 'Invited User',
                                email: inv.email,
                                status: 'accepted' as const,
                            }))];
                            const totalAssignments = allCeos.length + company.invitations.filter(inv => inv.status !== 'accepted').length;
                            
                            return (
                                <Card key={company.id} className="overflow-hidden">
                                    <Collapsible open={isExpanded} onOpenChange={() => toggleCompany(company.id)}>
                                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <CollapsibleTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                    <div className="flex-1">
                                                        <CardTitle className="text-xl">{company.name}</CardTitle>
                                                        <CardDescription className="mt-1">
                                                            {company.registration_number && `Reg: ${company.registration_number} • `}
                                                            {company.hq_location && `${company.hq_location} • `}
                                                            {company.public_listing_status}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium">
                                                            {totalAssignments} {totalAssignments === 1 ? 'CEO' : 'CEOs'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {company.ceos.length} Active
                                                        </div>
                                                    </div>
                                                    {!company.hasCeo && (
                                                        <Button
                                                            onClick={() => openInviteDialog(company)}
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <UserPlus className="w-4 h-4 mr-2" />
                                                            Invite CEO
                                                        </Button>
                                                    )}
                                                    <Link href={`/companies/${company.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            View Details
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CollapsibleContent>
                                            <CardContent className="pt-0">
                                                <Tabs defaultValue="ceos" className="w-full">
                                                    <TabsList className="grid w-full grid-cols-2">
                                                        <TabsTrigger value="ceos">
                                                            Assigned CEOs ({company.ceos.length})
                                                        </TabsTrigger>
                                                        <TabsTrigger value="invitations">
                                                            Invitations ({company.invitations.length})
                                                        </TabsTrigger>
                                                    </TabsList>
                                                    
                                                    <TabsContent value="ceos" className="mt-4">
                                                        {company.ceos.length > 0 ? (
                                                            <div className="border rounded-lg overflow-hidden">
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead>Name</TableHead>
                                                                            <TableHead>Email</TableHead>
                                                                            <TableHead>Status</TableHead>
                                                                            <TableHead>Actions</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {company.ceos.map((ceo) => (
                                                                            <TableRow key={ceo.id}>
                                                                                <TableCell className="font-medium">{ceo.name}</TableCell>
                                                                                <TableCell>{ceo.email}</TableCell>
                                                                                <TableCell>{getStatusBadge(ceo.status)}</TableCell>
                                                                                <TableCell>
                                                                                    <Link href={`/companies/${company.id}`}>
                                                                                        <Button variant="ghost" size="sm">View</Button>
                                                                                    </Link>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-8 text-muted-foreground">
                                                                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                                <p>No CEOs assigned yet</p>
                                                                <Button
                                                                    onClick={() => openInviteDialog(company)}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="mt-4"
                                                                >
                                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                                    Invite CEO
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TabsContent>
                                                    
                                                    <TabsContent value="invitations" className="mt-4">
                                                        {company.invitations.length > 0 ? (
                                                            <div className="border rounded-lg overflow-hidden">
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead>Email</TableHead>
                                                                            <TableHead>Status</TableHead>
                                                                            <TableHead>Invited By</TableHead>
                                                                            <TableHead>Invited At</TableHead>
                                                                            <TableHead>Expires At</TableHead>
                                                                            <TableHead>Accepted/Rejected At</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {company.invitations.map((invitation) => (
                                                                            <TableRow key={invitation.id}>
                                                                                <TableCell className="font-medium">{invitation.email}</TableCell>
                                                                                <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                                                                                <TableCell>{invitation.invited_by?.name || 'N/A'}</TableCell>
                                                                                <TableCell>{formatDate(invitation.invited_at)}</TableCell>
                                                                                <TableCell>{formatDate(invitation.expires_at)}</TableCell>
                                                                                <TableCell>
                                                                                    {invitation.accepted_at 
                                                                                        ? formatDate(invitation.accepted_at)
                                                                                        : invitation.rejected_at 
                                                                                            ? formatDate(invitation.rejected_at)
                                                                                            : 'N/A'}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-8 text-muted-foreground">
                                                                <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                                <p>No invitations sent yet</p>
                                                            </div>
                                                        )}
                                                    </TabsContent>
                                                </Tabs>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Invite CEO Dialog */}
                {selectedCompany && (
                    <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Invite CEO for {selectedCompany.name}</DialogTitle>
                                <DialogDescription>
                                    {selectedCompany.activeProject 
                                        ? `Invite a CEO to join ${selectedCompany.name} and complete the Management Philosophy Survey for this HR project. The CEO will receive an invitation email and can accept it.`
                                        : `Invite a CEO to join ${selectedCompany.name}. The CEO will receive an invitation email and can accept it. Once you create a project, the CEO will be assigned to it.`}
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
            </div>
        </AppLayout>
    );
}
