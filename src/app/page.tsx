'use client';

import { useState, useMemo, useEffect } from 'react';
import { Layers } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

import type { Page, CustomizationOptions } from '@/lib/types';

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

export default function Home() {
  const [step, setStep] = useState<
    'upload' | 'reorder' | 'customize' | 'generating' | 'download' | 'processing'
  >('upload');
  const [pages, setPages] = useState<Page[]>([]);
  const [customization, setCustomization] = useState<CustomizationOptions>({
    rows: 2,
    cols: 2,
    orientation: 'portrait',
    margin: 'default',
    colorMode: 'normal',
    removeBlankPages: true,
    cropBorders: false,
  });
  const [processingProgress, setProcessingProgress] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    setStep('processing');
    setProcessingProgress(0);
    try {
      const fileReader = new FileReader();
      fileReader.onload = async function () {
        if (this.result) {
          const typedarray = new Uint8Array(this.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          const newPages: Page[] = [];

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
              await page.render({ canvasContext: context, viewport: viewport })
                .promise;
              newPages.push({
                id: i,
                sourceUrl: canvas.toDataURL('image/jpeg', 0.8),
                sourceHint: `page ${i}`,
                selected: true,
              });
            }
            setProcessingProgress(Math.round((i / pdf.numPages) * 100));
          }
          setPages(newPages);
          setStep('reorder');
        }
      };
      fileReader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: 'Error Processing PDF',
        description:
          'There was an issue processing your PDF. Please try again.',
        variant: 'destructive',
      });
      setStep('upload');
    }
  };

  const handleGenerate = () => {
    setStep('generating');
    setGenerationProgress(0);
  };

  useEffect(() => {
    if (step === 'generating') {
      const timer = setInterval(() => {
        setGenerationProgress((prev) => (prev >= 95 ? 95 : prev + 5));
      }, 200);

      const finishTimer = setTimeout(() => {
        clearInterval(timer);
        setGenerationProgress(100);
        setStep('download');
      }, 3000);

      return () => {
        clearInterval(timer);
        clearTimeout(finishTimer);
      };
    }
  }, [step]);

  const handleStartOver = () => {
    setPages([]);
    setStep('upload');
  };

  const currentStepIndex = useMemo(() => {
    if (step === 'upload' || step === 'processing') return 0;
    if (step === 'reorder') return 1;
    if (step === 'customize' || step === 'generating') return 2;
    if (step === 'download') return 3;
    return 0;
  }, [step]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Layers className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">EduSlide</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-4 py-8 md:py-12">
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
              title="Processing your PDF..."
              description="Extracting pages from your document. This might take a moment."
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
          {step === 'download' && <DownloadStep onStartOver={handleStartOver} />}
        </div>
      </main>
      <footer className="w-full py-4">
        <div className="container mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} EduSlide. All rights reserved.
            Files are processed temporarily and deleted after your session.
          </p>
        </div>
      </footer>
    </div>
  );
}
