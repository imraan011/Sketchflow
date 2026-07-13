import { state } from "../core/state.js";
import { screenToWorld } from "../core/coordinates.js";
import { createShape } from "../shapes/Shape.js";
import { requestRender } from "../core/canvas.js";

/**
 * Shape types ke liye generic drawing tool create karne ka factory helper
 * @param {string} shapeType - ('rectangle', 'ellipse', 'line', 'arrow')
 * @returns {object} tool implementation object
 */
export function createShapeTool(shapeType) {
  // Closure variable instances for tracking drawing state locally
  let activeShapeId = null;
  let startPos = null;

  return {
    name: shapeType,

    onPointerDown(e) {
      // Screen context points ko current zoom scale coordinates me transform karo
      const coords = screenToWorld(e.clientX, e.clientY, state.viewport);
      startPos = coords;

      // Naya shape configure karke global state me add karo
      const newShape = createShape(shapeType, coords.x, coords.y);
      activeShapeId = newShape.id;

      state.addShape(newShape);
      
      // Request immediate rendering block
      requestRender();
    },

    onPointerMove(e) {
      if (!activeShapeId || !startPos) return;

      const currentPos = screenToWorld(e.clientX, e.clientY, state.viewport);

      if (shapeType === "rectangle" || shapeType === "ellipse") {
        // Drag options me top-left calculation dynamically shift control karne ke liye min/abs scale check
        const x = Math.min(startPos.x, currentPos.x);
        const y = Math.min(startPos.y, currentPos.y);
        const width = Math.abs(currentPos.x - startPos.x);
        const height = Math.abs(currentPos.y - startPos.y);

        state.updateShape(activeShapeId, { x, y, width, height });
      } else {
        // Line aur Arrow directions represent offset vectors (width/height coordinates standard translation)
        const width = currentPos.x - startPos.x;
        const height = currentPos.y - startPos.y;

        state.updateShape(activeShapeId, { width, height });
      }

      requestRender();
    },

    onPointerUp(e) {
      if (!activeShapeId || !startPos) return;

      const currentPos = screenToWorld(e.clientX, e.clientY, state.viewport);
      const width = currentPos.x - startPos.x;
      const height = currentPos.y - startPos.y;
      
      // Accidental click to drawing dot limit filter check (3px threshold)
      const sizeThreshold = 3;
      const isZeroSize = shapeType === "rectangle" || shapeType === "ellipse"
        ? Math.abs(width) < sizeThreshold && Math.abs(height) < sizeThreshold
        : Math.hypot(width, height) < sizeThreshold;

      if (isZeroSize) {
        // Accidental clicking shape remove clean settings
        state.removeShape(activeShapeId);
      }

      // Local state variables reference reset karein
      activeShapeId = null;
      startPos = null;

      requestRender();
    }
  };
}
