import { state } from "./state.js";
import { renderShape, renderSelectionOverlay } from "../shapes/renderShape.js";
import { getSelectionBox } from "../tools/selectTool.js";

// Canvas aur context references store karne ke liye
let canvas = null;
let ctx = null;
let renderRequested = false;

/**
 * Canvas element aur rendering context ko initialize karein
 * @param {HTMLCanvasElement} canvasElement 
 */
export function initCanvas(canvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext("2d");
  resizeCanvas();
}

/**
 * Canvas resize handles, devicePixelRatio scale refresh karne ke liye
 */
export function resizeCanvas() {
  if (!canvas || !ctx) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  // Set grid dimensions in device pixels for sharpness
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // CSS size specify karo viewport me properly mapping ke liye
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // Scale matrix set karo taki drawing codes normal screen coordinates use karein
  ctx.scale(dpr, dpr);
}

/**
 * Custom light dot-grid design background draw karne ke liye helper function
 * @param {typeof state.viewport} viewport 
 * @param {number} width 
 * @param {number} height 
 */
function drawGrid(viewport, width, height) {
  const gridSize = 20; // grid standard spacing
  const zoom = viewport.zoom;
  const dotSize = 1.5; // pixel dot size

  ctx.fillStyle = "rgba(255, 255, 255, 0.12)"; // modern dot color

  // Screen coordinates space me steps calculate karo
  const step = gridSize * zoom;

  // World grid se align karne ke liye minimum index calculate karo
  const minK_x = Math.floor(-viewport.x / step);
  const minK_y = Math.floor(-viewport.y / step);
  const maxK_x = Math.ceil((width - viewport.x) / step);
  const maxK_y = Math.ceil((height - viewport.y) / step);

  // Loop paths for drawing dots
  for (let kx = minK_x; kx <= maxK_x; kx++) {
    const sx = kx * step + viewport.x;
    for (let ky = minK_y; ky <= maxK_y; ky++) {
      const sy = ky * step + viewport.y;

      // Draw standard single pixel dot
      ctx.fillRect(sx, sy, dotSize, dotSize);
    }
  }
}

/**
 * Pure canvas drawing cycle ko run karne ke liye
 */
export function render() {
  if (!canvas || !ctx) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  // Screen clear and redraw background workspace
  ctx.fillStyle = "#121214";
  ctx.fillRect(0, 0, width, height);

  const { viewport } = state;

  // background dot-grid draw karo
  drawGrid(viewport, width, height);

  // future scale & translation operations shapes rendering ke liye
  ctx.save();
  ctx.translate(viewport.x, viewport.y);
  ctx.scale(viewport.zoom, viewport.zoom);

  // state me module dynamic shapes looping se draw karo
  state.shapes.forEach(shape => {
    renderShape(ctx, shape);
  });

  // Selected shapes overlays ko topmost layer par draw karein
  state.shapes.forEach(shape => {
    if (state.selectedShapeIds.includes(shape.id)) {
      renderSelectionOverlay(ctx, shape);
    }
  });

  // Drag selection box draw karein (multi-select border style matching premium visual colors)
  const selBox = getSelectionBox();
  if (selBox) {
    ctx.strokeStyle = "rgba(74, 144, 217, 0.85)";
    ctx.lineWidth = 1.5 / viewport.zoom;
    ctx.setLineDash([4 / viewport.zoom, 4 / viewport.zoom]);
    ctx.fillStyle = "rgba(74, 144, 217, 0.08)";
    ctx.beginPath();
    ctx.rect(selBox.x, selBox.y, selBox.width, selBox.height);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]); // clear dash style
  }

  ctx.restore();
}

/**
 * Render call batching request animation frame pipeline ke through
 */
export function requestRender() {
  if (renderRequested) return;
  
  renderRequested = true;
  requestAnimationFrame(() => {
    renderRequested = false;
    render();
  });
}
