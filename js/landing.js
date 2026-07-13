import { renderShape } from "./shapes/renderShape.js";

// Sample shapes composition for the static demo canvas
const demoShapes = [
  {
    id: "rect-1",
    type: "rectangle",
    x: 40,
    y: 50,
    width: 160,
    height: 100,
    strokeColor: "#3b82f6", // Blue
    strokeWidth: 3,
    fillColor: "rgba(59, 130, 246, 0.08)"
  },
  {
    id: "ellipse-1",
    type: "ellipse",
    x: 320,
    y: 30,
    width: 140,
    height: 140,
    strokeColor: "#10b981", // Emerald green
    strokeWidth: 3,
    fillColor: "rgba(16, 185, 129, 0.08)"
  },
  {
    id: "arrow-1",
    type: "arrow",
    x: 220,
    y: 100,
    width: 80,
    height: 0,
    strokeColor: "#a0a0a5", // Gray arrow connecting rect and ellipse
    strokeWidth: 2
  },
  {
    id: "rect-2",
    type: "rectangle",
    x: 80,
    y: 200,
    width: 340,
    height: 80,
    strokeColor: "#f59e0b", // Amber
    strokeWidth: 3,
    fillColor: "rgba(245, 158, 11, 0.05)"
  },
  {
    id: "pencil-1",
    type: "pencil",
    strokeColor: "#ffffff", // White scribble
    strokeWidth: 2.5,
    points: [
      { x: 120, y: 240 },
      { x: 140, y: 235 },
      { x: 170, y: 245 },
      { x: 210, y: 230 },
      { x: 250, y: 250 },
      { x: 290, y: 235 },
      { x: 330, y: 245 },
      { x: 360, y: 235 },
      { x: 380, y: 240 }
    ]
  }
];

function initLandingDemo() {
  const canvas = document.getElementById("demo-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  
  // Set up high-DPI scaling
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  // Set display size
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  
  // Set backing store size
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  // Scale context to draw in CSS pixel coordinates
  ctx.scale(dpr, dpr);

  // Clear context
  ctx.clearRect(0, 0, rect.width, rect.height);

  // Render the pre-defined shapes
  for (const shape of demoShapes) {
    renderShape(ctx, shape);
  }
}

// Initialize on load
window.addEventListener("DOMContentLoaded", initLandingDemo);

// Re-render on window resize to keep it sharp and scaled correctly
window.addEventListener("resize", initLandingDemo);
