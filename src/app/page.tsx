'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Layers,
  FileCheck,
  Percent,
  Users,
  ShieldCheck,
  Clock,
  Coins,
  MousePointerClick,
  Smartphone,
  Star,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

import type { Page, CustomizationOptions } from '@/lib/types';

import { UploadStep } from '@/components/app/upload-step';
import { ReorderStep } from '@/components/app/reorder-step';
import { CustomizeStep } from '@/components/app/customize-step';
import { GenerateStep } from '@/components/app/generate-step';
import { DownloadStep } from '@/components/app/download-step';
import { StepIndicator } from '@/components/app/step-indicator';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
  <section className="w-full py-20 md:py-32 lg:py-40 bg-background">
    <div className="container mx-auto px-4 md:px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Convert Notes &amp; Questions into Ready Files in Minutes
        </h1>
        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
          Transform your PDFs into clean, printable notes in seconds.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={onStart}>
            EduSlide Notes
          </Button>
          <Button size="lg" variant="secondary" onClick={onStart}>
            EduSlide PPT
          </Button>
        </div>
      </div>
    </div>
  </section>
);

const TrustSection = () => {
  const trustFeatures = [
    { icon: FileCheck, text: '100k+', subtext: 'Files Processed' },
    { icon: Percent, text: 'Completely Free', subtext: 'No hidden costs' },
    { icon: Users, text: 'Trusted by Students', subtext: 'Across the globe' },
    { icon: ShieldCheck, text: 'Secure & Private', subtext: 'Files are deleted' },
  ];
  return (
    <section className="w-full py-12 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 group transition-transform duration-300 hover:scale-105"
            >
              <div className="p-3 rounded-full bg-primary/10 text-primary shadow-lg shadow-primary/10 transition-all group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/20">
                <feature.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xl font-bold">{feature.text}</p>
                <p className="text-sm text-muted-foreground">{feature.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyEduSlideSection = () => {
  const whyFeatures = [
    {
      icon: Clock,
      title: 'Save Time',
      description:
        'Stop wasting hours reformatting notes. Get it done in seconds.',
    },
    {
      icon: Coins,
      title: 'Save Money',
      description:
        'Optimize page layouts to use less paper and ink when printing.',
    },
    {
      icon: MousePointerClick,
      title: 'Easy to Use',
      description: 'A simple, intuitive interface that anyone can master instantly.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Works seamlessly on your phone, tablet, or desktop.',
    },
  ];
  return (
    <section className="w-full py-20 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl">
          Why EduSlide?
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {whyFeatures.map((feature, index) => (
            <Card
              key={index}
              className="bg-card hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Rahul',
      avatar: 'R',
      quote:
        'EduSlide helped me organize my notes perfectly right before my exams. A real lifesaver!',
    },
    {
      name: 'Priya',
      avatar: 'P',
      quote:
        'This is the best PDF tool for students, hands down. So simple and effective.',
    },
    {
      name: 'Aman',
      avatar: 'A',
      quote:
        'I saved so much on printing costs by fitting more slides onto one page. Thank you!',
    },
  ];
  return (
    <section className="w-full py-20 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl">
          What Students Say
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-sm">&mdash; {testimonial.name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const LandingCTA = ({ onStart }: { onStart: () => void }) => (
  <section className="w-full py-20 md:py-32">
    <div className="container mx-auto px-4 md:px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Start Optimizing Your Notes Today
        </h2>
        <div className="mt-8">
          <Button size="lg" onClick={onStart}>
            Upload PDF Now
          </Button>
        </div>
      </div>
    </div>
  </section>
);

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
    colorMode: 'normal',
    removeBlankPages: true,
    cropBorders: false,
  });
  const [processingProgress, setProcessingProgress] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);
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
    return -1; // For 'landing' step
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

      {step === 'landing' ? (
        <main className="w-full">
          <LandingHero onStart={handleStartUpload} />
          <TrustSection />
          <WhyEduSlideSection />
          <TestimonialsSection />
          <LandingCTA onStart={handleStartUpload} />
        </main>
      ) : (
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
            {step === 'download' && (
              <DownloadStep onStartOver={handleStartOver} />
            )}
          </div>
        </main>
      )}

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
