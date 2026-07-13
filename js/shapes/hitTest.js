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
