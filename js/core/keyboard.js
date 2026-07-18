// Keyboard event handlers mapping logic
import { state } from "./state.js";
import { exportAsJSON } from "../persistence/exportImport.js";

// Spacebar held state variables tracker
let isSpacePressed = false;

/**
 * Spacebar current status read check helper function
 * @returns {boolean} space key status
 */
export function getIsSpacePressed() {
  return isSpacePressed;
}

/**
 * Key press shortcuts registers
 */
export function initKeyboard() {
  window.addEventListener("keydown", (e) => {
    // Input fields me typing check guard clauses
    const activeEl = document.activeElement;
    const isInput = activeEl && (
      activeEl.tagName === "INPUT" ||
      activeEl.tagName === "TEXTAREA" ||
      activeEl.isContentEditable
    );

    // Track space key globally outside text inputs
    if (e.code === "Space" && !isInput) {
      isSpacePressed = true;
      
      const canvasEl = document.getElementById("app-canvas");
      if (canvasEl) {
        canvasEl.style.cursor = "grab";
      }
      
      // Stop space key from scrolling the web page
      e.preventDefault();
    }

    if (isInput) return;

    const keyLower = e.key.toLowerCase();
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;

    // Delete or Backspace -> Delete selection
    if (e.key === "Delete" || e.key === "Backspace") {
      if (state.selectedShapeIds.length > 0) {
        state.deleteSelected();
      }
    } 
    // Escape -> Deselect all
    else if (e.key === "Escape") {
      state.setSelection([]);
    } 
    // Ctrl+S -> Export to JSON
    else if (isCtrlOrCmd && keyLower === "s") {
      e.preventDefault();
      exportAsJSON();
    }
    // Ctrl+0 -> Reset zoom
    else if (isCtrlOrCmd && e.key === "0") {
      e.preventDefault();
      state.setViewport({ x: 0, y: 0, zoom: 1 });
    } 
    // Ctrl+Shift+Z or Ctrl+Y -> Redo
    else if (isCtrlOrCmd && ((e.shiftKey && keyLower === "z") || keyLower === "y")) {
      e.preventDefault();
      state.redo();
    } 
    // Ctrl+Z -> Undo
    else if (isCtrlOrCmd && keyLower === "z" && !e.shiftKey) {
      e.preventDefault();
      state.undo();
    } 
    // Ctrl+C -> Copy
    else if (isCtrlOrCmd && keyLower === "c") {
      e.preventDefault();
      state.copy();
    } 
    // Ctrl+V -> Paste
    else if (isCtrlOrCmd && keyLower === "v") {
      e.preventDefault();
      state.paste();
    }
    // Tool Switching Shortcuts (No modifier keys should be held)
    else if (!isCtrlOrCmd && !e.altKey && !e.shiftKey) {
      // 1 or V -> Select
      if (e.key === "1" || keyLower === "v") {
        state.setTool("select");
      }
      // 2 or R -> Rectangle
      else if (e.key === "2" || keyLower === "r") {
        state.setTool("rectangle");
      }
      // 3 or O -> Ellipse (Oval)
      else if (e.key === "3" || keyLower === "o") {
        state.setTool("ellipse");
      }
      // 4 or L -> Line
      else if (e.key === "4" || keyLower === "l") {
        state.setTool("line");
      }
      // 5 or A -> Arrow
      else if (e.key === "5" || keyLower === "a") {
        state.setTool("arrow");
      }
      // 6 or P -> Pencil
      else if (e.key === "6" || keyLower === "p") {
        state.setTool("pencil");
      }
      // 7 ya T -> Text Tool ke liye shortcut
      else if (e.key === "7" || keyLower === "t") {
        state.setTool("text");
      }
      // H -> Hand Tool
      else if (keyLower === "h") {
        state.setTool("hand");
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      isSpacePressed = false;
      
      const canvasEl = document.getElementById("app-canvas");
      if (canvasEl) {
        canvasEl.style.cursor = "default";
      }
    }
  });
}
