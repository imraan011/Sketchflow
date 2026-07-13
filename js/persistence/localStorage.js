// LocalStorage operations manager
import { state } from "../core/state.js";
import { validateSaveFile } from "./schema.js";

const AUTOSAVE_STORAGE_KEY = "excaliclone-autosave";

/**
 * State settings (shapes + viewport) local browser storage key me serialize save karne ke liye
 */
export function saveToLocalStorage() {
  try {
    const saveData = {
      version: 1,
      createdAt: new Date().toISOString(),
      shapes: state.shapes,
      viewport: state.viewport
    };

    localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(saveData));
    return true;
  } catch (error) {
    // Quota limits checks console warning message mapping
    console.warn("Autosave to localStorage failed:", error);
    return false;
  }
}

/**
 * Local browser storage se workspace JSON string load aur validate parse karne ke liye
 * @returns {object|null} parsed validated data payload or null
 */
export function loadFromLocalStorage() {
  try {
    const rawData = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    if (!rawData) return null;

    const data = JSON.parse(rawData);
    const validation = validateSaveFile(data);

    if (validation.valid) {
      return data;
    } else {
      console.warn("LocalStorage validation failed:", validation.error);
      return null;
    }
  } catch (error) {
    console.warn("Failed to load state from localStorage:", error);
    return null;
  }
}
