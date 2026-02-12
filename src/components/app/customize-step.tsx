'use client';

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Rows,
  Columns,
  Frame,
  Palette,
  Droplets,
  Wand2,
} from 'lucide-react';

import type { Page, CustomizationOptions } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface CustomizeStepProps {
  pages: Page[];
  customization: CustomizationOptions;
  setCustomization: Dispatch<SetStateAction<CustomizationOptions>>;
  onGenerate: () => void;
  onBack: () => void;
}

export function CustomizeStep({
  pages,
  customization,
  setCustomization,
  onGenerate,
  onBack,
}: CustomizeStepProps) {
  // Local state for immediate UI feedback on sliders
  const [localRows, setLocalRows] = useState(customization.rows);
  const [localCols, setLocalCols] = useState(customization.cols);

  // Keep local state in sync with parent prop if it changes
  useEffect(() => {
    setLocalRows(customization.rows);
  }, [customization.rows]);

  useEffect(() => {
    setLocalCols(customization.cols);
  }, [customization.cols]);

  const selectedPagesCount = pages.filter((p) => p.selected).length;
  // The summary card uses the committed values from the parent state
  const { rows, cols } = customization;
  const sheetsCount = Math.ceil(selectedPagesCount / (rows * cols));

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Customize Your Layout
          </h2>
          <p className="text-muted-foreground">
            Fine-tune the layout to fit your needs. Your settings are summarized
            on the right.
          </p>
        </div>

        <div className="mt-6 grid gap-8 md:grid-cols-3">
          <div className="space-y-8 md:col-span-2">
            {/* N-Up Layout */}
            <div className="space-y-4">
              <h3 className="font-semibold">N-Up Layout</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="rows-slider" className="flex items-center">
                    <Rows className="mr-2" /> Rows: {localRows}
                  </Label>
                  <Slider
                    id="rows-slider"
                    value={[localRows]}
                    onValueChange={([val]) => setLocalRows(val)}
                    onValueCommit={([val]) =>
                      setCustomization((prev) => ({ ...prev, rows: val }))
                    }
                    min={1}
                    max={8}
                    step={1}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="cols-slider" className="flex items-center">
                    <Columns className="mr-2" /> Columns: {localCols}
                  </Label>
                  <Slider
                    id="cols-slider"
                    value={[localCols]}
                    onValueChange={([val]) => setLocalCols(val)}
                    onValueCommit={([val]) =>
                      setCustomization((prev) => ({ ...prev, cols: val }))
                    }
                    min={1}
                    max={8}
                    step={1}
                  />
                </div>
              </div>
            </div>
            <Separator />
            {/* Layout Options */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Frame className="mr-2" />
                  Orientation
                </h3>
                <RadioGroup
                  value={customization.orientation}
                  onValueChange={(val) =>
                    setCustomization({
                      ...customization,
                      orientation: val as 'portrait' | 'landscape',
                    })
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="portrait" id="portrait" />
                    <Label htmlFor="portrait">Portrait</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="landscape" id="landscape" />
                    <Label htmlFor="landscape">Landscape</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Droplets className="mr-2" />
                  Margins
                </h3>
                <RadioGroup
                  value={customization.margin}
                  onValueChange={(val) =>
                    setCustomization({
                      ...customization,
                      margin: val as 'default' | 'minimal' | 'none',
                    })
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="margin-default" />
                    <Label htmlFor="margin-default">Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" id="margin-minimal" />
                    <Label htmlFor="margin-minimal">Minimal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="margin-none" />
                    <Label htmlFor="margin-none">None</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Color Mode */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Palette className="mr-2" />
                  Color Mode
                </h3>
                <RadioGroup
                  value={customization.colorMode}
                  onValueChange={(val) =>
                    setCustomization({
                      ...customization,
                      colorMode: val as any,
                    })
                  }
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="color-normal" />
                    <Label htmlFor="color-normal">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="grayscale" id="color-grayscale" />
                    <Label htmlFor="color-grayscale">Grayscale</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bw" id="color-bw" />
                    <Label htmlFor="color-bw">B&W</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="invert" id="color-invert" />
                    <Label htmlFor="color-invert">Invert</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <Separator />
            {/* Auto Clean-Up */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <Wand2 className="mr-2" />
                Auto Clean-Up
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="remove-blank"
                    checked={customization.removeBlankPages}
                    onCheckedChange={(checked) =>
                      setCustomization({
                        ...customization,
                        removeBlankPages: checked,
                      })
                    }
                  />
                  <Label htmlFor="remove-blank">Remove blank pages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="crop-borders"
                    checked={customization.cropBorders}
                    onCheckedChange={(checked) =>
                      setCustomization({
                        ...customization,
                        cropBorders: checked,
                      })
                    }
                  />
                  <Label htmlFor="crop-borders">Crop borders</Label>
                </div>
              </div>
            </div>
          </div>
          {/* Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-24 bg-secondary">
              <CardHeader>
                <CardTitle>Layout Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Pages</span>
                  <span className="font-semibold">{selectedPagesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Layout</span>
                  <span className="font-semibold">
                    {rows} &times; {cols}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Orientation</span>
                  <span className="font-semibold capitalize">
                    {customization.orientation}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Total Sheets</span>
                  <span className="font-bold text-primary">{sheetsCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft />
            Back
          </Button>
          <Button onClick={onGenerate}>
            Generate PDF
            <ChevronRight />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
