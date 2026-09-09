// Clean High-Resolution Canvas Renderer with Independent Frame Styling
// Supports Frame Padding (Minimal / Standard / Korean), Analog Film Grain, and Watermark Positions

import { PHOTO_FILTERS, FRAME_COLORS, FRAME_PATTERNS } from './filters';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function getLuminance(hex) {
  if (!hex) return 0;
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function drawImageCover(ctx, img, x, y, width, height, radius = 8) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.clip();

  const imgRatio = img.width / img.height;
  const targetRatio = width / height;
  let renderWidth, renderHeight, offsetX, offsetY;

  if (imgRatio > targetRatio) {
    renderHeight = height;
    renderWidth = height * imgRatio;
    offsetX = x - (renderWidth - width) / 2;
    offsetY = y;
  } else {
    renderWidth = width;
    renderHeight = width / imgRatio;
    offsetX = x;
    offsetY = y - (renderHeight - height) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
  ctx.restore();
}

/**
 * Draw 2-Section Frame: Base Color (Preset or Custom) + Pattern Overlay on top
 */
function drawFrameBackground(ctx, width, height, frameColor, patternId) {
  // 1. Fill Base Color
  ctx.fillStyle = frameColor.hex || '#0F172A';
  ctx.fillRect(0, 0, width, height);

  const isLight = frameColor.isLight;

  // 2. Apply Pattern Overlay
  if (patternId === 'checkered') {
    const gridSize = 32;
    ctx.save();
    ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Checkered squares
    ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.03)' : 'rgba(255, 255, 255, 0.04)';
    for (let x = 0; x < width; x += gridSize * 2) {
      for (let y = 0; y < height; y += gridSize * 2) {
        ctx.fillRect(x, y, gridSize, gridSize);
        ctx.fillRect(x + gridSize, y + gridSize, gridSize, gridSize);
      }
    }
    ctx.restore();
  } else if (patternId === 'border') {
    ctx.save();
    // Outer solid border
    ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.2)' : 'rgba(37, 99, 235, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, width - 28, height - 28);

    // Inner dashed precision border
    ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.35)' : 'rgba(147, 197, 253, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(24, 24, width - 48, height - 48);
    ctx.setLineDash([]);
    ctx.restore();
  } else if (patternId === 'gradient') {
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    if (isLight) {
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.6, 'rgba(37, 99, 235, 0.06)');
      grad.addColorStop(1, 'rgba(37, 99, 235, 0.18)');
    } else {
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.6, 'rgba(37, 99, 235, 0.15)');
      grad.addColorStop(1, 'rgba(37, 99, 235, 0.35)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Base boundary hairline (always present unless double border)
  if (patternId !== 'border') {
    ctx.save();
    ctx.strokeStyle = frameColor.border || (isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)');
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, width - 32, height - 32);
    ctx.restore();
  }
}

/**
 * Draw analog film grain texture over canvas
 */
function applyFilmGrain(ctx, width, height, isLight) {
  ctx.save();
  const grainCanvas = document.createElement('canvas');
  grainCanvas.width = 120;
  grainCanvas.height = 120;
  const grainCtx = grainCanvas.getContext('2d');
  const imgData = grainCtx.createImageData(120, 120);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = isLight ? (Math.random() * 22) | 0 : (Math.random() * 30) | 0;
  }
  grainCtx.putImageData(imgData, 0, 0);

  const grainPattern = ctx.createPattern(grainCanvas, 'repeat');
  if (grainPattern) {
    ctx.fillStyle = grainPattern;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

export async function renderPhotostrip({
  photos,
  layout,
  filterId,
  frameColorId = 'navy',
  customColor = null,
  framePatternId = 'none',
  framePadding = 'standard', // 'minimal' | 'standard' | 'korean'
  enableFilmGrain = false,
  watermarkPosition = 'bottom', // 'bottom' | 'top' | 'side'
  // Backward compatibility:
  motifId,
  caption = '',
  dateString = '',
}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Resolve Frame Color (Preset or Custom):
  let frameColor;
  if (frameColorId === 'custom' && customColor) {
    const isLight = getLuminance(customColor) > 0.55;
    frameColor = {
      id: 'custom',
      name: 'Custom',
      hex: customColor,
      isLight,
      text: isLight ? '#0F172A' : '#FFFFFF',
      subtext: isLight ? '#475569' : '#94A3B8',
      border: isLight ? 'rgba(15, 23, 42, 0.15)' : 'rgba(255, 255, 255, 0.18)',
    };
  } else {
    frameColor = FRAME_COLORS.find((c) => c.id === frameColorId) || FRAME_COLORS[4]; // default navy
  }

  let resolvedPatternId = framePatternId;

  // Handle legacy motifId mapping if passed
  if (motifId && !framePatternId) {
    if (motifId === 'checkered') resolvedPatternId = 'checkered';
    else if (motifId === 'double-border') resolvedPatternId = 'border';
    else if (motifId === 'modern-gradient') resolvedPatternId = 'gradient';
    else resolvedPatternId = 'none';
  }

  const filter = PHOTO_FILTERS.find((f) => f.id === filterId) || PHOTO_FILTERS[0];

  let canvasWidth = 1000;
  let canvasHeight = 2500;

  if (layout.id === 'strip-3') {
    canvasWidth = 1000;
    canvasHeight = 2500;
  } else if (layout.id === 'grid-2x2') {
    canvasWidth = 1400;
    canvasHeight = 1750;
  } else if (layout.id === 'strip-4') {
    canvasWidth = 960;
    canvasHeight = 2800;
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. Draw 2-Section Frame (Base Color + Pattern Overlay)
  drawFrameBackground(ctx, canvasWidth, canvasHeight, frameColor, resolvedPatternId);

  // 2. Compute Slots based on framePadding & watermarkPosition
  let padFactor = 0.075; // Standard Studio default (7.5%)
  if (framePadding === 'minimal') {
    padFactor = 0.04; // 4%
  } else if (framePadding === 'korean') {
    padFactor = 0.12; // 12% (Thick Korean style padding)
  }

  let paddingX = canvasWidth * padFactor;
  let paddingTop = canvasHeight * 0.045;
  let paddingBottom = canvasHeight * 0.045;

  if (watermarkPosition === 'top') {
    paddingTop = canvasHeight * 0.095;
    paddingBottom = canvasHeight * (padFactor * 0.7);
  } else if (watermarkPosition === 'side') {
    paddingX = canvasWidth * (padFactor * 1.15);
    paddingTop = canvasHeight * 0.045;
    paddingBottom = canvasHeight * 0.045;
  } else {
    // Default 'bottom'
    paddingTop = canvasHeight * (padFactor * 0.7);
    paddingBottom = canvasHeight * 0.095;
  }

  const gap = canvasWidth * (padFactor * 0.45);
  const availableWidth = canvasWidth - (paddingX * 2);
  const availableHeight = canvasHeight - paddingTop - paddingBottom;

  const photoSlots = [];

  if (layout.id === 'grid-2x2') {
    const colWidth = (availableWidth - gap) / 2;
    const rowHeight = (availableHeight - gap) / 2;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        photoSlots.push({
          x: paddingX + c * (colWidth + gap),
          y: paddingTop + r * (rowHeight + gap),
          width: colWidth,
          height: rowHeight,
        });
      }
    }
  } else {
    const count = layout.photoCount;
    const itemHeight = (availableHeight - (gap * (count - 1))) / count;
    for (let i = 0; i < count; i++) {
      photoSlots.push({
        x: paddingX,
        y: paddingTop + i * (itemHeight + gap),
        width: availableWidth,
        height: itemHeight,
      });
    }
  }

  // 3. Draw Photos with Filter
  for (let i = 0; i < photoSlots.length; i++) {
    const slot = photoSlots[i];
    const photoDataUrl = photos[i];

    if (photoDataUrl) {
      try {
        const img = await loadImage(photoDataUrl);

        // Photo slot container background
        ctx.save();
        ctx.fillStyle = frameColor.isLight ? '#E2E8F0' : '#080D1A';
        ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
        ctx.restore();

        // Apply filter
        ctx.save();
        if (filter.canvasFilter && filter.canvasFilter !== 'none') {
          ctx.filter = filter.canvasFilter;
        }
        drawImageCover(ctx, img, slot.x, slot.y, slot.width, slot.height, 10);
        ctx.restore();

        // Photo hairline border
        ctx.save();
        ctx.strokeStyle = frameColor.isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.14)';
        ctx.lineWidth = 2;
        ctx.strokeRect(slot.x, slot.y, slot.width, slot.height);
        ctx.restore();
      } catch (err) {
        console.error('Failed to load image for slot', i, err);
      }
    } else {
      ctx.fillStyle = frameColor.isLight ? '#F1F5F9' : '#141E33';
      ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
    }
  }

  // 4. Clean Sans-serif Watermark Frame according to watermarkPosition
  const displayDate = dateString || new Date().toISOString().slice(0, 10).replace(/-/g, '.');

  if (watermarkPosition === 'top') {
    const headerCenterY = (paddingTop / 2) + 6;

    if (caption && caption.trim().length > 0) {
      ctx.save();
      ctx.font = 'bold 30px "Plus Jakarta Sans", "Inter", sans-serif';
      ctx.fillStyle = frameColor.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '3px';
      ctx.fillText(caption.toUpperCase(), canvasWidth / 2, headerCenterY - 26);
      ctx.restore();
    }

    ctx.save();
    ctx.font = '800 24px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillStyle = frameColor.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '5px';
    ctx.fillText('YUKPHOTO', canvasWidth / 2, headerCenterY + 12);
    ctx.restore();

    ctx.save();
    ctx.font = '500 17px "Plus Jakarta Sans", "Inter", monospace';
    ctx.fillStyle = frameColor.subtext;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '2px';
    ctx.fillText(`${displayDate}  •  DIGITAL PHOTO STUDIO`, canvasWidth / 2, headerCenterY + 40);
    ctx.restore();

  } else if (watermarkPosition === 'side') {
    // Vertical watermark along the right boundary
    ctx.save();
    ctx.translate(canvasWidth - 36, canvasHeight / 2);
    ctx.rotate(Math.PI / 2);
    ctx.font = '800 22px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillStyle = frameColor.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '6px';
    const sideText = caption ? `${caption.toUpperCase()}  •  YUKPHOTO  •  ${displayDate}` : `YUKPHOTO  •  ${displayDate}  •  STUDIO ARCHIVE`;
    ctx.fillText(sideText, 0, 0);
    ctx.restore();

  } else {
    // Default 'bottom'
    const footerCenterY = canvasHeight - (paddingBottom / 2) + 8;

    if (caption && caption.trim().length > 0) {
      ctx.save();
      ctx.font = 'bold 34px "Plus Jakarta Sans", "Inter", sans-serif';
      ctx.fillStyle = frameColor.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '3px';
      ctx.fillText(caption.toUpperCase(), canvasWidth / 2, footerCenterY - 32);
      ctx.restore();
    }

    ctx.save();
    ctx.font = '800 24px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillStyle = frameColor.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '5px';
    ctx.fillText('YUKPHOTO', canvasWidth / 2, footerCenterY + 8);
    ctx.restore();

    ctx.save();
    ctx.font = '500 18px "Plus Jakarta Sans", "Inter", monospace';
    ctx.fillStyle = frameColor.subtext;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '2px';
    ctx.fillText(`${displayDate}  •  DIGITAL PHOTO STUDIO`, canvasWidth / 2, footerCenterY + 36);
    ctx.restore();

    // Hairline barcode simulation at footer
    ctx.save();
    ctx.fillStyle = frameColor.subtext;
    const barcodeY = canvasHeight - 24;
    const barWidth = 2.5;
    const barcodeStart = canvasWidth / 2 - 110;
    for (let b = 0; b < 36; b++) {
      const isThick = (b % 3 === 0) || (b % 7 === 0);
      const height = (b % 5 === 0) ? 12 : 8;
      ctx.fillRect(barcodeStart + (b * 6), barcodeY - (height / 2), isThick ? barWidth * 1.6 : barWidth, height);
    }
    ctx.restore();
  }

  // 5. Apply Analog Film Grain if enabled
  if (enableFilmGrain) {
    applyFilmGrain(ctx, canvasWidth, canvasHeight, frameColor.isLight);
  }

  return canvas.toDataURL('image/png', 1.0);
}
