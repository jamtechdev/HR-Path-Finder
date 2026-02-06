import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, Building2, Briefcase, Users, Settings, MessageSquare, FileText, Check, Upload, X, BriefcaseBusiness, Network, AlertTriangle, UserCog, Image as ImageIcon } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import RoleBasedSidebar from '@/components/Sidebar/RoleBasedSidebar';
import AppHeader from '@/components/Header/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DiagnosisHeader from '@/components/Diagnosis/DiagnosisHeader';
import DiagnosisProgressBar from '@/components/Diagnosis/DiagnosisProgressBar';
import DiagnosisTabs, { TabId } from '@/components/Diagnosis/DiagnosisTabs';
import { diagnosisTabs } from '@/config/diagnosisTabs';

interface Company {
    id: number;
    name: string;
}

interface OrganizationalChart {
    id?: number;
    chart_year_month: string;
    file_path?: string | null;
    file_name?: string | null;
}

interface Project {
    id: number;
    status: string;
    organizational_charts?: OrganizationalChart[];
    job_grades?: { id?: number } | null;
}

interface PageProps {
    company?: Company | null;
    project?: Project | null;
}

export default function OrganizationalCharts({ company, project }: PageProps) {
    const basePath = '/hr-manager/diagnosis';
    
    // Load from localStorage or use project data
    const getStoredData = (key: string, defaultValue: any) => {
        if (typeof window === 'undefined') return defaultValue;
        try {
            const stored = localStorage.getItem(`diagnosis_form_${key}`);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading from localStorage:', e);
        }
        return defaultValue;
    };

    // Save to localStorage
    const saveToLocalStorage = (key: string, data: any) => {
        if (typeof window === 'undefined') return;
        try {
            // Don't store File objects directly
            const dataToStore = { ...data };
            Object.keys(dataToStore).forEach(k => {
                if (dataToStore[k] instanceof File) delete dataToStore[k];
            });
            localStorage.setItem(`diagnosis_form_${key}`, JSON.stringify(dataToStore));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    };

    // Get stored charts data
    const storedCharts = getStoredData('organizational-charts', []);
    // Ensure existingCharts is always an array
    const projectCharts = Array.isArray(project?.organizational_charts) ? project.organizational_charts : [];
    const storedChartsArray = Array.isArray(storedCharts) ? storedCharts : [];
    const existingCharts = projectCharts.length > 0 ? projectCharts : storedChartsArray;
    
    // Helper function to normalize year-month format (handles both 2023.12 and 2023-12)
    const normalizeYearMonth = (ym: string): string => {
        return ym.replace('.', '-');
    };
    
    // Helper function to find chart by year-month (handles both formats)
    const findChart = (yearMonth: string) => {
        const normalized = normalizeYearMonth(yearMonth);
        return existingCharts.find((c: any) => {
            const chartYM = c.chart_year_month || '';
            return normalizeYearMonth(chartYM) === normalized || chartYM === yearMonth || chartYM === yearMonth.replace('-', '.');
        });
    };
    
    const chartsData = [
        { yearMonth: '2023-12', label: '2023.12', existing: findChart('2023-12') },
        { yearMonth: '2024-12', label: '2024.12', existing: findChart('2024-12') },
        { yearMonth: '2025-12', label: '2025.12', existing: findChart('2025-12') },
    ];

    const [fileInputs, setFileInputs] = useState<{ [key: string]: File | null }>({
        '2023-12': null,
        '2024-12': null,
        '2025-12': null,
    });

    const [filePreviews, setFilePreviews] = useState<{ [key: string]: string | null }>({});

    const form = useForm({
        organizational_charts: [] as Array<{ chart_year_month: string; file: File | null }>,
    });

    // Load existing chart images when component mounts
    useEffect(() => {
        const loadExistingImages = () => {
            chartsData.forEach((chart) => {
                if (chart.existing?.file_path) {
                    const filePath = chart.existing.file_path;
                    // Backend already formats file_path with Storage::url() or asset()
                    // Use the path as provided (should already be a full URL or /storage/ path)
                    // If it's already a full URL or starts with /, use as is
                    // Otherwise, prepend /storage/
                    const imageUrl = filePath.startsWith('http') || filePath.startsWith('/') 
                        ? filePath 
                        : `/storage/${filePath}`;
                    setFilePreviews(prev => ({ ...prev, [chart.yearMonth]: imageUrl }));
                }
            });
        };
        loadExistingImages();
    }, [project, company, existingCharts.length]);

    // Save to localStorage whenever files change
    useEffect(() => {
        const timer = setTimeout(() => {
            const chartsToSave = chartsData.map(chart => ({
                chart_year_month: chart.yearMonth,
                file_path: chart.existing?.file_path || null,
                file_name: chart.existing?.file_name || (fileInputs[chart.yearMonth]?.name || null),
            })).filter(c => c.file_name || c.file_path);
            if (chartsToSave.length > 0) {
                saveToLocalStorage('organizational-charts', chartsToSave);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [fileInputs]);

    const handleFileChange = (yearMonth: string, file: File | null) => {
        setFileInputs(prev => ({ ...prev, [yearMonth]: file }));
        
        // Create preview for image files
        if (file && typeof window !== 'undefined') {
            const isImage = file.type.startsWith('image/');
            if (isImage) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreviews(prev => ({ ...prev, [yearMonth]: reader.result as string }));
                };
                reader.readAsDataURL(file);
            } else {
                setFilePreviews(prev => ({ ...prev, [yearMonth]: null }));
            }
            
            try {
                // Store file reference using FileReader to convert to base64 (for temporary storage)
                const reader = new FileReader();
                reader.onloadend = () => {
                    sessionStorage.setItem(`org_chart_file_${yearMonth}`, reader.result as string);
                    sessionStorage.setItem(`org_chart_file_name_${yearMonth}`, file.name);
                    sessionStorage.setItem(`org_chart_file_type_${yearMonth}`, file.type);
                };
                reader.readAsDataURL(file);
            } catch (e) {
                console.error('Error storing file:', e);
            }
        } else if (!file && typeof window !== 'undefined') {
            // Remove file from sessionStorage if cleared
            setFilePreviews(prev => ({ ...prev, [yearMonth]: null }));
            sessionStorage.removeItem(`org_chart_file_${yearMonth}`);
            sessionStorage.removeItem(`org_chart_file_name_${yearMonth}`);
            sessionStorage.removeItem(`org_chart_file_type_${yearMonth}`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // If company exists and files are uploaded, submit them immediately
        const hasNewFiles = Object.values(fileInputs).some(f => f !== null);
        
        if (company && hasNewFiles) {
            const formData = new FormData();
            
            // Add files to formData
            Object.keys(fileInputs).forEach(yearMonth => {
                const file = fileInputs[yearMonth];
                if (file) {
                    // Convert format: 2023-12 -> org_chart_2023_12
                    const normalized = yearMonth.replace('-', '_');
                    const fieldName = `org_chart_${normalized}`;
                    formData.append(fieldName, file);
                }
            });
            
            // Submit files to backend
            router.post(`/hr-manager/diagnosis/${company.id}/organizational-charts`, formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Prepare charts data for localStorage
                    const chartsToSave = chartsData.map(chart => ({
                        chart_year_month: chart.yearMonth,
                        file_path: chart.existing?.file_path || null,
                        file_name: chart.existing?.file_name || (fileInputs[chart.yearMonth]?.name || null),
                        has_file: !!fileInputs[chart.yearMonth],
                    })).filter(c => c.has_file || c.file_path);
                    
                    saveToLocalStorage('organizational-charts', chartsToSave);
                    
                    // Navigate to next step
                    router.visit(`${basePath}/organizational-structure`);
                },
                onError: (errors) => {
                    console.error('Error saving organizational charts:', errors);
                    alert('There was an error saving the charts. Please try again.');
                },
            });
        } else {
            // No company or no new files, just save to localStorage and navigate
            const chartsToSave = chartsData.map(chart => ({
                chart_year_month: chart.yearMonth,
                file_path: chart.existing?.file_path || null,
                file_name: chart.existing?.file_name || (fileInputs[chart.yearMonth]?.name || null),
                has_file: !!fileInputs[chart.yearMonth],
            })).filter(c => c.has_file || c.file_path);
            
            saveToLocalStorage('organizational-charts', chartsToSave);
            
            // Navigate to next step
            router.visit(`${basePath}/organizational-structure`);
        }
    };

    // Calculate step completion status from localStorage
    const checkStepComplete = (key: string): boolean => {
        if (typeof window === 'undefined') return false;
        try {
            const stored = localStorage.getItem(`diagnosis_form_${key}`);
            if (!stored || stored === '{}' || stored === 'null') return false;
            const data = JSON.parse(stored);
            if (Array.isArray(data)) {
                return data.length > 0;
            }
            return Object.keys(data).length > 0 && Object.values(data).some(v => v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true));
        } catch {
            return false;
        }
    };

    const hasCharts = Object.values(fileInputs).some(f => f !== null) || existingCharts.length > 0;

    const stepStatus = {
        'company-info': checkStepComplete('company'),
        'business-profile': checkStepComplete('business-profile'),
        'workforce': checkStepComplete('workforce'),
        'executives': checkStepComplete('executives'),
        'job-grades': checkStepComplete('job-grades'),
        'organizational-charts': hasCharts,
        'organizational-structure': checkStepComplete('organizational-structure'),
        'hr-issues': checkStepComplete('hr-issues'),
        'current-hr': checkStepComplete('current-hr'),
        'culture': checkStepComplete('culture'),
        'confidential': checkStepComplete('confidential'),
        'review': false,
    };

    const stepOrder = ['company-info', 'business-profile', 'workforce', 'executives', 'job-grades', 'organizational-charts', 'organizational-structure', 'hr-issues', 'current-hr', 'culture', 'confidential', 'review'] as const;
    const completedSteps = Object.values(stepStatus).filter(Boolean).length;
    const totalSteps = 12;

    const status: 'not_started' | 'in_progress' | 'submitted' = 'not_started';

    // Use shared tabs configuration
    const tabs = diagnosisTabs;

    return (
        <SidebarProvider defaultOpen={true}>
            <Sidebar collapsible="icon" variant="sidebar">
                <RoleBasedSidebar />
            </Sidebar>
            <SidebarInset className="flex flex-col overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-auto">
                    <Head title="Organizational Charts - Diagnosis" />

                    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
                        <DiagnosisHeader
                            title="Step 1: Diagnosis"
                            description="Input company information and organizational context"
                            status={status}
                            backHref={`${basePath}/job-grades`}
                        />

                        <DiagnosisProgressBar
                            stepName="Organizational Charts"
                            completedSteps={completedSteps}
                            totalSteps={totalSteps}
                            currentStep={7}
                        />

                        <DiagnosisTabs
                            tabs={tabs}
                            activeTab="organizational-charts"
                            stepStatus={stepStatus}
                            stepOrder={stepOrder}
                            projectId={null}
                        />

                        <Card>
                            <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-6">
                                    {chartsData.map((chart) => {
                                        const file = fileInputs[chart.yearMonth];
                                        const existing = chart.existing;
                                        const inputId = `org_chart_${chart.yearMonth}`;

                                        return (
                                            <div key={chart.yearMonth} className="space-y-2">
                                                <Label htmlFor={inputId}>Upload Organizational Chart for {chart.label}</Label>
                                                <label
                                                    htmlFor={inputId}
                                                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block"
                                                >
                                                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                                                    <p className="text-sm text-muted-foreground">
                                                        Click to upload or drag and drop
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 5MB</p>
                                                    {(() => {
                                                        // Determine which image to show: prioritize new file preview, then existing file
                                                        let imageUrl: string | null = null;
                                                        if (filePreviews[chart.yearMonth]) {
                                                            imageUrl = filePreviews[chart.yearMonth];
                                                        } else if (existing && !file && existing.file_path) {
                                                            // Check if it's an image file
                                                            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(existing.file_path);
                                                            if (isImage) {
                                                                // Build proper storage URL
                                                                imageUrl = existing.file_path.startsWith('http') 
                                                                    ? existing.file_path 
                                                                    : existing.file_path.startsWith('/storage/') || existing.file_path.startsWith('/')
                                                                    ? existing.file_path
                                                                    : `/storage/${existing.file_path}`;
                                                            }
                                                        }
                                                        
                                                        return imageUrl ? (
                                                            <div className="mt-4">
                                                                <img 
                                                                    src={imageUrl}
                                                                    alt={`Preview for ${chart.label}`}
                                                                    className="w-full max-w-md mx-auto h-48 object-contain rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                                    onClick={() => {
                                                                        if (imageUrl) {
                                                                            if (imageUrl.startsWith('data:')) {
                                                                                // For data URLs, open in new window
                                                                                const newWindow = window.open();
                                                                                if (newWindow) {
                                                                                    newWindow.document.write(`<img src="${imageUrl}" style="max-width: 100%; height: auto;" />`);
                                                                                }
                                                                            } else {
                                                                                window.open(imageUrl, '_blank');
                                                                            }
                                                                        }
                                                                    }}
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.style.display = 'none';
                                                                        const parent = target.parentElement;
                                                                        if (parent) {
                                                                            const errorDiv = document.createElement('div');
                                                                            errorDiv.className = 'w-full max-w-md mx-auto h-48 bg-muted rounded border flex items-center justify-center';
                                                                            errorDiv.innerHTML = '<p class="text-xs text-muted-foreground">Image not available</p>';
                                                                            parent.appendChild(errorDiv);
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : null;
                                                    })()}
                                                    {file && (
                                                        <div className="mt-2 flex items-center justify-center gap-2">
                                                            <p className="text-xs text-muted-foreground">
                                                                Selected: {file.name}
                                                            </p>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-4 w-4"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleFileChange(chart.yearMonth, null);
                                                                }}
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {existing && !file && (
                                                        <div className="mt-4">
                                                            <p className="text-xs text-muted-foreground mb-2">
                                                                Current chart uploaded: {existing.file_name || 'File'}
                                                            </p>
                                                            {existing.file_path && /\.(jpg|jpeg|png|gif|webp)$/i.test(existing.file_path) && (
                                                                <div className="mt-2">
                                                                    <img 
                                                                        src={existing.file_path.startsWith('http') || existing.file_path.startsWith('/') 
                                                                            ? existing.file_path 
                                                                            : `/storage/${existing.file_path}`}
                                                                        alt={existing.file_name || 'Chart'}
                                                                        className="w-full max-w-md mx-auto h-48 object-contain rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                                                        onClick={() => {
                                                                            const url = existing.file_path.startsWith('http') || existing.file_path.startsWith('/') 
                                                                                ? existing.file_path 
                                                                                : `/storage/${existing.file_path}`;
                                                                            window.open(url, '_blank');
                                                                        }}
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.style.display = 'none';
                                                                            const parent = target.parentElement;
                                                                            if (parent) {
                                                                                const errorDiv = document.createElement('div');
                                                                                errorDiv.className = 'w-full max-w-md mx-auto h-48 bg-muted rounded border flex items-center justify-center';
                                                                                errorDiv.innerHTML = '<p class="text-xs text-muted-foreground">Image not available</p>';
                                                                                parent.appendChild(errorDiv);
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                            {existing.file_path && !/\.(jpg|jpeg|png|gif|webp)$/i.test(existing.file_path) && (
                                                                <div className="w-full max-w-md mx-auto h-48 bg-muted rounded border flex items-center justify-center">
                                                                    <FileText className="w-12 h-12 text-muted-foreground" />
                                                                    <p className="text-xs text-muted-foreground ml-2">{existing.file_name || 'PDF File'}</p>
                                                                </div>
                                                            )}
                                                            {existing.file_path && (
                                                                <a 
                                                                    href={existing.file_path.startsWith('http') || existing.file_path.startsWith('/') 
                                                                        ? existing.file_path 
                                                                        : `/storage/${existing.file_path}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-primary hover:underline mt-2 block text-center"
                                                                >
                                                                    View Current File
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </label>
                                                <Input
                                                    id={inputId}
                                                    type="file"
                                                    accept=".pdf,.png,.jpg,.jpeg"
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(chart.yearMonth, e.target.files?.[0] || null)}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit(`${basePath}/job-grades`)}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={form.processing}>
                                        {form.processing ? 'Saving...' : 'Next'}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
