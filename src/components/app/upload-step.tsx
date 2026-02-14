'use client';

import { useState, useRef, type DragEvent } from 'react';
import { UploadCloud, File as FileIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';

interface UploadStepProps {
  onUpload: (files: FileList) => void;
}

export function UploadStep({ onUpload }: UploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    
    if (files.length > 5) {
      toast({
        title: 'File Limit Exceeded',
        description: 'You can upload a maximum of 5 PDFs at once.',
        variant: 'destructive',
      });
      return;
    }

    const allPdfs = Array.from(files).every((file) => file.type === 'application/pdf');
    if (allPdfs) {
      onUpload(files);
    } else {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload only PDF files.',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Optimize Your Study Material
        </h2>
        <p className="text-lg text-muted-foreground">
          Convert any PDF into a compact, N-up layout for efficient studying and
          printing.
        </p>
      </div>

      <Card className="w-full max-w-2xl glassmorphic">
        <CardContent
          className="flex h-full w-full flex-col items-center justify-center p-6"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div
            className={cn(
              'flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-transparent transition-colors',
              isDragging ? 'border-primary bg-accent/20' : ''
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-4 p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UploadCloud className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">
                  Drag & drop up to 5 PDF files here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to select files from your device
                </p>
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          <Button
            className="mt-6 w-full max-w-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileIcon />
            Select PDF(s)
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Files are processed temporarily and deleted after your session.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
