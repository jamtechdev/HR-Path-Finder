import React, { useEffect, useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FormLayout from '@/components/Diagnosis/FormLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, FileText, Eye, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Diagnosis {
    id: number;
    organizational_charts?: Array<{ year: string; file_url: string }> | Record<string, string>;
}

interface Props {
    project: {
        id: number;
        company: {
            name: string;
        };
    };
    company: {
        name: string;
    };
    diagnosis?: Diagnosis;
    activeTab: string;
    diagnosisStatus: string;
    stepStatuses: Record<string, string>;
    projectId?: number;
}

const REQUIRED_YEARS = ['2023.12', '2024.12', '2025.12'];

export default function OrganizationalCharts({
    project,
    company,
    diagnosis,
    activeTab,
    diagnosisStatus,
    stepStatuses,
    projectId,
}: Props) {
    // Store existing image URLs from database
    const [existingImages, setExistingImages] = useState<Record<string, string>>(() => {
        const images: Record<string, string> = {};
        if (diagnosis?.organizational_charts) {
            if (typeof diagnosis.organizational_charts === 'object' && !Array.isArray(diagnosis.organizational_charts)) {
                Object.entries(diagnosis.organizational_charts).forEach(([year, path]) => {
                    if (REQUIRED_YEARS.includes(year) && typeof path === 'string' && path) {
                        images[year] = path;
                    }
                });
            }
        }
        return images;
    });

    const [chartFiles, setChartFiles] = useState<Record<string, File[]>>(() => {
        const files: Record<string, File[]> = {};
        REQUIRED_YEARS.forEach(year => {
            files[year] = [];
        });
        return files;
    });

    // Store preview URLs for newly selected files
    const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});

    // File input refs for each year
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const { data, setData, post, processing, errors } = useForm({
        organizational_charts: {} as Record<string, File>,
    });

    // Update form data when charts change - convert File[] to File for backend
    useEffect(() => {
        const filesForBackend: Record<string, File> = {};
        Object.entries(chartFiles).forEach(([year, files]) => {
            if (files.length > 0) {
                filesForBackend[year] = files[0]; // Backend expects single file per year
            }
        });
        setData('organizational_charts', filesForBackend);
    }, [chartFiles, setData]);

    // Removed auto-save - only save on review and submit

    const handleFileChange = (year: string, file: File | null) => {
        if (file) {
            setChartFiles({ ...chartFiles, [year]: [file] });
            // Clear existing image when new file is uploaded
            setExistingImages({ ...existingImages, [year]: '' });
            
            // Create preview for image files
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreviews({ ...filePreviews, [year]: reader.result as string });
                };
                reader.readAsDataURL(file);
            } else {
                // For PDFs, clear preview
                setFilePreviews({ ...filePreviews, [year]: '' });
            }
        } else {
            // Clear file and preview when removed
            setChartFiles({ ...chartFiles, [year]: [] });
            setFilePreviews({ ...filePreviews, [year]: '' });
        }
    };

    const handleFileSelect = (year: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload a JPG, PNG, or PDF file.');
                return;
            }
            
            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB.');
                return;
            }
            
            handleFileChange(year, file);
        }
    };

    const getImageUrl = (path: string): string => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        if (path.startsWith('/storage/')) {
            return path;
        }
        if (path.startsWith('storage/')) {
            return `/${path}`;
        }
        return `/storage/${path}`;
    };

    const isImageFile = (path: string): boolean => {
        if (!path) return false;
        const lowerPath = path.toLowerCase();
        return lowerPath.endsWith('.jpg') || 
               lowerPath.endsWith('.jpeg') || 
               lowerPath.endsWith('.png') || 
               lowerPath.endsWith('.gif') || 
               lowerPath.endsWith('.webp');
    };

    const isPdfFile = (path: string): boolean => {
        if (!path) return false;
        return path.toLowerCase().endsWith('.pdf');
    };

    return (
        <>
            <Head title={`Organizational Charts - ${company?.name || project?.company?.name || 'Company'}`} />
            <FormLayout
                title="Organizational Chart"
                project={project}
                diagnosis={diagnosis}
                activeTab={activeTab}
                diagnosisStatus={diagnosisStatus}
                stepStatuses={stepStatuses}
                projectId={projectId}
                backRoute="job-grades"
                nextRoute="organizational-structure"
                formData={data}
                saveRoute={projectId ? `/hr-manager/diagnosis/${projectId}` : undefined}
            >
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="bg-muted/50 p-4 rounded-lg mb-4">
                            <p className="text-sm text-muted-foreground">
                                Upload organizational charts for the specified years. Allowed formats: JPG, PNG, PDF
                            </p>
                        </div>

                        <div className="space-y-6">
                            {REQUIRED_YEARS.map((year) => {
                                const existingImagePath = existingImages[year];
                                const existingImageUrl = existingImagePath ? getImageUrl(existingImagePath) : '';
                                const isImage = existingImagePath ? isImageFile(existingImagePath) : false;
                                const isPdf = existingImagePath ? isPdfFile(existingImagePath) : false;
                                const hasNewFile = chartFiles[year] && chartFiles[year].length > 0;
                                const isSubmitted = diagnosisStatus === 'submitted' || diagnosisStatus === 'approved' || diagnosisStatus === 'locked';
                                const stepCompleted = stepStatuses['organizational-charts'] === 'submitted' || 
                                                      stepStatuses['organizational-charts'] === 'approved' || 
                                                      stepStatuses['organizational-charts'] === 'locked';
                                
                                return (
                                    <div key={year} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-semibold">
                                                {year} <span className="text-destructive">*</span>
                                            </Label>
                                            {stepCompleted && existingImageUrl && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 font-medium">
                                                        Completed
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(existingImageUrl, '_blank')}
                                                        className="h-7"
                                                    >
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        View
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Show "No file uploaded" when submitted and no file exists */}
                                        {isSubmitted && !existingImageUrl && !hasNewFile && (
                                            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 bg-muted/20">
                                                <div className="flex flex-col items-center justify-center text-center">
                                                    <FileText className="w-12 h-12 text-muted-foreground/50 mb-2" />
                                                    <span className="text-sm font-medium text-muted-foreground">No file uploaded</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Show existing image preview if available and no new file uploaded */}
                                        {existingImageUrl && !hasNewFile && (
                                            <div className="border rounded-lg p-4 bg-muted/30">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-medium text-muted-foreground">Current Uploaded File</span>
                                                    <a 
                                                        href={existingImageUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:text-primary/80"
                                                        title="View in new tab"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                </div>
                                                
                                                {isImage ? (
                                                    <div className="relative group">
                                                        <img 
                                                            src={existingImageUrl}
                                                            alt={`Organizational Chart ${year}`}
                                                            className="w-full h-auto rounded object-contain max-h-64 border bg-white cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => window.open(existingImageUrl, '_blank')}
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                                            <div className="bg-white/90 px-3 py-2 rounded-md shadow-md flex items-center gap-2 text-sm font-medium">
                                                                <Eye className="w-4 h-4" />
                                                                <span>View Full Size</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : isPdf ? (
                                                    <div className="flex flex-col items-center justify-center h-48 bg-white rounded border-2 border-dashed p-4">
                                                        <FileText className="w-12 h-12 text-muted-foreground mb-2" />
                                                        <span className="text-sm text-muted-foreground mb-2">PDF File</span>
                                                        <a 
                                                            href={existingImageUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            View PDF
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-32 bg-white rounded border-2 border-dashed p-4">
                                                        <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                                                        <span className="text-xs text-muted-foreground text-center break-all">
                                                            {existingImagePath.split('/').pop()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* File Upload - Drag and Drop like Company Logo - Hide if submitted and file exists */}
                                        {!(isSubmitted && existingImageUrl) && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-foreground">
                                                    {hasNewFile ? `New File Selected for ${year}` : `Upload Image File for ${year}`}
                                                    {!existingImageUrl && <span className="text-destructive">*</span>}
                                                </Label>
                                                <div
                                                    onClick={() => fileInputRefs.current[year]?.click()}
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        const files = e.dataTransfer.files;
                                                        if (files.length > 0) {
                                                            handleFileSelect(year, { target: { files } } as any);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
                                                        "hover:border-primary/50 hover:bg-muted/30",
                                                        (hasNewFile || filePreviews[year]) ? "border-primary/30 bg-muted/20" : "border-border bg-muted/10"
                                                    )}
                                                >
                                                    <input
                                                        ref={(el) => { fileInputRefs.current[year] = el; }}
                                                        type="file"
                                                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                                                        onChange={(e) => handleFileSelect(year, e)}
                                                        className="hidden"
                                                    />
                                                    {hasNewFile && filePreviews[year] ? (
                                                        <div className="space-y-3">
                                                            <div className="flex justify-center">
                                                                <img
                                                                    src={filePreviews[year]}
                                                                    alt={`Organizational Chart ${year} Preview`}
                                                                    className="max-h-48 max-w-full object-contain rounded-lg border bg-white"
                                                                />
                                                            </div>
                                                            {chartFiles[year]?.[0] && (
                                                                <div className="space-y-2">
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {chartFiles[year][0].name} ({(chartFiles[year][0].size / 1024 / 1024).toFixed(2)} MB)
                                                                    </p>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleFileChange(year, null);
                                                                            if (fileInputRefs.current[year]) {
                                                                                fileInputRefs.current[year].value = '';
                                                                            }
                                                                        }}
                                                                        className="text-sm text-destructive hover:underline inline-flex items-center gap-1"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                        Remove file
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : hasNewFile && chartFiles[year]?.[0] && chartFiles[year][0].type === 'application/pdf' ? (
                                                        <div className="space-y-3">
                                                            <div className="flex justify-center">
                                                                <FileText className="w-12 h-12 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground mb-1">
                                                                    PDF File Selected
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {chartFiles[year][0].name} ({(chartFiles[year][0].size / 1024 / 1024).toFixed(2)} MB)
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleFileChange(year, null);
                                                                    if (fileInputRefs.current[year]) {
                                                                        fileInputRefs.current[year].value = '';
                                                                    }
                                                                }}
                                                                className="text-sm text-destructive hover:underline inline-flex items-center gap-1"
                                                            >
                                                                <X className="w-4 h-4" />
                                                                Remove file
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            <div className="flex justify-center">
                                                                <Upload className="w-8 h-8 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-foreground mb-1">
                                                                    Click to upload or drag and drop
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    PNG, JPG, PDF up to 10MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {errors.organizational_charts && (
                                                    <p className="text-sm text-destructive">{errors.organizational_charts}</p>
                                                )}
                                            </div>
                                        )}
                                        
                                        {hasNewFile && existingImageUrl && (
                                            <p className="text-xs text-muted-foreground">
                                                Uploading a new file will replace the existing one.
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </FormLayout>
        </>
    );
}
