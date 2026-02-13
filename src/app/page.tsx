'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  ArrowRight,
  PlayCircle,
  FileCheck,
  Zap,
  Box,
  Palette,
  Repeat,
  Download,
  CheckCircle,
} from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

const STEPS = [
  { id: 'upload', title: 'Upload' },
  { id: 'reorder', title: 'Arrange' },
  { id: 'customize', title: 'Customize' },
  { id: 'download', title: 'Download' },
];

// --- Landing Page Components ---

const LandingHero = ({ onStart }: { onStart: () => void }) => (
  <section className="w-full py-20 md:py-32 lg:py-40 text-center">
    <div className="container mx-auto px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          #1 PDF Tool for Students
        </div>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
          Convert Your Notes into Print-Ready PDFs in Minutes
        </h1>
        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
          Upload PDFs, customize layout, and get clean printable notes instantly.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" onClick={onStart}>
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  </section>
);

const StatsSection = () => {
  const stats = [
    { value: '100K+', label: 'Files Processed' },
    { value: 'Completely Free', label: 'No Hidden Costs' },
    { value: 'Secure & Private', label: 'Your Files Are Safe' },
    { value: 'Trusted by Students', label: 'Across India' },
  ];
  return (
    <section className="w-full py-12">
      <div className="container mx-auto px-4 md:px-6">
        <Card className="glassmorphic">
            <CardContent className="p-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 text-center">
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: FileCheck,
      title: 'PDF to Notes Conversion',
      description: 'Easily convert any PDF into optimized note pages.',
    },
    {
      icon: Box,
      title: 'Custom N-Up (1×1 to 8×8)',
      description: 'Combine multiple pages onto a single sheet to save paper.',
    },
    {
      icon: Palette,
      title: 'Invert / Grayscale / B&W',
      description: 'Change color modes for better readability and printing.',
    },
    {
      icon: Repeat,
      title: 'Page Reordering',
      description: 'Arrange pages in any order you need before generating.',
    },
    {
      icon: Zap,
      title: 'High-Quality Output',
      description: 'Get sharp, clear, and readable PDFs every time.',
    },
    {
      icon: Download,
      title: 'Instant Download',
      description: 'Your optimized PDF is ready to download in seconds.',
    },
  ];
  return (
    <section className="w-full py-20 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl">
          Everything You Need for Perfect Notes
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="glassmorphic glow-on-hover transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="mt-1 text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const [step, setStep] = useState<
    | 'landing'
    | 'upload'
    | 'reorder'
    | 'customize'
    | 'generating'
    | 'download'
    | 'processing'
  >('landing');
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
  const { toast } = useToast();

  const handleStartUpload = () => {
    setStep('upload');
  };

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

          const scale = 2.5;

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
              await page.render({ canvasContext: context, viewport: viewport })
                .promise;
              newPages.push({
                id: i,
                sourceUrl: canvas.toDataURL('image/png'),
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

  const handleGenerate = async () => {
    setStep('generating');
    setGenerationProgress(0);

    try {
      const pdfBytes = await generatePdf(pages, customization, setGenerationProgress);
      setGeneratedPdf(pdfBytes);

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'eduslide-output.pdf';
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
    <div className="flex min-h-screen w-full flex-col items-center">
      {step === 'landing' ? (
        <>
          <LandingHero onStart={handleStartUpload} />
          <StatsSection />
          <FeaturesSection />
        </>
      ) : (
        <div className="w-full bg-background">
            <div className="container mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-4 py-8 md:py-12">
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
                {step === 'download' && (
                  <DownloadStep generatedPdf={generatedPdf} onStartOver={handleStartOver} />
                )}
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
