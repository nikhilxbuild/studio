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
    const ctx = canvas.getContext('2d', { willReadFrequently: true, colorSpace: 'srgb' });
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

async function generateHighQualityInvertPdf(
  pages: Page[],
  customization: CustomizationOptions,
  setProgress: (progress: number) => void
): Promise<Uint8Array> {
  let pagesToProcess = pages.filter((p) => p.selected);
  setProgress(5);

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
  const { rows, cols, orientation, margin, cropBorders } = customization;
  const pageSize: [number, number] =
    orientation === 'portrait' ? [PageSizes.A4[0], PageSizes.A4[1]] : [PageSizes.A4[1], PageSizes.A4[0]];
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

      const image = new Image();
      image.src = page.sourceUrl;
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = (err) => reject(new Error(`Failed to load page ${j + 1}: ${err}`));
      });

      const targetEmbedDPI = 300;
      const embedScaleFactor = targetEmbedDPI / 72;
      const targetCellPixelWidth = cellWidth * embedScaleFactor;
      const targetCellPixelHeight = cellHeight * embedScaleFactor;
      
      const sourceAspectRatio = image.width / image.height;
      const targetCellAspectRatio = targetCellPixelWidth / targetCellPixelHeight;
      
      let finalCanvasWidth, finalCanvasHeight;
      if (sourceAspectRatio > targetCellAspectRatio) {
          finalCanvasWidth = targetCellPixelWidth;
          finalCanvasHeight = targetCellPixelWidth / sourceAspectRatio;
      } else {
          finalCanvasHeight = targetCellPixelHeight;
          finalCanvasWidth = targetCellPixelHeight * sourceAspectRatio;
      }

      const canvas = document.createElement('canvas');
      canvas.width = finalCanvasWidth;
      canvas.height = finalCanvasHeight;
      const ctx = canvas.getContext('2d', { colorSpace: 'srgb', willReadFrequently: true });
      if (!ctx) throw new Error('Could not get canvas context');
      
      const cropAmount = cropBorders ? 0.03 : 0;
      const sourceX = image.width * cropAmount;
      const sourceY = image.height * cropAmount;
      const sourceWidth = image.width * (1 - cropAmount * 2);
      const sourceHeight = image.height * (1 - cropAmount * 2);

      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let k = 0; k < data.length; k += 4) {
        // Invert the pixel first
        const invR = 255 - data[k];
        const invG = 255 - data[k + 1];
        const invB = 255 - data[k + 2];

        // Now, check the inverted pixel for background conditions
        
        // Condition 1: is very light gray/white
        const isLight = invR > 230 && invG > 230 && invB > 230;

        // Condition 2: has very low saturation
        const r_norm = invR / 255;
        const g_norm = invG / 255;
        const b_norm = invB / 255;
        
        const max = Math.max(r_norm, g_norm, b_norm);
        const min = Math.min(r_norm, g_norm, b_norm);
        const delta = max - min;
        const saturation = max === 0 ? 0 : delta / max;
        const isDesaturated = saturation < 0.1;

        if (isLight || isDesaturated) {
          // Force to pure white
          data[k] = 255;
          data[k + 1] = 255;
          data[k + 2] = 255;
        } else {
          // Keep the inverted foreground colors
          data[k] = invR;
          data[k + 1] = invG;
          data[k + 2] = invB;
        }
      }
      ctx.putImageData(imageData, 0, 0);

      const processedImageBytes = await fetch(canvas.toDataURL('image/jpeg', 0.92)).then((res) => res.arrayBuffer());
      const pdfImage = await newPdfDoc.embedJpg(processedImageBytes);

      const { width: imgWidth, height: imgHeight } = pdfImage.scale(1);
      const scale = Math.min(cellWidth / imgWidth, cellHeight / imgHeight);
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      const rowIndex = Math.floor(localIndex / cols);
      const colIndex = localIndex % cols;
      const x = pageMargin + colIndex * cellWidth + (cellWidth - scaledWidth) / 2;
      const y = pageSize[1] - pageMargin - (rowIndex + 1) * cellHeight + (cellHeight - scaledHeight) / 2;

      newPage.drawImage(pdfImage, { x, y, width: scaledWidth, height: scaledHeight });

      const progress = 20 + Math.round(((i * pagesPerSheet + (localIndex + 1)) / totalPages) * 80);
      setProgress(progress > 95 ? 95 : progress);
    }
  }
  return await newPdfDoc.save({ useObjectStreams: true });
}


async function generateHighQualityBWPdf(
  pages: Page[],
  customization: CustomizationOptions,
  setProgress: (progress: number) => void
): Promise<Uint8Array> {
  let pagesToProcess = pages.filter((p) => p.selected);
  setProgress(5);

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
  const { rows, cols, orientation, margin, cropBorders } = customization;
  const pageSize: [number, number] =
    orientation === 'portrait' ? [PageSizes.A4[0], PageSizes.A4[1]] : [PageSizes.A4[1], PageSizes.A4[0]];
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

      const image = new Image();
      image.src = page.sourceUrl;
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = (err) => reject(new Error(`Failed to load page ${j + 1}: ${err}`));
      });

      const targetEmbedDPI = 300;
      const embedScaleFactor = targetEmbedDPI / 72;
      const targetCellPixelWidth = cellWidth * embedScaleFactor;
      const targetCellPixelHeight = cellHeight * embedScaleFactor;
      
      const sourceAspectRatio = image.width / image.height;
      const targetCellAspectRatio = targetCellPixelWidth / targetCellPixelHeight;
      
      let finalCanvasWidth, finalCanvasHeight;
      if (sourceAspectRatio > targetCellAspectRatio) {
          finalCanvasWidth = targetCellPixelWidth;
          finalCanvasHeight = targetCellPixelWidth / sourceAspectRatio;
      } else {
          finalCanvasHeight = targetCellPixelHeight;
          finalCanvasWidth = targetCellPixelHeight * sourceAspectRatio;
      }

      const canvas = document.createElement('canvas');
      canvas.width = finalCanvasWidth;
      canvas.height = finalCanvasHeight;
      const ctx = canvas.getContext('2d', { colorSpace: 'srgb', willReadFrequently: true });
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cropAmount = cropBorders ? 0.03 : 0;
      const sourceX = image.width * cropAmount;
      const sourceY = image.height * cropAmount;
      const sourceWidth = image.width * (1 - cropAmount * 2);
      const sourceHeight = image.height * (1 - cropAmount * 2);

      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Binarization logic
      for (let k = 0; k < data.length; k += 4) {
        const luma = 0.299 * data[k] + 0.587 * data[k + 1] + 0.114 * data[k + 2];
        let finalValue = luma < 150 ? 0 : 255;
        if (luma > 245) finalValue = 255;
        if (luma < 40) finalValue = 0;
        
        data[k] = finalValue;
        data[k + 1] = finalValue;
        data[k + 2] = finalValue;
      }
      ctx.putImageData(imageData, 0, 0);

      const processedImageBytes = await fetch(canvas.toDataURL('image/png')).then((res) => res.arrayBuffer());
      const pdfImage = await newPdfDoc.embedPng(processedImageBytes);

      const { width: imgWidth, height: imgHeight } = pdfImage.scale(1);
      const scale = Math.min(cellWidth / imgWidth, cellHeight / imgHeight);
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      const rowIndex = Math.floor(localIndex / cols);
      const colIndex = localIndex % cols;
      const x = pageMargin + colIndex * cellWidth + (cellWidth - scaledWidth) / 2;
      const y = pageSize[1] - pageMargin - (rowIndex + 1) * cellHeight + (cellHeight - scaledHeight) / 2;

      newPage.drawImage(pdfImage, { x, y, width: scaledWidth, height: scaledHeight });

      const progress = 20 + Math.round(((i * pagesPerSheet + (localIndex + 1)) / totalPages) * 80);
      setProgress(progress > 95 ? 95 : progress);
    }
  }
  return await newPdfDoc.save({ useObjectStreams: true });
}


export async function generatePdf(
  pages: Page[],
  customization: CustomizationOptions,
  setProgress: (progress: number) => void
): Promise<Uint8Array> {
  
  if (customization.colorMode.invert) {
    return generateHighQualityInvertPdf(pages, customization, setProgress);
  }

  if (customization.colorMode.bw || customization.colorMode.grayscale) {
    return generateHighQualityBWPdf(pages, customization, setProgress);
  }
  
  // --- NORMAL (COLOR) PIPELINE ---
  let pagesToProcess = pages.filter((p) => p.selected);
  setProgress(5);

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
  const { rows, cols, orientation, margin, cropBorders } = customization;
  const pageSize: [number, number] =
    orientation === 'portrait' ? [PageSizes.A4[0], PageSizes.A4[1]] : [PageSizes.A4[1], PageSizes.A4[0]];
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

      const image = new Image();
      image.src = page.sourceUrl;
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = (err) => reject(new Error(`Failed to load page ${j + 1}: ${err}`));
      });
      
      const targetEmbedDPI = 220;
      const embedScaleFactor = targetEmbedDPI / 72;
      const targetCellPixelWidth = cellWidth * embedScaleFactor;
      const targetCellPixelHeight = cellHeight * embedScaleFactor;
      
      const sourceAspectRatio = image.width / image.height;
      const targetCellAspectRatio = targetCellPixelWidth / targetCellPixelHeight;
      
      let finalCanvasWidth, finalCanvasHeight;
      if (sourceAspectRatio > targetCellAspectRatio) {
          finalCanvasWidth = targetCellPixelWidth;
          finalCanvasHeight = targetCellPixelWidth / sourceAspectRatio;
      } else {
          finalCanvasHeight = targetCellPixelHeight;
          finalCanvasWidth = targetCellPixelHeight * sourceAspectRatio;
      }

      const canvas = document.createElement('canvas');
      canvas.width = finalCanvasWidth;
      canvas.height = finalCanvasHeight;
      const ctx = canvas.getContext('2d', { colorSpace: 'srgb' });
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const cropAmount = cropBorders ? 0.03 : 0;
      const sourceX = image.width * cropAmount;
      const sourceY = image.height * cropAmount;
      const sourceWidth = image.width * (1 - cropAmount * 2);
      const sourceHeight = image.height * (1 - cropAmount * 2);

      ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

      const processedImageBytes = await fetch(canvas.toDataURL('image/jpeg', 0.92)).then((res) => res.arrayBuffer());
      const pdfImage = await newPdfDoc.embedJpg(processedImageBytes);

      const { width: imgWidth, height: imgHeight } = pdfImage.scale(1);
      const scale = Math.min(cellWidth / imgWidth, cellHeight / imgHeight);
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      const rowIndex = Math.floor(localIndex / cols);
      const colIndex = localIndex % cols;
      const x = pageMargin + colIndex * cellWidth + (cellWidth - scaledWidth) / 2;
      const y = pageSize[1] - pageMargin - (rowIndex + 1) * cellHeight + (cellHeight - scaledHeight) / 2;

      newPage.drawImage(pdfImage, { x, y, width: scaledWidth, height: scaledHeight });

      const progress = 20 + Math.round(((i * pagesPerSheet + (localIndex + 1)) / totalPages) * 80);
      setProgress(progress > 95 ? 95 : progress);
    }
  }
  return await newPdfDoc.save({ useObjectStreams: true });
}
