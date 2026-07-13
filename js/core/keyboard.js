// Keyboard event handlers mapping logic
import { state } from "./state.js";

/**
 * Key press shortcuts (Delete, Backspace, Escape) listen aur state delete/deselect actions connect karne ke liye
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

    if (isInput) return;

    if (e.key === "Delete" || e.key === "Backspace") {
      if (state.selectedShapeIds.length > 0) {
        state.deleteSelected();
      }
    } else if (e.key === "Escape") {
      state.setSelection([]);
    }
  });
}
