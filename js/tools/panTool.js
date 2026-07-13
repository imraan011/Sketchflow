import { state } from "../core/state.js";
import { requestRender } from "../core/canvas.js";
import { getIsSpacePressed } from "../core/keyboard.js";

// Local tracking variables for pan operations
let isPanning = false;
let lastPointerScreenPos = null;

export const panTool = {
  name: "hand",

  onPointerDown(e) {
    isPanning = true;
    lastPointerScreenPos = { x: e.clientX, y: e.clientY };

    const canvasEl = document.getElementById("app-canvas");
    if (canvasEl) {
      canvasEl.style.cursor = "grabbing";
    }
  },

  onPointerMove(e) {
    if (!isPanning || !lastPointerScreenPos) return;

    // Panning screen-space delta calculations (no coordinate conversion needed)
    const dx = e.clientX - lastPointerScreenPos.x;
    const dy = e.clientY - lastPointerScreenPos.y;

    state.setViewport({
      x: state.viewport.x + dx,
      y: state.viewport.y + dy
    });

    lastPointerScreenPos = { x: e.clientX, y: e.clientY };
    requestRender();
  },

  onPointerUp(e) {
    isPanning = false;
    lastPointerScreenPos = null;

    const canvasEl = document.getElementById("app-canvas");
    if (canvasEl) {
      // Space button status ya active hand tool ke base par cursor style restore karein
      canvasEl.style.cursor = (state.currentTool === "hand" || getIsSpacePressed()) ? "grab" : "default";
    }
    
    requestRender();
  }
};
