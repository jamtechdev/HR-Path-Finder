import AppHeader from '@/components/Header/AppHeader';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sidebar,
    SidebarInset,
    SidebarProvider,
} from '@/components/ui/sidebar';
import { Spinner } from '@/components/ui/spinner';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { clearInertiaFieldError } from '@/lib/inertiaFormLiveErrors';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export default function CreateCompany() {
    const { t } = useTranslation();
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const submitInFlight = useRef(false);

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        name: '',
        registration_number: '',
        hq_location: '',
        public_listing_status: 'private',
        logo: null as File | null,
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (file) {
            const validTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'image/webp',
            ];
            if (!validTypes.includes(file.type)) {
                alert(t('companies_create.alert_invalid_image'));
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert(t('companies_create.alert_file_size'));
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            setData('logo', file);
            clearInertiaFieldError(clearErrors, 'logo');

            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setData('logo', null);
            clearInertiaFieldError(clearErrors, 'logo');
            setLogoPreview(null);
        }
    };

    const removeLogo = () => {
        setData('logo', null);
        clearInertiaFieldError(clearErrors, 'logo');
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (processing || submitInFlight.current) return;

        submitInFlight.current = true;
        toast({ title: t('companies_create.creating_toast') });
        post('/hr-manager/companies', {
            forceFormData: true,
            onSuccess: () => {
                setLogoPreview(null);
                toast({
                    title: t('companies_create.success_title'),
                    description: t('companies_create.success_desc'),
                    variant: 'success',
                });
                router.get('/hr-manager/dashboard', {}, { replace: true });
            },
            onError: (errs) => {
                if (errs.logo && String(errs.logo).includes('too large')) {
                    alert(t('companies_create.alert_file_size'));
                }
            },
            onFinish: () => (submitInFlight.current = false),
        });
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <Toaster />
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-muted/30">
               
                    <Head title={t('companies_create.page_title')} />
                    <div className="p-6 md:p-8 max-w-5xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8">
                            <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <Building2 className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">{t('companies_create.heading')}</h1>
                                    <p className="text-muted-foreground mt-1">
                                        {t('companies_create.subheading')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Company Form Card */}
                        <Card className="border-border/50 shadow-lg">
                            <CardHeader className="border-b border-border/50">
                                <CardTitle className="text-xl">{t('companies_create.info_title')}</CardTitle>
                                <CardDescription>
                                    {t('companies_create.info_desc')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={submit} className="space-y-6">
                                    {/* Company Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-primary" />
                                            {t('companies_create.fields.company_name')}
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => {
                                                setData('name', e.target.value);
                                                clearInertiaFieldError(
                                                    clearErrors,
                                                    'name',
                                                );
                                            }}
                                            placeholder={t('companies_create.fields.company_name_placeholder')}
                                            className={cn(
                                                'h-11',
                                                errors.name &&
                                                    'border-destructive focus-visible:ring-destructive',
                                            )}
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Registration & HQ */}
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="registration_number" className="text-sm font-semibold flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                {t('companies_create.fields.registration_number')}
                                            </Label>
                                            <Input
                                                id="registration_number"
                                                value={data.registration_number}
                                                onChange={(e) => {
                                                    setData(
                                                        'registration_number',
                                                        e.target.value,
                                                    );
                                                    clearInertiaFieldError(
                                                        clearErrors,
                                                        'registration_number',
                                                    );
                                                }}
                                                placeholder={t('companies_create.fields.registration_number_placeholder')}
                                                className={cn(
                                                    'h-11',
                                                    errors.registration_number &&
                                                        'border-destructive focus-visible:ring-destructive',
                                                )}
                                            />
                                            {errors.registration_number && (
                                                <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.registration_number}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {t('companies_create.fields.registration_number_help')}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="hq_location" className="text-sm font-semibold flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                                {t('companies_create.fields.hq_location')}
                                            </Label>
                                            <Input
                                                id="hq_location"
                                                value={data.hq_location}
                                                onChange={(e) => {
                                                    setData(
                                                        'hq_location',
                                                        e.target.value,
                                                    );
                                                    clearInertiaFieldError(
                                                        clearErrors,
                                                        'hq_location',
                                                    );
                                                }}
                                                placeholder={t('companies_create.fields.hq_location_placeholder')}
                                                className={cn(
                                                    'h-11',
                                                    errors.hq_location &&
                                                        'border-destructive focus-visible:ring-destructive',
                                                )}
                                            />
                                            {errors.hq_location && (
                                                <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.hq_location}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {t('companies_create.fields.hq_location_help')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Public Listing */}
                                    <div className="space-y-2">
                                        <Label htmlFor="public_listing_status" className="text-sm font-semibold">
                                            {t('companies_create.fields.public_listing_status')}
                                        </Label>
                                        <Select
                                            value={data.public_listing_status}
                                            onValueChange={(value) => {
                                                setData(
                                                    'public_listing_status',
                                                    value,
                                                );
                                                clearInertiaFieldError(
                                                    clearErrors,
                                                    'public_listing_status',
                                                );
                                            }}
                                        >
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="public">{t('companies_create.fields.public_company')}</SelectItem>
                                                <SelectItem value="private">{t('companies_create.fields.private_company')}</SelectItem>
                                                <SelectItem value="not_applicable">{t('companies_create.fields.not_applicable')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.public_listing_status && (
                                            <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.public_listing_status}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t('companies_create.fields.public_listing_help')}
                                        </p>
                                    </div>

                                    {/* Logo */}
                                    <div className="space-y-2">
                                        <Label htmlFor="logo" className="text-sm font-semibold flex items-center gap-2">
                                            <Upload className="w-4 h-4 text-muted-foreground" />
                                            {t('companies_create.fields.company_logo')}
                                        </Label>
                                        <div className="space-y-4">
                                            {logoPreview ? (
                                                <div className="relative inline-block">
                                                    <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-border bg-muted">
                                                        <img
                                                            src={logoPreview}
                                                            alt="Logo preview"
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={removeLogo}
                                                            className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                    className="relative cursor-pointer rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
                                                >
                                                    <div className="flex flex-col items-center justify-center gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                                            <Upload className="h-6 w-6 text-primary" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm font-medium text-foreground">
                                                                {t('companies_create.fields.click_upload')}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {t('companies_create.fields.upload_formats')}
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
                                                    onClick={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                    className="w-full sm:w-auto"
                                                >
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    {t('companies_create.fields.choose_file')}
                                                </Button>
                                            )}
                                        </div>
                                        {errors.logo && (
                                            <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.logo}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {t('companies_create.fields.logo_help')}
                                        </p>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex flex-col items-center justify-end gap-3 border-t border-border/50 pt-6 sm:flex-row">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                window.history.back()
                                            }
                                            disabled={processing}
                                            className="w-full sm:w-auto"
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full min-w-[140px] sm:w-auto"
                                        >
                                            {processing ? (
                                                <>
                                                    <Spinner className="mr-2 h-4 w-4" />
                                                    {t('companies_create.actions.creating')}
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    {t('companies_create.actions.create')}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Info Card */}
                        <Card className="mt-6 border-primary/20 bg-primary/5">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground mb-1">
                                            {t('companies_create.next_title')}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {t('companies_create.next_desc')}
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
