'use client';

import { useState } from 'react';
import {
  ArrowRight,
  FileCheck,
  Zap,
  Box,
  Palette,
  Repeat,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PdfTool from '@/components/app/pdf-tool';

// --- Landing Page Components ---

const LandingHero = ({ onStart }: { onStart: () => void }) => (
  <section className="w-full pt-12 md:pt-16 pb-20 md:pb-24 text-center">
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
            Upload PDF <ArrowRight className="ml-2 h-5 w-5" />
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
            <Card key={index} className="glassmorphic transition-all duration-300">
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
  const [showTool, setShowTool] = useState(false);

  const handleStart = () => {
    setShowTool(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  if (showTool) {
    return <PdfTool />;
  }

  return (
    <>
      <LandingHero onStart={handleStart} />
      <StatsSection />
      <FeaturesSection />
    </>
  );
}
