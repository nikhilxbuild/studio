'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NUpMockPreviewProps {
  rows: number;
  cols: number;
  orientation: 'portrait' | 'landscape';
  selectedPagesCount: number;
  sheetsCount: number;
}

export function NUpMockPreview({ rows, cols, orientation, selectedPagesCount, sheetsCount }: NUpMockPreviewProps) {
  const cellCount = rows * cols;
  const cells = Array.from({ length: cellCount }, (_, i) => i);

  return (
    <Card className="sticky top-24 bg-secondary/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Layout Preview</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          className={cn(
            'mx-auto aspect-[1/1.414] w-full rounded-md border-2 border-dashed border-primary/30 bg-background/30 p-1 shadow-inner',
            orientation === 'landscape' && 'aspect-[1.414/1]'
          )}
          style={{
            display: 'grid',
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '0.25rem',
          }}
        >
          {cells.map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-center rounded-[2px] bg-primary/10 ring-1 ring-inset ring-primary/20 transition-all duration-300"
            >
              <div className="h-full w-full rounded-[1px] bg-primary/5 shadow-inner"></div>
            </div>
          ))}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex-col items-start gap-2 p-4 text-sm">
        <div className="flex w-full justify-between">
            <span className="text-muted-foreground">Selected Pages</span>
            <span className="font-semibold">{selectedPagesCount}</span>
        </div>
        <div className="flex w-full justify-between text-base">
            <span className="text-muted-foreground">Total Sheets</span>
            <span className="font-bold text-primary">{sheetsCount}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
