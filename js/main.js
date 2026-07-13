import { state } from "./core/state.js";
import { initCanvas, resizeCanvas, requestRender } from "./core/canvas.js";
import { ToolManager } from "./tools/ToolManager.js";
import { createShapeTool } from "./tools/shapeTool.js";
import { pencilTool } from "./tools/pencilTool.js";
import { selectTool } from "./tools/selectTool.js";
import { initKeyboard } from "./core/keyboard.js";
import { initZoom } from "./tools/zoomHandler.js";

// Initialize canvas flow
const canvasElement = document.getElementById("app-canvas");
if (canvasElement) {
  initCanvas(canvasElement);
} else {
  console.error("Critical Error: canvas element with id 'app-canvas' not found.");
}

// Drawing tools ko registry me store karein
ToolManager.registerTool(createShapeTool("rectangle"));
ToolManager.registerTool(createShapeTool("ellipse"));
ToolManager.registerTool(createShapeTool("line"));
ToolManager.registerTool(createShapeTool("arrow"));
ToolManager.registerTool(pencilTool);
ToolManager.registerTool(selectTool);

// Canvas pointer handlers hook/initialize karein
if (canvasElement) {
  ToolManager.init(canvasElement);
}

// Keyboard keypress bindings bind karein
initKeyboard();

// Zoom handlers scroll mouse listeners link settings
if (canvasElement) {
  initZoom(canvasElement);
}

// Zoom percentage display click reset actions connection
const zoomResetBtn = document.getElementById("zoom-reset-btn");
if (zoomResetBtn) {
  zoomResetBtn.addEventListener("click", () => {
    state.setViewport({ x: 0, y: 0, zoom: 1 });
  });
}

// Toolbar active highlights refresh handler
function updateToolbarUI() {
  const buttons = document.querySelectorAll("#toolbar button");
  buttons.forEach(button => {
    if (button.dataset.tool === state.currentTool) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

// Toolbar buttons par click events click and update setup
document.querySelectorAll("#toolbar button").forEach(button => {
  button.addEventListener("click", () => {
    const selectedTool = button.dataset.tool;
    state.setTool(selectedTool);
  });
});

// Zoom indicator UI refresh text helper
function updateZoomUI() {
  const zoomBtn = document.getElementById("zoom-reset-btn");
  if (zoomBtn) {
    const percentage = Math.round(state.viewport.zoom * 100);
    zoomBtn.textContent = `${percentage}%`;
  }
}

// State changes ko subscribe karo update re-rendering aur UI sync ke liye
state.subscribe(() => {
  requestRender();
  updateToolbarUI();
  updateZoomUI();
});

// Window resize handler updates grid dynamic mapping
window.addEventListener("resize", () => {
  resizeCanvas();
  requestRender();
});

// Initial rendering cycle trigger aur UI refresh check
updateToolbarUI();
updateZoomUI();
requestRender();

console.log("Excali Draw initialized");
export {};

