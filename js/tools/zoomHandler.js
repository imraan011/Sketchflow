// Dynamic cursor-centered zoom calculator library
import { state } from "../core/state.js";
import { screenToWorld } from "../core/coordinates.js";
import { requestRender } from "../core/canvas.js";

/**
 * Global wheel scrolling listeners setup zoom mapping
 * @param {HTMLCanvasElement} canvasElement 
 */
export function initZoom(canvasElement) {
  if (!canvasElement) return;

  canvasElement.addEventListener("wheel", (e) => {
    // Zoom speed default scale factor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    let newZoom = state.viewport.zoom * zoomFactor;

    // Zoom limit threshold clamp settings (0.1x to 5.0x zoom limit)
    newZoom = Math.max(0.1, Math.min(5, newZoom));

    // Current cursor world positions coordinate tracking
    const cursorWorld = screenToWorld(e.clientX, e.clientY, state.viewport);

    // Zoom shift calculations to center viewport focus
    const newViewportX = e.clientX - cursorWorld.x * newZoom;
    const newViewportY = e.clientY - cursorWorld.y * newZoom;

    // Viewport shifts apply coordinate mapping
    state.setViewport({
      zoom: newZoom,
      x: newViewportX,
      y: newViewportY
    });

    // Browser scroll default actions block
    e.preventDefault();
    requestRender();
  }, { passive: false }); // passive: false ensures preventDefault works
}
