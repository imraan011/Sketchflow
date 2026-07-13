// Hit testing (click detection) algorithms library
import { getShapeBounds } from "./bounds.js";

/**
 * Click point to line segment perpendicular distance calculate karne ke liye helper function
 */
function getDistanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/**
 * Kisi point par hit hone wale shapes me se sabse topmost (reverse order loop) shape return karta hai
 * @param {Array<object>} shapes 
 * @param {number} worldX 
 * @param {number} worldY 
 * @returns {object|null} hit shape ya null
 */
export function getShapeAtPoint(shapes, worldX, worldY) {
  // Reverse loop check taki topmost elements overlap space me pehle click access karein
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    const bounds = getShapeBounds(shape);

    switch (shape.type) {
      case "rectangle":
      case "ellipse": {
        // Rectangle aur Ellipse bounding box target collision area validation
        if (
          worldX >= bounds.x &&
          worldX <= bounds.x + bounds.width &&
          worldY >= bounds.y &&
          worldY <= bounds.y + bounds.height
        ) {
          return shape;
        }
        break;
      }

      case "line":
      case "arrow": {
        const x1 = shape.x;
        const y1 = shape.y;
        const x2 = shape.x + shape.width;
        const y2 = shape.y + shape.height;
        const dist = getDistanceToSegment(worldX, worldY, x1, y1, x2, y2);
        
        if (dist <= 8) {
          return shape;
        }
        break;
      }

      case "pencil": {
        // Optimisation: bounds boundary outline coordinates pehle evaluate karo tolerance limit (8px) ke sath
        if (
          worldX < bounds.x - 8 ||
          worldX > bounds.x + bounds.width + 8 ||
          worldY < bounds.y - 8 ||
          worldY > bounds.y + bounds.height + 8
        ) {
          continue;
        }

        const points = shape.points || [];
        // Points matching segment paths loop check
        for (let j = 0; j < points.length - 1; j++) {
          const p1 = points[j];
          const p2 = points[j + 1];
          const dist = getDistanceToSegment(worldX, worldY, p1.x, p1.y, p2.x, p2.y);
          if (dist <= 8) {
            return shape;
          }
        }
        
        // Agar pencil stroke me sirf ek point (dot) ho
        if (points.length === 1) {
          const p = points[0];
          if (Math.hypot(worldX - p.x, worldY - p.y) <= 8) {
            return shape;
          }
        }
        break;
      }
    }
  }

  return null;
}

/**
 * Stroke-only hit detection for eraser tool.
 * Rectangle/Ellipse ke liye sirf border edges check karta hai, fill area nahi.
 * Cursor jo shape ke STROKE/OUTLINE ke paas ho WAHI erase hogi — interior empty space par click se kuch nahi hoga.
 * @param {Array<object>} shapes 
 * @param {number} worldX 
 * @param {number} worldY 
 * @param {number} tolerance - distance in world pixels (default 8)
 * @returns {object|null} hit shape ya null
 */
export function getShapeAtStroke(shapes, worldX, worldY, tolerance = 8) {
  // Reverse order se check karo taaki topmost shape pehle milein
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    const bounds = getShapeBounds(shape);

    switch (shape.type) {
      case "rectangle": {
        // Sirf 4 edges ke paas check karo (not the interior fill)
        const { x, y, width, height } = bounds;
        const x2 = x + width;
        const y2 = y + height;

        // Top edge
        if (getDistanceToSegment(worldX, worldY, x, y, x2, y) <= tolerance) return shape;
        // Bottom edge
        if (getDistanceToSegment(worldX, worldY, x, y2, x2, y2) <= tolerance) return shape;
        // Left edge
        if (getDistanceToSegment(worldX, worldY, x, y, x, y2) <= tolerance) return shape;
        // Right edge
        if (getDistanceToSegment(worldX, worldY, x2, y, x2, y2) <= tolerance) return shape;
        break;
      }

      case "ellipse": {
        // Ellipse circumference ke paas check — parametric point approximate 16 samples se
        const cx = bounds.x + bounds.width / 2;
        const cy = bounds.y + bounds.height / 2;
        const rx = bounds.width / 2;
        const ry = bounds.height / 2;
        if (rx <= 0 || ry <= 0) break;

        // 16 points ki circumference pe sample check karein — nearest ka distance lein
        const SAMPLES = 24;
        let minDist = Infinity;
        for (let k = 0; k < SAMPLES; k++) {
          const angle = (k / SAMPLES) * 2 * Math.PI;
          const epx = cx + Math.cos(angle) * rx;
          const epy = cy + Math.sin(angle) * ry;
          const nextAngle = ((k + 1) / SAMPLES) * 2 * Math.PI;
          const epx2 = cx + Math.cos(nextAngle) * rx;
          const epy2 = cy + Math.sin(nextAngle) * ry;
          const d = getDistanceToSegment(worldX, worldY, epx, epy, epx2, epy2);
          if (d < minDist) minDist = d;
        }
        if (minDist <= tolerance) return shape;
        break;
      }

      case "line":
      case "arrow": {
        const x1 = shape.x;
        const y1 = shape.y;
        const x2 = shape.x + shape.width;
        const y2 = shape.y + shape.height;
        if (getDistanceToSegment(worldX, worldY, x1, y1, x2, y2) <= tolerance) return shape;
        break;
      }

      case "pencil": {
        // Quick bounds reject
        if (
          worldX < bounds.x - tolerance ||
          worldX > bounds.x + bounds.width + tolerance ||
          worldY < bounds.y - tolerance ||
          worldY > bounds.y + bounds.height + tolerance
        ) break;

        const points = shape.points || [];
        for (let j = 0; j < points.length - 1; j++) {
          const p1 = points[j];
          const p2 = points[j + 1];
          if (getDistanceToSegment(worldX, worldY, p1.x, p1.y, p2.x, p2.y) <= tolerance) return shape;
        }
        if (points.length === 1) {
          if (Math.hypot(worldX - points[0].x, worldY - points[0].y) <= tolerance) return shape;
        }
        break;
      }
    }
  }
  return null;
}

/**
 * Selection rectangle region boundaries me intersect hone wale shapes ka listing filter array
 * @param {Array<object>} shapes 
 * @param {number} rx 
 * @param {number} ry 
 * @param {number} rw 
 * @param {number} rh 
 * @returns {Array<object>} intersecting shapes
 */
export function getShapesInRect(shapes, rx, ry, rw, rh) {
  const left = Math.min(rx, rx + rw);
  const right = Math.max(rx, rx + rw);
  const top = Math.min(ry, ry + rh);
  const bottom = Math.max(ry, ry + rh);

  return shapes.filter(shape => {
    const b = getShapeBounds(shape);
    return (
      b.x < right &&
      b.x + b.width > left &&
      b.y < bottom &&
      b.y + b.height > top
    );
  });
}
