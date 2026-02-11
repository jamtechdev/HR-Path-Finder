import React, { FormEventHandler, useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Upload, MapPin, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CreateCompany() {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        registration_number: '',
        hq_location: '',
        public_listing_status: 'private',
        logo: null as File | null,
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('logo', file);
        
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setLogoPreview(null);
        }
    };

    const removeLogo = () => {
        setData('logo', null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/companies', {
            forceFormData: true,
            onSuccess: () => {
                // Reset preview on success
                setLogoPreview(null);
            },
        });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-muted/30">
                    <Head title="Create Company Workspace" />
                    <div className="p-6 md:p-8 max-w-5xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Create Company Workspace</h1>
                                    <p className="text-muted-foreground mt-1">
                                        Set up your company profile to begin building your HR system
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Card className="shadow-lg border-border/50">
                            <CardHeader className="border-b border-border/50">
                                <CardTitle className="text-xl">Company Information</CardTitle>
                                <CardDescription>
                                    Provide your company details to get started. All fields marked with * are required.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={submit} className="space-y-6">
                                    {/* Company Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-primary" />
                                            Company Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter your company name"
                                            className={cn(
                                                "h-11",
                                                errors.name && "border-destructive focus-visible:ring-destructive"
                                            )}
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Registration Number and HQ Location - Side by Side */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="registration_number" className="text-sm font-semibold flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                Registration Number
                                            </Label>
                                            <Input
                                                id="registration_number"
                                                value={data.registration_number}
                                                onChange={(e) => setData('registration_number', e.target.value)}
                                                placeholder="e.g., 123-45-67890"
                                                className={cn(
                                                    "h-11",
                                                    errors.registration_number && "border-destructive focus-visible:ring-destructive"
                                                )}
                                            />
                                            {errors.registration_number && (
                                                <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {errors.registration_number}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Optional: Your company's official registration number
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="hq_location" className="text-sm font-semibold flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                                Headquarters Location
                                            </Label>
                                            <Input
                                                id="hq_location"
                                                value={data.hq_location}
                                                onChange={(e) => setData('hq_location', e.target.value)}
                                                placeholder="e.g., New York, USA"
                                                className={cn(
                                                    "h-11",
                                                    errors.hq_location && "border-destructive focus-visible:ring-destructive"
                                                )}
                                            />
                                            {errors.hq_location && (
                                                <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {errors.hq_location}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Optional: Your company's headquarters location
                                            </p>
                                        </div>
                                    </div>

                                    {/* Public Listing Status */}
                                    <div className="space-y-2">
                                        <Label htmlFor="public_listing_status" className="text-sm font-semibold">
                                            Public Listing Status *
                                        </Label>
                                        <Select
                                            value={data.public_listing_status}
                                            onValueChange={(value) => setData('public_listing_status', value)}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="public">Public Company</SelectItem>
                                                <SelectItem value="private">Private Company</SelectItem>
                                                <SelectItem value="not_applicable">Not Applicable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.public_listing_status && (
                                            <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.public_listing_status}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Select whether your company is publicly listed on a stock exchange
                                        </p>
                                    </div>

                                    {/* Logo Upload with Preview */}
                                    <div className="space-y-2">
                                        <Label htmlFor="logo" className="text-sm font-semibold flex items-center gap-2">
                                            <Upload className="w-4 h-4 text-muted-foreground" />
                                            Company Logo
                                        </Label>
                                        <div className="space-y-4">
                                            {logoPreview ? (
                                                <div className="relative inline-block">
                                                    <div className="relative w-32 h-32 rounded-lg border-2 border-border overflow-hidden bg-muted">
                                                        <img
                                                            src={logoPreview}
                                                            alt="Logo preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={removeLogo}
                                                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="relative border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors cursor-pointer bg-muted/30 hover:bg-muted/50"
                                                >
                                                    <div className="flex flex-col items-center justify-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <Upload className="w-6 h-6 text-primary" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm font-medium text-foreground">
                                                                Click to upload logo
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                PNG, JPG, or GIF (max 5MB)
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <input
                                                ref={fileInputRef}
                                                id="logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="hidden"
                                            />
                                            {!logoPreview && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full sm:w-auto"
                                                >
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Choose File
                                                </Button>
                                            )}
                                        </div>
                                        {errors.logo && (
                                            <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {errors.logo}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Optional: Upload your company logo. Recommended size: 200x200px or larger
                                        </p>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-border/50">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => window.history.back()}
                                            disabled={processing}
                                            className="w-full sm:w-auto"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full sm:w-auto min-w-[140px]"
                                        >
                                            {processing ? (
                                                <>
                                                    <span className="animate-spin mr-2">⏳</span>
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Create Company
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Info Card */}
                        <Card className="mt-6 bg-primary/5 border-primary/20">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <FileText className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground mb-1">
                                            What happens next?
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            After creating your company workspace, you'll be able to start the diagnosis process and begin building your comprehensive HR system.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
