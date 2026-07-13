// Bounding box calculations helper library

// WeakMap reference cache for shape objects bounds performance improvements
const boundsCache = new WeakMap();

/**
 * Kisi bhi shape type (pencil points arrays ya simple dimension models) ke bounds find karne ke liye helper function
 * @param {object} shape 
 * @returns {{ x: number, y: number, width: number, height: number }} bounds box schema
 */
export function getShapeBounds(shape) {
  if (!shape) return { x: 0, y: 0, width: 0, height: 0 };

  // Agar pichle state loop ka cached boundary data exist karta ho
  if (boundsCache.has(shape)) {
    return boundsCache.get(shape);
  }

  let bounds;

  if (shape.type === "pencil") {
    const points = shape.points || [];
    if (points.length === 0) {
      bounds = { x: 0, y: 0, width: 0, height: 0 };
    } else {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }

      bounds = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    }
  } else {
    // Normal rectangular boundaries (line, arrow, rect, ellipse check negative directions too)
    const minX = Math.min(shape.x, shape.x + shape.width);
    const minY = Math.min(shape.y, shape.y + shape.height);
    const w = Math.abs(shape.width);
    const h = Math.abs(shape.height);

    bounds = { x: minX, y: minY, width: w, height: h };
  }

  // Update bounds weak storage reference cache
  boundsCache.set(shape, bounds);
  
  return bounds;
}
