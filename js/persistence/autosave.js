// Debounced autosave controller
import { state } from "../core/state.js";
import { saveToLocalStorage } from "./localStorage.js";

let debounceTimer = null;

/**
 * State settings modify hone par autosave listener set settings trigger register karta hai
 */
export function initAutosave() {
  state.subscribe(() => {
    // Pichla timer clear karein pointer dragging actions ke speed issues block karne ke liye
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // 800ms ke delay ke baad saveToLocalStorage trigger register karein
    debounceTimer = setTimeout(() => {
      const saved = saveToLocalStorage();
      if (saved) {
        // UI alerts and status updates display logic custom event dispatch trigger hook
        window.dispatchEvent(new CustomEvent("excaliclone-saved"));
      }
      debounceTimer = null;
    }, 800);
  });
}
