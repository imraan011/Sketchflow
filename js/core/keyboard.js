// Keyboard event handlers mapping logic
import { state } from "./state.js";

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
 * Key press shortcuts (Delete, Backspace, Escape, Zoom resets, Spacebar panning) registers
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
        // Change cursor to grab to signal panning capability
        canvasEl.style.cursor = "grab";
      }
      
      // Stop space key from scrolling the web page
      e.preventDefault();
    }

    if (isInput) return;

    if (e.key === "Delete" || e.key === "Backspace") {
      if (state.selectedShapeIds.length > 0) {
        state.deleteSelected();
      }
    } else if (e.key === "Escape") {
      state.setSelection([]);
    } else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
      // Zoom resets to default values
      e.preventDefault();
      state.setViewport({ x: 0, y: 0, zoom: 1 });
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
