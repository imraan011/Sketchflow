// Data validation schemas definition settings

/**
 * Uploaded ya storage JSON data save formats check karne ke liye validation check function
 * @param {any} data 
 * @returns {{ valid: boolean, error?: string }} validation result
 */
export function validateSaveFile(data) {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid data format: Expected an object" };
  }

  // Version identification key validate
  if (typeof data.version !== "number") {
    return { valid: false, error: "Missing or invalid file version number" };
  }

  // Version 1 specific validation checks
  if (data.version !== 1) {
    return { valid: false, error: `Unsupported project schema version: ${data.version}` };
  }

  // Shapes array listing properties validate
  if (!Array.isArray(data.shapes)) {
    return { valid: false, error: "Missing shapes array" };
  }

  for (let i = 0; i < data.shapes.length; i++) {
    const shape = data.shapes[i];
    if (!shape || typeof shape !== "object") {
      return { valid: false, error: `Shape at index ${i} is not a valid object` };
    }
    if (typeof shape.id !== "string") {
      return { valid: false, error: `Shape at index ${i} is missing a string ID` };
    }
    if (typeof shape.type !== "string") {
      return { valid: false, error: `Shape at index ${i} is missing a type field` };
    }
  }

  // Viewport properties parameters check
  if (data.viewport) {
    if (typeof data.viewport !== "object") {
      return { valid: false, error: "Viewport must be a valid object" };
    }
    const { x, y, zoom } = data.viewport;
    if (typeof x !== "number" || typeof y !== "number" || typeof zoom !== "number") {
      return { valid: false, error: "Viewport contains invalid x, y, or zoom coordinates" };
    }
  }

  return { valid: true };
}
