import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
    label?: string;
    accept?: string;
    maxSize?: number; // in MB
    value?: File | null;
    onChange: (file: File | null) => void;
    preview?: string | null;
    onRemove?: () => void;
    className?: string;
    required?: boolean;
}

export default function FileUpload({
    label,
    accept = 'image/*',
    maxSize = 2,
    value,
    onChange,
    preview,
    onRemove,
    className,
    required = false,
}: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = (file: File) => {
        setError(null);

        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            setError(`File size must be less than ${maxSize}MB`);
            return;
        }

        // Check file type
        if (accept.includes('image/')) {
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }
        }

        onChange(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleRemove = () => {
        onChange(null);
        if (onRemove) onRemove();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <label className="text-sm font-medium">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </label>
            )}
            <div
                className={cn(
                    'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                    dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                    error && 'border-destructive',
                    value && 'border-primary/50'
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    className="hidden"
                />
                {value || preview ? (
                    <div className="space-y-4">
                        <div className="relative inline-block">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-h-48 max-w-full rounded-lg"
                                />
                            ) : (
                                <div className="p-4 bg-muted rounded-lg">
                                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                                </div>
                            )}
                            {value && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={handleRemove}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{value?.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {(value?.size ? value.size / 1024 / 1024 : 0).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                        <div>
                            <p className="text-sm font-medium mb-1">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {accept.includes('image/') ? 'PNG, JPG' : 'PDF, PNG, JPG'} up to {maxSize}MB
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Select File
                        </Button>
                    </div>
                )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
