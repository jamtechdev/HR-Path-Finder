import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    label: string;
    files?: File[];
    onChange: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
    required?: boolean;
    error?: string;
    preview?: boolean;
}

export default function FileUpload({
    label,
    files = [],
    onChange,
    accept = 'image/*,.pdf',
    multiple = false,
    maxSize = 10,
    required = false,
    error,
    preview = true,
}: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const validFiles = selectedFiles.filter(file => {
            if (file.size > maxSize * 1024 * 1024) {
                alert(`File ${file.name} exceeds maximum size of ${maxSize}MB`);
                return false;
            }
            return true;
        });
        onChange(multiple ? [...files, ...validFiles] : validFiles);
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);
    };

    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload {multiple ? 'Files' : 'File'}
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        multiple={multiple}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
                {files.length > 0 && (
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 border rounded-md"
                            >
                                <div className="flex items-center gap-2">
                                    <File className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{file.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
