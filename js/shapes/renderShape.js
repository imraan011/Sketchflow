// Shapes rendering helpers

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

    default:
      console.warn(`Unsupported shape type encountered: ${shape.type}`);
  }

  ctx.restore();
}
