import { state } from "../core/state.js";
import { panTool } from "./panTool.js";
import { getIsSpacePressed } from "../core/keyboard.js";

// Sabhi registered tools list register karne ke liye storage
const tools = {};

// Active override tool instance (panning priority logic support)
let activeOverrideTool = null;

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

    // Middle-click autoscroll behavior block/prevent settings
    canvasElement.addEventListener("mousedown", (e) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    });

    // Pointer events bind kar rahe hain ek bar context capture ke liye
    canvasElement.addEventListener("pointerdown", (e) => {
      const isMiddleButton = e.button === 1;

      // Space key held ho ya middle-click scroll ho to panTool trigger intercept karein
      if (getIsSpacePressed() || isMiddleButton) {
        activeOverrideTool = panTool;
        panTool.onPointerDown(e);
      } else {
        activeOverrideTool = null;
        const activeTool = tools[state.currentTool];
        if (activeTool && typeof activeTool.onPointerDown === "function") {
          activeTool.onPointerDown(e);
        }
      }
    });

    canvasElement.addEventListener("pointermove", (e) => {
      if (activeOverrideTool) {
        activeOverrideTool.onPointerMove(e);
      } else {
        const activeTool = tools[state.currentTool];
        if (activeTool && typeof activeTool.onPointerMove === "function") {
          activeTool.onPointerMove(e);
        }
      }
    });

    canvasElement.addEventListener("pointerup", (e) => {
      if (activeOverrideTool) {
        activeOverrideTool.onPointerUp(e);
        activeOverrideTool = null;
      } else {
        const activeTool = tools[state.currentTool];
        if (activeTool && typeof activeTool.onPointerUp === "function") {
          activeTool.onPointerUp(e);
        }
      }
    });
  }
};
