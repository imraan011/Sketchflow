import { state } from "../core/state.js";

// Sabhi registered tools list register karne ke liye storage
const tools = {};

export const ToolManager = {
  /**
   * Tool objects ko registry me register karne ke liye
   * @param {object} tool - Tool schema matching { name, onPointerDown, onPointerMove, onPointerUp }
   */
  registerTool(tool) {
    if (tool && tool.name) {
      tools[tool.name] = tool;
    }
  },

  /**
   * Canvas element par listeners bind karne aur current active tool ko trigger delegate karne ke liye
   * @param {HTMLCanvasElement} canvasElement 
   */
  init(canvasElement) {
    if (!canvasElement) {
      console.error("Canvas element not found for ToolManager initialization");
      return;
    }

    // Pointer events bind kar rahe hain ek bar context capture ke liye
    canvasElement.addEventListener("pointerdown", (e) => {
      const activeTool = tools[state.currentTool];
      if (activeTool && typeof activeTool.onPointerDown === "function") {
        activeTool.onPointerDown(e);
      }
    });

    canvasElement.addEventListener("pointermove", (e) => {
      const activeTool = tools[state.currentTool];
      if (activeTool && typeof activeTool.onPointerMove === "function") {
        activeTool.onPointerMove(e);
      }
    });

    canvasElement.addEventListener("pointerup", (e) => {
      const activeTool = tools[state.currentTool];
      if (activeTool && typeof activeTool.onPointerUp === "function") {
        activeTool.onPointerUp(e);
      }
    });
  }
};
