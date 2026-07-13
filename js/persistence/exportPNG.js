// Phase 7 — PNG export (viewport-independent, content-only)
import { state } from "../core/state.js";
import { getShapeBounds } from "../shapes/bounds.js";
import { renderShape } from "../shapes/renderShape.js";
import { showToast } from "./exportImport.js";

const PADDING = 40; // px of whitespace around the content bounding box

/**
 * Saare shapes ke across union bounding box compute karta hai.
 * @param {object[]} shapes
 * @returns {{ minX: number, minY: number, maxX: number, maxY: number } | null}
 */
function getContentBounds(shapes) {
  if (!shapes || shapes.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const shape of shapes) {
    const b = getShapeBounds(shape);
    if (b.width === 0 && b.height === 0) continue; // zero-size shapes skip

    if (b.x < minX) minX = b.x;
    if (b.y < minY) minY = b.y;
    if (b.x + b.width > maxX) maxX = b.x + b.width;
    if (b.y + b.height > maxY) maxY = b.y + b.height;
  }

  // Agar sab shapes zero-size the to null return karo
  if (!isFinite(minX)) return null;

  return { minX, minY, maxX, maxY };
}

/**
 * Saare shapes ko ek off-screen canvas par draw karta hai aur PNG download trigger karta hai.
 * Viewport (pan/zoom) ko completely ignore karta hai — full drawing, tightly cropped.
 * @param {{ backgroundColor?: string }} options
 */
export function exportAsPNG(options = {}) {
  const bounds = getContentBounds(state.shapes);

  if (!bounds) {
    showToast("Nothing to export — draw something first!", "error");
    return;
  }

  const { minX, minY, maxX, maxY } = bounds;
  const contentW = maxX - minX;
  const contentH = maxY - minY;

  // Canvas dimensions: content + symmetric padding
  const canvasW = contentW + PADDING * 2;
  const canvasH = contentH + PADDING * 2;

  // Off-screen canvas — kabhi DOM me append nahi hoga
  const offscreen = document.createElement("canvas");
  offscreen.width = canvasW;
  offscreen.height = canvasH;

  const ctx = offscreen.getContext("2d");

  // transparent default — sirf shapes visible honge, background nahi
  const bg = options.backgroundColor ?? "transparent";
  if (bg !== "transparent") {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  // Translate so that (minX, minY) maps to (PADDING, PADDING) on this canvas
  ctx.translate(PADDING - minX, PADDING - minY);

  // Existing renderShape reuse — no duplicate drawing logic
  for (const shape of state.shapes) {
    renderShape(ctx, shape);
  }

  // toBlob is async — UI thread block nahi hota
  offscreen.toBlob((blob) => {
    if (!blob) {
      showToast("Failed to generate PNG. Please try again.", "error");
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `excaliclone-${Date.now()}.png`;
    a.click();

    // Object URL memory cleanup
    URL.revokeObjectURL(url);
    showToast("Image exported successfully!", "success");
  }, "image/png");
}
