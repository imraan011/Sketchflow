import { state } from "../core/state.js";
import { screenToWorld, worldToScreen } from "../core/coordinates.js";
import { getShapeBounds } from "../shapes/bounds.js";
import { getShapeAtPoint, getShapesInRect } from "../shapes/hitTest.js";
import { requestRender } from "../core/canvas.js";

// Selection pointer tracking closure variables
let activeMode = null; // 'moving' | 'resizing' | 'multi_selecting' | null
let grabbedHandle = null; // 'tl' | 'tr' | 'bl' | 'br' | null
let selectedShape = null;

let startWorldPos = null;
let originalShapeState = null;
let originalBounds = null;

// Multi-select selection box coordinates (world coordinates)
let selectionBox = null;
let originalShapesStates = [];

export function getSelectionBox() {
  return selectionBox;
}

/**
 * Kisi point par screen coordinate overlay box handles grab detection helper function
 */
function getHandleAtPoint(shape, screenX, screenY, viewport) {
  const bounds = getShapeBounds(shape);
  const corners = {
    tl: { x: bounds.x, y: bounds.y },
    tr: { x: bounds.x + bounds.width, y: bounds.y },
    bl: { x: bounds.x, y: bounds.y + bounds.height },
    br: { x: bounds.x + bounds.width, y: bounds.y + bounds.height }
  };

  const handleHitSize = 10; // hit tolerance space in screen pixels
  for (const [name, pos] of Object.entries(corners)) {
    const screenPos = worldToScreen(pos.x, pos.y, viewport);
    if (
      Math.abs(screenX - screenPos.x) <= handleHitSize &&
      Math.abs(screenY - screenPos.y) <= handleHitSize
    ) {
      return name;
    }
  }
  return null;
}

export const selectTool = {
  name: "select",

  onPointerDown(e) {
    const worldPos = screenToWorld(e.clientX, e.clientY, state.viewport);
    startWorldPos = worldPos;
    
    activeMode = null;
    grabbedHandle = null;
    selectedShape = null;

    // Pehle check karein ki click kisi already selected shape ke handle par to nahi hai
    if (state.selectedShapeIds.length > 0) {
      const activeShapeId = state.selectedShapeIds[0];
      const activeShape = state.shapes.find(s => s.id === activeShapeId);

      if (activeShape) {
        const handle = getHandleAtPoint(activeShape, e.clientX, e.clientY, state.viewport);
        if (handle) {
          activeMode = "resizing";
          grabbedHandle = handle;
          selectedShape = activeShape;
          originalBounds = { ...getShapeBounds(activeShape) };
          
          // Original properties structure backup save karein scaling ke liye
          originalShapeState = JSON.parse(JSON.stringify(activeShape));
          return;
        }
      }
    }

    // Agar handle par nahi hai, to shape hit testing karein
    const hitShape = getShapeAtPoint(state.shapes, worldPos.x, worldPos.y);

    if (hitShape) {
      // Agar shape already selected list me nahi hai, to ise select karein
      if (!state.selectedShapeIds.includes(hitShape.id)) {
        state.setSelection([hitShape.id]);
      }
      
      activeMode = "moving";
      selectedShape = hitShape;
      originalBounds = { ...getShapeBounds(hitShape) };
      originalShapeState = JSON.parse(JSON.stringify(hitShape));

      // Backup all selected shapes for potential multi-drag
      originalShapesStates = state.selectedShapeIds.map(id => {
        const found = state.shapes.find(s => s.id === id);
        return {
          id: id,
          state: found ? JSON.parse(JSON.stringify(found)) : null
        };
      }).filter(item => item.state !== null);
    } else {
      // Empty canvas area check pe multi-select selection box mode trigger karein
      state.setSelection([]);
      activeMode = "multi_selecting";
      selectionBox = null;
      originalShapesStates = [];
    }

    requestRender();
  },

  onPointerMove(e) {
    if (!activeMode || !startWorldPos) return;

    const currentWorldPos = screenToWorld(e.clientX, e.clientY, state.viewport);
    const deltaX = currentWorldPos.x - startWorldPos.x;
    const deltaY = currentWorldPos.y - startWorldPos.y;

    if (activeMode === "multi_selecting") {
      const x = Math.min(startWorldPos.x, currentWorldPos.x);
      const y = Math.min(startWorldPos.y, currentWorldPos.y);
      const width = Math.abs(currentWorldPos.x - startWorldPos.x);
      const height = Math.abs(currentWorldPos.y - startWorldPos.y);
      selectionBox = { x, y, width, height };

      // Rect bounds overlapping check ke dynamic ids retrieve sync karein
      const overlapping = getShapesInRect(state.shapes, x, y, width, height);
      state.setSelection(overlapping.map(s => s.id));
    } else if (activeMode === "moving" && originalShapesStates.length > 0) {
      originalShapesStates.forEach(item => {
        const shapeState = item.state;
        if (!shapeState) return;
        if (shapeState.type === "pencil") {
          const newPoints = shapeState.points.map(p => ({
            x: p.x + deltaX,
            y: p.y + deltaY
          }));
          state.updateShape(item.id, { points: newPoints });
        } else {
          state.updateShape(item.id, {
            x: shapeState.x + deltaX,
            y: shapeState.y + deltaY
          });
        }
      });
    } else if (activeMode === "resizing" && grabbedHandle && originalBounds && selectedShape) {
      // Calculate target boundary rectangle coordinates
      let newX = originalBounds.x;
      let newY = originalBounds.y;
      let newWidth = originalBounds.width;
      let newHeight = originalBounds.height;

      switch (grabbedHandle) {
        case "br":
          newWidth = originalBounds.width + deltaX;
          newHeight = originalBounds.height + deltaY;
          break;
        case "tr":
          newY = originalBounds.y + deltaY;
          newWidth = originalBounds.width + deltaX;
          newHeight = originalBounds.height - deltaY;
          break;
        case "bl":
          newX = originalBounds.x + deltaX;
          newWidth = originalBounds.width - deltaX;
          newHeight = originalBounds.height + deltaY;
          break;
        case "tl":
          newX = originalBounds.x + deltaX;
          newY = originalBounds.y + deltaY;
          newWidth = originalBounds.width - deltaX;
          newHeight = originalBounds.height - deltaY;
          break;
      }

      // Normalization: negative bounds flipped to mirror side standard calculations
      let finalX = newX;
      let finalY = newY;
      let finalWidth = newWidth;
      let finalHeight = newHeight;

      if (finalWidth < 0) {
        finalX = finalX + finalWidth;
        finalWidth = -finalWidth;
      }
      if (finalHeight < 0) {
        finalY = finalY + finalHeight;
        finalHeight = -finalHeight;
      }

      // Scaling factors calculation
      const scaleX = originalBounds.width !== 0 ? newWidth / originalBounds.width : 1;
      const scaleY = originalBounds.height !== 0 ? newHeight / originalBounds.height : 1;

      if (selectedShape.type === "pencil") {
        const newPoints = originalShapeState.points.map(p => ({
          x: newX + (p.x - originalBounds.x) * scaleX,
          y: newY + (p.y - originalBounds.y) * scaleY
        }));
        state.updateShape(selectedShape.id, { points: newPoints });
      } else if (selectedShape.type === "line" || selectedShape.type === "arrow") {
        const x1 = originalShapeState.x;
        const y1 = originalShapeState.y;
        const x2 = originalShapeState.x + originalShapeState.width;
        const y2 = originalShapeState.y + originalShapeState.height;

        const newX1 = newX + (x1 - originalBounds.x) * scaleX;
        const newY1 = newY + (y1 - originalBounds.y) * scaleY;
        const newX2 = newX + (x2 - originalBounds.x) * scaleX;
        const newY2 = newY + (y2 - originalBounds.y) * scaleY;

        state.updateShape(selectedShape.id, {
          x: newX1,
          y: newY1,
          width: newX2 - newX1,
          height: newY2 - newY1
        });
      } else {
        // Rectangle aur Ellipse shapes normalized sizes format use karte hain
        state.updateShape(selectedShape.id, {
          x: finalX,
          y: finalY,
          width: finalWidth,
          height: finalHeight
        });
      }
    }

    requestRender();
  },

  onPointerUp(e) {
    // Modify activity complete hone par history snap select push karein
    if (activeMode === "moving" || activeMode === "resizing") {
      state.pushUndo();
    }

    activeMode = null;
    grabbedHandle = null;
    selectedShape = null;
    startWorldPos = null;
    originalShapeState = null;
    originalBounds = null;
    selectionBox = null;
    originalShapesStates = [];
    
    requestRender();
  }
};
