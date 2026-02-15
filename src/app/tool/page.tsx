'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

import type { Page, CustomizationOptions } from '@/lib/types';
import { generatePdf } from '@/lib/pdf-generator';

import { UploadStep } from '@/components/app/upload-step';
import { ReorderStep } from '@/components/app/reorder-step';
import { CustomizeStep } from '@/components/app/customize-step';
import { GenerateStep } from '@/components/app/generate-step';
import { DownloadStep } from '@/components/app/download-step';
import { StepIndicator } from '@/components/app/step-indicator';
import { useToast } from '@/hooks/use-toast';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

const STEPS = [
  { id: 'upload', title: 'Upload' },
  { id: 'reorder', title: 'Arrange' },
  { id: 'customize', title: 'Customize' },
  { id: 'download', title: 'Download' },
];

export default function ToolPage() {
  const [step, setStep] = useState<
    | 'upload'
    | 'processing'
    | 'reorder'
    | 'customize'
    | 'generating'
    | 'download'
  >('upload');
  const [pages, setPages] = useState<Page[]>([]);
  const [customization, setCustomization] = useState<CustomizationOptions>({
    rows: 2,
    cols: 2,
    orientation: 'portrait',
    margin: 'default',
    colorMode: {
      invert: false,
      grayscale: false,
      bw: false,
    },
    removeBlankPages: true,
    cropBorders: false,
  });
  const [processingProgress, setProcessingProgress] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedPdf, setGeneratedPdf] = useState<Uint8Array | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string>('eduslide-output');
  const [downloadFileName, setDownloadFileName] = useState<string>('eduslide-output_enhanced.pdf');
  const { toast } = useToast();
  const progressTimeoutRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);
  
  useEffect(() => {
    if (step === 'processing') {
      progressTimeoutRef.current.forEach(clearTimeout);
      progressTimeoutRef.current = [];
      setProcessingProgress(0);

      const scheduleUpdate = (value: number, delay: number) => {
        const timeout = setTimeout(() => {
          if (step === 'processing') {
            setProcessingProgress(value);
          }
        }, delay);
        progressTimeoutRef.current.push(timeout);
      };
      
      scheduleUpdate(10, 200);
      scheduleUpdate(25, 1200);
      scheduleUpdate(45, 2500);
      scheduleUpdate(65, 4000);
      scheduleUpdate(80, 5500);
      scheduleUpdate(90, 7000);
      scheduleUpdate(95, 8500);
    }

    return () => {
      progressTimeoutRef.current.forEach(clearTimeout);
    };
  }, [step]);

  const handleUpload = async (files: FileList) => {
    setStep('processing');
    const startTime = Date.now();
    const allPages: Page[] = [];
    let pageIdCounter = 1;

    if (files.length > 0) {
        const firstFile = files[0];
        const baseName = firstFile.name.toLowerCase().endsWith('.pdf') 
            ? firstFile.name.slice(0, -4) 
            : firstFile.name;
        setSourceFileName(baseName);
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileReader = new FileReader();
        
        const filePages = await new Promise<Page[]>((resolve, reject) => {
          fileReader.onload = async function () {
            if (this.result) {
              try {
                const typedarray = new Uint8Array(this.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                const newPagesFromFile: Page[] = [];
                
                const scale = 1.5;

                for (let j = 1; j <= pdf.numPages; j++) {
                  const page = await pdf.getPage(j);
                  const viewport = page.getViewport({ scale });
                  const canvas = document.createElement('canvas');
                  const context = canvas.getContext('2d', { colorSpace: 'srgb' });
                  canvas.height = viewport.height;
                  canvas.width = viewport.width;

                  if (context) {
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    newPagesFromFile.push({
                      id: pageIdCounter++,
                      sourceUrl: canvas.toDataURL('image/jpeg', 0.85),
                      sourceHint: `Page ${j} of ${file.name}`,
                      selected: true,
                    });
                  }
                }
                resolve(newPagesFromFile);
              } catch (e) {
                console.error(`Error processing file ${file.name}:`, e);
                reject(new Error(`Failed to process ${file.name}. It might be corrupted or password-protected.`));
              }
            } else {
              reject(new Error(`Could not read file ${file.name}`));
            }
          };

          fileReader.onerror = (error) => reject(error);
          fileReader.readAsArrayBuffer(file);
        });

        allPages.push(...filePages);
      }
      
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      const minDuration = 8000;

      if (elapsedTime < minDuration) {
        await new Promise(resolve => setTimeout(resolve, minDuration - elapsedTime));
      }

      progressTimeoutRef.current.forEach(clearTimeout);

      setPages(allPages);
      setProcessingProgress(100);

      setTimeout(() => {
        setStep('reorder');
      }, 500);

    } catch (error: any) {
      console.error('Error processing PDFs:', error);
      toast({
        title: 'Error Processing PDF',
        description: error.message || 'There was an issue processing your PDFs. Please try again.',
        variant: 'destructive',
      });
      setStep('upload');
    }
  };

  const handleGenerate = async () => {
    setStep('generating');
    setGenerationProgress(0);

    let newFileName = `${sourceFileName}_enhanced.pdf`;
    if (customization.colorMode.invert) {
      newFileName = `${sourceFileName}_invert_300dpi.pdf`;
    } else if (customization.colorMode.bw || customization.colorMode.grayscale) {
      newFileName = `${sourceFileName}_bw_300dpi.pdf`;
    }
    setDownloadFileName(newFileName);

    try {
      const pdfBytes = await generatePdf(pages, customization, setGenerationProgress);
      setGeneratedPdf(pdfBytes);

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = newFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setGenerationProgress(100);
      setStep('download');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error Generating PDF',
        description: error.message || 'There was an issue creating your PDF. Please try again.',
        variant: 'destructive',
      });
      setStep('customize');
    }
  };

  const handleStartOver = () => {
    setPages([]);
    setGeneratedPdf(null);
    setSourceFileName('eduslide-output');
    setStep('upload');
  };

  const currentStepIndex = useMemo(() => {
    if (step === 'upload' || step === 'processing') return 0;
    if (step === 'reorder') return 1;
    if (step === 'customize' || step === 'generating') return 2;
    if (step === 'download') return 3;
    return -1;
  }, [step]);

  return (
    <div className="w-full">
        <div className="container mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-8 md:py-12">
          <div className="w-full space-y-8">
            {step !== 'upload' &&
              step !== 'processing' &&
              step !== 'generating' && (
                <StepIndicator steps={STEPS} currentStep={currentStepIndex} />
              )}

            {step === 'upload' && <UploadStep onUpload={handleUpload} />}
            {step === 'processing' && (
              <GenerateStep
                progress={processingProgress}
                title="Processing your PDFs..."
                description="Extracting pages from your documents. This might take a moment."
              />
            )}
            {step === 'reorder' && (
              <ReorderStep
                pages={pages}
                setPages={setPages}
                onNext={() => setStep('customize')}
                onBack={handleStartOver}
              />
            )}
            {step === 'customize' && (
              <CustomizeStep
                pages={pages}
                customization={customization}
                setCustomization={setCustomization}
                onGenerate={handleGenerate}
                onBack={() => setStep('reorder')}
              />
            )}
            {step === 'generating' && (
              <GenerateStep
                progress={generationProgress}
                title="Generating your PDF..."
                description="Please wait while we prepare your optimized document. This might take a moment."
              />
            )}
            {step === 'download' && (
              <DownloadStep generatedPdf={generatedPdf} onStartOver={handleStartOver} fileName={downloadFileName} />
            )}
          </div>
        </div>
    </div>
  );
}
