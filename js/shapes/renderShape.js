// Shapes rendering helpers
import { getSmoothedPath } from "./smoothing.js";
import { getShapeBounds } from "./bounds.js";

/**
 * Shape data object ko HTML5 Canvas context par render karne ke liye helper function
 * @param {CanvasRenderingContext2D} ctx 
 * @param {object} shape 
 */
export function renderShape(ctx, shape) {
  ctx.save();

  // Canvas stroke aur fill properties set karein
  ctx.strokeStyle = shape.strokeColor || "#ffffff";
  ctx.lineWidth = shape.strokeWidth || 2;
  ctx.fillStyle = shape.fillColor || "transparent";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (shape.type) {
    case "rectangle": {
      ctx.beginPath();
      // Round rect draws with a subtle radius (4px) matching premium aesthetics
      ctx.roundRect(shape.x, shape.y, shape.width, shape.height, 4);
      if (shape.fillColor !== "transparent") {
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case "ellipse": {
      const rx = Math.abs(shape.width / 2);
      const ry = Math.abs(shape.height / 2);
      const cx = shape.x + shape.width / 2;
      const cy = shape.y + shape.height / 2;

      // Ensure positive non-zero radii to prevent exceptions
      if (rx > 0 && ry > 0) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        if (shape.fillColor !== "transparent") {
          ctx.fill();
        }
        ctx.stroke();
      }
      break;
    }

    case "line": {
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
      ctx.stroke();
      break;
    }

    case "arrow": {
      const startX = shape.x;
      const startY = shape.y;
      const endX = shape.x + shape.width;
      const endY = shape.y + shape.height;

      // Draw standard line first
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Arrow head construct karne ke liye angle find karo
      const angle = Math.atan2(endY - startY, endX - startX);
      const headLength = 15; // length of V-shaped branches
      const headAngle = Math.PI / 6; // angle offset (30 deg)

      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(angle - headAngle),
        endY - headLength * Math.sin(angle - headAngle)
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(angle + headAngle),
        endY - headLength * Math.sin(angle + headAngle)
      );
      ctx.stroke();
      break;
    }

    case "pencil": {
      if (!shape.points || shape.points.length === 0) break;

      if (shape.points.length < 2) {
        // Single dot draw karein single clicks visual feedback display ke liye
        const radius = (shape.strokeWidth || 2) / 2;
        ctx.beginPath();
        ctx.arc(shape.points[0].x, shape.points[0].y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = shape.strokeColor || "#ffffff";
        ctx.fill();
      } else {
        // Smoothed Bezier curve stroke trace karein Path2D options use karke
        const pathString = getSmoothedPath(shape.points);
        const path2d = new Path2D(pathString);
        ctx.stroke(path2d);
      }
      break;
    }

    default:
      console.warn(`Unsupported shape type encountered: ${shape.type}`);
  }

  ctx.restore();
}

/**
 * Selected shape ke charo taraf dashed bounding box aur 4 corner resize handles draw karne ke liye
 * @param {CanvasRenderingContext2D} ctx 
 * @param {object} shape 
 */
export function renderSelectionOverlay(ctx, shape) {
  const bounds = getShapeBounds(shape);
  if (!bounds) return;

  ctx.save();

  // Dashed outline box styling
  ctx.strokeStyle = "#4a90d9"; // standard blue color
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

  // Resize corner handles (8x8px square centered at corners)
  const handleSize = 8;
  const half = handleSize / 2;
  
  const corners = [
    { x: bounds.x, y: bounds.y }, // top-left
    { x: bounds.x + bounds.width, y: bounds.y }, // top-right
    { x: bounds.x, y: bounds.y + bounds.height }, // bottom-left
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height } // bottom-right
  ];

  ctx.setLineDash([]); // disable dash for handles
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#4a90d9";
  ctx.lineWidth = 1.5;

  for (const corner of corners) {
    ctx.fillRect(corner.x - half, corner.y - half, handleSize, handleSize);
    ctx.strokeRect(corner.x - half, corner.y - half, handleSize, handleSize);
  }

  ctx.restore();
}
