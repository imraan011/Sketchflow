// File export & import managers
import { state } from "../core/state.js";
import { validateSaveFile } from "./schema.js";
import { showConfirm } from "../ui/modal.js";

/**
 * Global floating notifications/alert message UI display helper function
 * @param {string} message - Notification text
 * @param {"success"|"error"} type - Toast style key
 */
export function showToast(message, type = "success") {
  // Purane active toasts remove karein
  const activeToasts = document.querySelectorAll(".toast-banner");
  activeToasts.forEach(t => t.remove());

  const toast = document.createElement("div");
  toast.className = `toast-banner ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Auto remove alert animation delay setup
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3000);
}

/**
 * Canvas board shapes details ko JSON format file compile download trigger karne ke liye
 */
export function exportAsJSON() {
  const defaultName = `excaliclone-export-${Date.now()}`;
  const name = prompt("Enter project filename:", "excalidraw-project");
  
  if (name === null) return; // cancel export click check

  const safeName = name.trim() 
    ? name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "_") 
    : defaultName;

  const exportData = {
    version: 1,
    createdAt: new Date().toISOString(),
    shapes: state.shapes,
    viewport: state.viewport
  };

  try {
    // 2-space pretty formatting indents as portfolio best practice
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Revoke and clean memory objects references
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Project exported successfully!", "success");
  } catch (error) {
    showToast("Failed to export project file.", "error");
    console.error("Export error details:", error);
  }
}

/**
 * File structure contents read karke canvas board par load state load karne ke liye
 * @param {File} file - Selected JSON target file
 */
export function importFromJSON(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const validation = validateSaveFile(data);

      if (!validation.valid) {
        showToast("This file isn't a valid Excali Draw project.", "error");
        console.warn("Schema validation failed on file import:", validation.error);
        return;
      }

      // Overwrite confirmation — async modal (non-blocking, no INP jank)
      if (state.shapes.length > 0) {
        const proceed = await showConfirm("Importing will replace your current drawing — continue?");
        if (!proceed) return;
      }

      // Replace target workspace shapes data
      state.loadState(data);
      showToast("Project imported successfully!", "success");
    } catch (error) {
      showToast("Failed to parse file: Invalid JSON format.", "error");
      console.warn("Failed to parse JSON file on import:", error);
    }
  };

  reader.onerror = () => {
    showToast("Failed to read the selected file.", "error");
  };

  reader.readAsText(file);
}
