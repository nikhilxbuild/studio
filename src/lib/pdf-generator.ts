
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
  // --- NEW, FROM-SCRATCH BACKGROUND REMOVAL PIPELINE (NON-INVERTING) ---
  // This pipeline detects and removes the background, forcing it to white,
  // while preserving original foreground colors. It does NOT invert colors.
  
  // --- Start of isolated helper functions ---
  const rgbToLab = (r: number, g: number, b: number) => {
    // Step 1: Linearize RGB
    let R = r / 255;
    let G = g / 255;
    let B = b / 255;
    R = R > 0.04045 ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
    G = G > 0.04045 ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
    B = B > 0.04045 ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;
    
    // Step 2: Convert to XYZ
    const X = R * 0.4124 + G * 0.3576 + B * 0.1805;
    const Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
    const Z = R * 0.0193 + G * 0.1192 + B * 0.9505;

    // Step 3: Convert to LAB (D65 illuminant reference)
    let refX = 0.95047;
    let refY = 1.00000;
    let refZ = 1.08883;
    let varX = X / refX;
    let varY = Y / refY;
    let varZ = Z / refZ;

    varX = varX > 0.008856 ? Math.pow(varX, 1 / 3) : (7.787 * varX) + (16 / 116);
    varY = varY > 0.008856 ? Math.pow(varY, 1 / 3) : (7.787 * varY) + (16 / 116);
    varZ = varZ > 0.008856 ? Math.pow(varZ, 1 / 3) : (7.787 * varZ) + (16 / 116);

    const L = (116 * varY) - 16;
    const a = 500 * (varX - varY);
    const b_lab = 200 * (varY - varZ);

    return { L, a, b_lab };
  };
  // --- End of isolated helper functions ---

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
        const r = data[k];
        const g = data[k + 1];
        const b = data[k + 2];
        
        const { L, a, b_lab } = rgbToLab(r, g, b);
        const chroma = Math.sqrt(a * a + b_lab * b_lab);

        // Background detection: High lightness (L) and low color (chroma)
        if (L > 92 && chroma < 10) {
          // Force to pure white
          data[k] = 255;
          data[k + 1] = 255;
          data[k + 2] = 255;
        }
        // ELSE: Keep original foreground pixel color. No inversion.
      }
      
      // Second pass: Hard clamp any remaining near-white pixels to pure white
      for (let k = 0; k < data.length; k += 4) {
          if (data[k] > 250 && data[k+1] > 250 && data[k+2] > 250) {
              data[k] = 255;
              data[k+1] = 255;
              data[k+2] = 255;
          }
      }

      ctx.putImageData(imageData, 0, 0);

      // Use PNG to avoid introducing JPEG artifacts during this quality-focused process
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
      
      for (let k = 0; k < data.length; k += 4) {
        // True Grayscale (Luminance)
        const luma = 0.299 * data[k] + 0.587 * data[k + 1] + 0.114 * data[k + 2];
        
        let finalValue = luma < 200 ? 0 : 255;

        // White cleanup and black reinforcement
        if (luma > 245) finalValue = 255;
        if (luma < 40) finalValue = 0;

        data[k] = finalValue;
        data[k + 1] = finalValue;
        data[k + 2] = finalValue;
      }
      ctx.putImageData(imageData, 0, 0);

      // Using PNG for lossless B&W output as requested
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
