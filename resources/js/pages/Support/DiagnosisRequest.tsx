import { Head, useForm } from '@inertiajs/react';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileText, Send } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function DiagnosisRequest() {
    const { data, setData, post, processing } = useForm({
        company_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        company_size: '',
        industry: '',
        request_details: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        // This is UI only - no actual submission in MVP
        alert('This is a demonstration feature. In the full version, this request will be sent to consultants for review.');
    };

    return (
        <div className="flex h-screen bg-background">
            <RoleBasedSidebar />

            <main className="flex-1 overflow-auto md:pt-0 pt-14">
                <Head title="Request Organizational Diagnosis" />

                <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-8 h-8 text-primary" />
                            <h1 className="text-3xl font-display font-bold tracking-tight">
                                Request Organizational Diagnosis
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Request a comprehensive organizational diagnosis from our consultant team
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 italic">
                            Note: This is a demonstration feature. Actual diagnosis requests will be processed in future versions.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Diagnosis Request Form</CardTitle>
                            <CardDescription>
                                Fill out the form below to request an organizational diagnosis. Our consultants will
                                review your request and contact you to schedule a consultation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="company_name">Company Name *</Label>
                                        <Input
                                            id="company_name"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            required
                                            placeholder="Your Company Name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="industry">Industry *</Label>
                                        <Input
                                            id="industry"
                                            value={data.industry}
                                            onChange={(e) => setData('industry', e.target.value)}
                                            required
                                            placeholder="e.g., Technology, Manufacturing"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_name">Contact Name *</Label>
                                        <Input
                                            id="contact_name"
                                            value={data.contact_name}
                                            onChange={(e) => setData('contact_name', e.target.value)}
                                            required
                                            placeholder="Your Full Name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_email">Contact Email *</Label>
                                        <Input
                                            id="contact_email"
                                            type="email"
                                            value={data.contact_email}
                                            onChange={(e) => setData('contact_email', e.target.value)}
                                            required
                                            placeholder="your.email@company.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_phone">Contact Phone</Label>
                                        <Input
                                            id="contact_phone"
                                            type="tel"
                                            value={data.contact_phone}
                                            onChange={(e) => setData('contact_phone', e.target.value)}
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company_size">Company Size *</Label>
                                        <Input
                                            id="company_size"
                                            value={data.company_size}
                                            onChange={(e) => setData('company_size', e.target.value)}
                                            required
                                            placeholder="e.g., 50-100 employees"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="request_details">Request Details *</Label>
                                    <Textarea
                                        id="request_details"
                                        value={data.request_details}
                                        onChange={(e) => setData('request_details', e.target.value)}
                                        required
                                        placeholder="Please describe what type of organizational diagnosis you're seeking and any specific areas of concern..."
                                        rows={6}
                                        className="resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Provide details about your organization, current challenges, and what you hope to
                                        achieve through the diagnosis.
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="submit" disabled={processing} className="flex-1">
                                        {processing ? (
                                            'Submitting...'
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                Submit Request
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <p className="text-xs text-muted-foreground text-center">
                                    By submitting this form, you agree to be contacted by our consultant team regarding
                                    your diagnosis request.
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
