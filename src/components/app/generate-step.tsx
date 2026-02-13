'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

interface GenerateStepProps {
  progress: number;
  title: string;
  description: string;
}

export function GenerateStep({
  progress,
  title,
  description,
}: GenerateStepProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center space-y-6 text-center">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Image
                src="https://drive.google.com/uc?id=1GEXx01Voj74CdojCPrCCG5Sdl0l5OnxZ"
                alt="EduSlide Logo"
                width={225}
                height={48}
                className="h-12 w-auto"
              />
            </div>
            <h2 className="pt-4 text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
            <Progress value={progress} className="w-full" />
            <p className="text-sm font-medium text-primary">{progress}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
