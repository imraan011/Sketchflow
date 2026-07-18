import { state } from "./core/state.js";
import { initCanvas, resizeCanvas, requestRender } from "./core/canvas.js";
import { ToolManager } from "./tools/ToolManager.js";
import { createShapeTool } from "./tools/shapeTool.js";
import { pencilTool } from "./tools/pencilTool.js";
import { selectTool } from "./tools/selectTool.js";
import { panTool } from "./tools/panTool.js";
import { eraserTool } from "./tools/eraserTool.js";
import { textTool } from "./tools/textTool.js";
import { initKeyboard } from "./core/keyboard.js";
import { initZoom } from "./tools/zoomHandler.js";
import { loadFromLocalStorage } from "./persistence/localStorage.js";
import { initAutosave } from "./persistence/autosave.js";
import { exportAsJSON, importFromJSON } from "./persistence/exportImport.js";
import { exportAsPNG } from "./persistence/exportPNG.js";
import { getHistoryStatus } from "./core/history.js";
import { showConfirm } from "./ui/modal.js";

// LocalStorage startup initialization load
const loadedState = loadFromLocalStorage();
if (loadedState) {
  state.loadState(loadedState);
}

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
ToolManager.registerTool(panTool);
ToolManager.registerTool(eraserTool);
ToolManager.registerTool(textTool);

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
document.querySelectorAll("#toolbar button[data-tool]").forEach(button => {
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

// Active tool cursors update sync helper
function updateCanvasCursor() {
  const canvasEl = document.getElementById("app-canvas");
  if (!canvasEl) return;
  if (state.currentTool === "hand") {
    canvasEl.style.cursor = "grab";
  } else if (state.currentTool === "eraser") {
    canvasEl.style.cursor = "alias";
  } else if (state.currentTool === "select") {
    canvasEl.style.cursor = "default";
  } else if (state.currentTool === "text") {
    canvasEl.style.cursor = "text";
  } else {
    canvasEl.style.cursor = "crosshair";
  }
}

function updateHistoryUI() {
  const undoBtn = document.getElementById("undo-btn");
  const redoBtn = document.getElementById("redo-btn");
  if (undoBtn && redoBtn) {
    const status = getHistoryStatus();
    undoBtn.disabled = !status.canUndo;
    redoBtn.disabled = !status.canRedo;
  }
}

// State changes ko subscribe karo update re-rendering aur UI sync ke liye
state.subscribe(() => {
  requestRender();
  updateToolbarUI();
  updateZoomUI();
  updateCanvasCursor();
  updateHistoryUI();
});

// Undo/Redo button event listeners
const undoBtn = document.getElementById("undo-btn");
if (undoBtn) {
  undoBtn.addEventListener("click", () => {
    state.undo();
  });
}

const redoBtn = document.getElementById("redo-btn");
if (redoBtn) {
  redoBtn.addEventListener("click", () => {
    state.redo();
  });
}

// Initialize history buttons status
updateHistoryUI();

// Autosave system initialize
initAutosave();

// Custom event for autosave completed feedback
window.addEventListener("excaliclone-saved", () => {
  const indicator = document.getElementById("status-indicator");
  if (indicator) {
    indicator.classList.add("show");
    setTimeout(() => {
      indicator.classList.remove("show");
    }, 1500);
  }
});

// Export JSON control button click listener
const exportBtn = document.getElementById("export-btn");
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    exportAsJSON();
  });
}

// Export PNG button — opacity dim during async toBlob, never touch innerHTML
const exportPngBtn = document.getElementById("export-png-btn");
if (exportPngBtn) {
  exportPngBtn.addEventListener("click", () => {
    exportPngBtn.style.opacity = "0.45";
    exportPngBtn.disabled = true;

    setTimeout(() => {
      exportAsPNG();
      exportPngBtn.style.opacity = "";
      exportPngBtn.disabled = false;
    }, 50);
  });
}

// Import control buttons click listener triggers hidden input file chooser
const importBtn = document.getElementById("import-btn");
const importFileInput = document.getElementById("import-file-input");
if (importBtn && importFileInput) {
  importBtn.addEventListener("click", () => {
    importFileInput.click();
  });

  importFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      importFromJSON(file);
      // Reset input value to allow importing the same file again if desired
      importFileInput.value = "";
    }
  });
}

// Drag & drop support direct imports onto canvas workspace
window.addEventListener("dragover", (e) => {
  e.preventDefault();
});
window.addEventListener("drop", (e) => {
  e.preventDefault();
  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".json")) {
      importFromJSON(file);
    }
  }
});

// Reset button action handler — async modal to avoid INP jank
const resetBtn = document.getElementById("reset-btn");
if (resetBtn) {
  resetBtn.addEventListener("click", async () => {
    const proceed = await showConfirm("Are you sure you want to clear the canvas completely? This cannot be undone.");
    if (proceed) {
      state.loadState({ shapes: [], viewport: { x: 0, y: 0, zoom: 1 } });
    }
  });
}

// Window resize handler updates grid dynamic mapping
window.addEventListener("resize", () => {
  resizeCanvas();
  requestRender();
});

// Initial rendering cycle trigger aur UI refresh check
updateToolbarUI();
updateZoomUI();
updateCanvasCursor();
requestRender();

console.log("Excali Draw initialized");
export {};

