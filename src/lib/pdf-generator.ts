'use client';

import { PDFDocument, PageSizes } from 'pdf-lib';
import type { Page, CustomizationOptions } from '@/lib/types';

async function isPageBlank(
  imageUrl: string,
  threshold = 0.995
): Promise<boolean> {
  try {
    const image = new Image();
    image.src = imageUrl;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    const scale = 0.1; // Check a downscaled version for performance
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let whitePixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250) {
        whitePixels++;
      }
    }
    const totalPixels = canvas.width * canvas.height;
    return whitePixels / totalPixels > threshold;
  } catch (e) {
    console.error('Failed to check if page is blank', e);
    return false;
  }
}

export async function generatePdf(
  pages: Page[],
  customization: CustomizationOptions,
  setProgress: (progress: number) => void
): Promise<Uint8Array> {
  // 1. Filter selected pages
  let pagesToProcess = pages.filter((p) => p.selected);
  setProgress(5);

  // 2. Remove blank pages if requested
  if (customization.removeBlankPages) {
    const nonBlankPages: Page[] = [];
    if (pagesToProcess.length > 0) {
      for (let i = 0; i < pagesToProcess.length; i++) {
        const page = pagesToProcess[i];
        if (!(await isPageBlank(page.sourceUrl))) {
          nonBlankPages.push(page);
        }
        setProgress(5 + Math.round(((i + 1) / pagesToProcess.length) * 15));
      }
      pagesToProcess = nonBlankPages;
    }
  }

  const totalPages = pagesToProcess.length;
  if (totalPages === 0) {
    throw new Error('No pages to process. All selected pages might be blank.');
  }

  const newPdfDoc = await PDFDocument.create();
  const { rows, cols, orientation, margin, colorMode, cropBorders } =
    customization;

  const pageSize: [number, number] =
    orientation === 'portrait'
      ? [PageSizes.A4[0], PageSizes.A4[1]]
      : [PageSizes.A4[1], PageSizes.A4[0]];

  const marginOptions = { default: 50, minimal: 25, none: 0 };
  const pageMargin = marginOptions[margin];

  const effectiveWidth = pageSize[0] - pageMargin * 2;
  const effectiveHeight = pageSize[1] - pageMargin * 2;
  const cellWidth = effectiveWidth / cols;
  const cellHeight = effectiveHeight / rows;
  const pagesPerSheet = rows * cols;
  const numSheets = Math.ceil(totalPages / pagesPerSheet);

  for (let i = 0; i < numSheets; i++) {
    const newPage = newPdfDoc.addPage(pageSize);
    const startIndex = i * pagesPerSheet;
    const endIndex = Math.min(startIndex + pagesPerSheet, totalPages);

    for (let j = startIndex; j < endIndex; j++) {
      const localIndex = j - startIndex;
      const page = pagesToProcess[j];

      // a. Load sourceUrl into an Image object
      const image = new Image();
      image.src = page.sourceUrl;
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      // b. Determine source crop box
      const cropAmount = cropBorders ? 0.03 : 0;
      const sourceX = image.width * cropAmount;
      const sourceY = image.height * cropAmount;
      const sourceWidth = image.width * (1 - cropAmount * 2);
      const sourceHeight = image.height * (1 - cropAmount * 2);

      // c. Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Could not get canvas context');

      // d. Draw cropped image
      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // e. Apply color filters
      if (colorMode !== 'normal') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        switch (colorMode) {
          case 'grayscale':
            for (let k = 0; k < data.length; k += 4) {
              const avg = (data[k] + data[k + 1] + data[k + 2]) / 3;
              data[k] = avg;
              data[k + 1] = avg;
              data[k + 2] = avg;
            }
            break;
          case 'bw':
            for (let k = 0; k < data.length; k += 4) {
              const avg = (data[k] + data[k + 1] + data[k + 2]) / 3;
              const color = avg > 200 ? 255 : 0; // Higher threshold for cleaner whites
              data[k] = color;
              data[k + 1] = color;
              data[k + 2] = color;
            }
            break;
          case 'invert':
            for (let k = 0; k < data.length; k += 4) {
              const avg = (data[k] + data[k + 1] + data[k + 2]) / 3;
              const color = avg > 200 ? 0 : 255; // High-contrast inversion
              data[k] = color;
              data[k + 1] = color;
              data[k + 2] = color;
            }
            break;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // f-g. Get image bytes
      const processedImageBytes = await fetch(
        canvas.toDataURL('image/png')
      ).then((res) => res.arrayBuffer());

      // h. Embed into PDF
      const pdfImage = await newPdfDoc.embedPng(processedImageBytes);

      // i. Calculate position and draw
      const { width: imgWidth, height: imgHeight } = pdfImage.scale(1);
      const scale = Math.min(cellWidth / imgWidth, cellHeight / imgHeight);
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      const rowIndex = Math.floor(localIndex / cols);
      const colIndex = localIndex % cols;
      const x =
        pageMargin + colIndex * cellWidth + (cellWidth - scaledWidth) / 2;
      const y =
        pageSize[1] -
        pageMargin -
        (rowIndex + 1) * cellHeight +
        (cellHeight - scaledHeight) / 2;

      newPage.drawImage(pdfImage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });

      // j. Update progress
      const progress =
        20 +
        Math.round(((i * pagesPerSheet + (localIndex + 1)) / totalPages) * 80);
      setProgress(progress > 95 ? 95 : progress);
    }
  }

  return await newPdfDoc.save();
}
