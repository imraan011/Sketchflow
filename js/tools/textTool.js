import { state } from "../core/state.js";
import { screenToWorld } from "../core/coordinates.js";
import { requestRender } from "../core/canvas.js";

// Active textarea reference track karne ke liye
let activeTextarea = null;

/**
 * Text bounds (width, height) calculate karne ke liye helper function
 * @param {string} text 
 * @param {number} fontSize 
 * @returns {{ width: number, height: number }}
 */
export function measureText(text, fontSize) {
  // Temporary canvas and context create karke measurement lete hain
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = `${fontSize}px Outfit, system-ui, sans-serif`;
  
  const lines = text.split("\n");
  let maxWidth = 0;
  
  for (const line of lines) {
    const width = ctx.measureText(line).width;
    if (width > maxWidth) {
      maxWidth = width;
    }
  }
  
  const lineHeight = fontSize * 1.25;
  const height = lines.length * lineHeight;
  
  return {
    width: Math.max(20, maxWidth),
    height: Math.max(lineHeight, height)
  };
}

export const textTool = {
  name: "text",

  onPointerDown(e) {
    // Agar active textarea pehle se open hai to submit ho jayega
    if (activeTextarea) {
      activeTextarea.blur();
      return;
    }

    // Screen click coordinates ko world coordinates me shift karo
    const coords = screenToWorld(e.clientX, e.clientY, state.viewport);

    // Dynamic textarea overlay structure create karo
    const textarea = document.createElement("textarea");
    textarea.className = "sketchflow-textarea-overlay";
    
    // Zoom levels ke base coordinates visual layout parameters match karo
    const zoom = state.viewport.zoom;
    textarea.style.left = `${e.clientX}px`;
    textarea.style.top = `${e.clientY}px`;
    textarea.style.fontSize = `${20 * zoom}px`;
    textarea.style.fontFamily = "'Outfit', 'Inter', system-ui, -apple-system, sans-serif";
    
    // Body layout parameters append and focus
    document.body.appendChild(textarea);
    
    // Timeout set kiya taki render event input logic properly focus detect kare
    setTimeout(() => {
      textarea.focus();
    }, 0);

    activeTextarea = textarea;

    let isDiscarded = false;
    let isSubmitting = false;

    // Text box boundaries dimensions text wrap properties update handler
    const autoSize = () => {
      textarea.style.width = "auto";
      textarea.style.height = "auto";
      textarea.style.width = `${textarea.scrollWidth + 4}px`;
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.addEventListener("input", autoSize);
    autoSize();

    // Cleanup overlay helpers
    const cleanup = () => {
      if (document.body.contains(textarea)) {
        document.body.removeChild(textarea);
      }
      if (activeTextarea === textarea) {
        activeTextarea = null;
      }
    };

    // Submitting check callback triggers
    const handleSubmit = () => {
      if (isSubmitting) return;
      isSubmitting = true;

      const val = textarea.value;
      if (!isDiscarded && val.trim() !== "") {
        const fontSize = 20;
        const { width, height } = measureText(val, fontSize);

        const newShape = {
          id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
          type: "text",
          x: coords.x,
          y: coords.y,
          width,
          height,
          text: val,
          fontSize,
          strokeColor: "#ffffff",
          strokeWidth: 2
        };

        state.pushUndo();
        state.addShape(newShape);
      }

      cleanup();
      requestRender();
    };

    // Key events handlers check options
    textarea.addEventListener("keydown", (ev) => {
      // Enter without Shift commits text
      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        textarea.blur();
      } 
      // Escape discards writing
      else if (ev.key === "Escape") {
        ev.preventDefault();
        isDiscarded = true;
        textarea.blur();
      }
    });

    textarea.addEventListener("blur", handleSubmit);
  },

  onPointerMove(e) {
    // Text drawing mode me move actions skipped
  },

  onPointerUp(e) {
    // Pointer release handles text tool click cycle properly
  }
};
