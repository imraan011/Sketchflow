// Eraser tool to delete whole shapes at once
import { state } from "../core/state.js";
import { getShapeAtStroke } from "../shapes/hitTest.js";
import { screenToWorld } from "../core/coordinates.js";
import { requestRender } from "../core/canvas.js";

let isErasing = false;

export const eraserTool = {
  name: "eraser",

  onPointerDown(e) {
    isErasing = true;
    this.eraseAtPointer(e);
  },

  onPointerMove(e) {
    if (!isErasing) return;
    this.eraseAtPointer(e);
  },

  onPointerUp(e) {
    isErasing = false;
  },

  /**
   * Pointer position par shape ke STROKE ke paas check karke remove karne ke liye helper function.
   * Fill/interior area pe click karne se kuch nahi hoga — sirf stroke/outline touch hone par erase hoga.
   * @param {PointerEvent} e 
   */
  eraseAtPointer(e) {
    const worldPos = screenToWorld(e.clientX, e.clientY, state.viewport);
    // Zoom ke hisaab se tolerance adjust karein — zoom out pe thoda zyada forgiving
    const tolerance = Math.max(8, 12 / state.viewport.zoom);
    const hitShape = getShapeAtStroke(state.shapes, worldPos.x, worldPos.y, tolerance);

    if (hitShape) {
      state.removeShape(hitShape.id);
      requestRender();
    }
  }
};
