<div align="center">

# ✎ Sketchflow

**A fast, beautiful, browser-based infinite canvas drawing tool — built from scratch with zero dependencies.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Built%20with-Vanilla%20JS-f7df1e?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Build Step](https://img.shields.io/badge/No%20Build%20Step-native%20ES%20Modules-blue)](#running-locally)

</div>

---

Sketchflow is a lightweight, feature-rich whiteboard app inspired by [Excalidraw](https://excalidraw.com). It runs entirely in the browser — no framework, no bundler, no external libraries. Just HTML, CSS, and native ES Modules.

> Draw shapes, sketch freehand, select and move elements, zoom into an infinite canvas, save your work locally, and export it as a portable JSON file — all without installing anything.

---

## ✨ Features

### 🖊 Drawing Tools
| Tool | How to activate | Description |
|---|---|---|
| **Rectangle** | Click toolbar or `R` | Draw rectangles with rounded corners |
| **Ellipse** | Click toolbar or `E` | Draw ellipses and circles |
| **Line** | Click toolbar | Draw straight lines |
| **Arrow** | Click toolbar | Draw lines with arrowheads |
| **Pencil** | Click toolbar or `P` | Freehand strokes with smooth curves |
| **Eraser** | Click toolbar | Erase shapes by touching their outline |
| **Hand** | Click toolbar or hold `Space` | Pan the canvas without drawing |

### 🖱 Select & Edit
- **Click** a shape to select it — see bounding box with corner resize handles
- **Drag** to move selected shape(s)
- **Corner handles** — drag to resize any shape
- **Multi-select** — click and drag over empty space to draw a selection rectangle; all enclosed shapes are selected and can be moved together
- **Delete** / **Backspace** — remove selected shapes
- **Escape** — clear current selection

### ⌨ Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + C` | Copy selected shapes |
| `Ctrl + V` | Paste (with 20px offset per successive paste) |
| `Delete` / `Backspace` | Delete selected shapes |
| `Escape` | Deselect all |
| `Space + Drag` | Pan canvas (any tool) |
| `Ctrl + 0` | Reset zoom to 100% |

### 🗺 Infinite Canvas
- **Pan** with `Space + drag`, middle-mouse drag, or the Hand tool
- **Zoom** with scroll wheel — always anchored to cursor position
- Zoom range: **10% → 500%**
- Floating zoom indicator with `+` / `−` / reset controls

### 💾 Persistence
- **Autosave** — drawing is saved to `localStorage` automatically (debounced 800ms after last edit); survives page refreshes
- **Export** — download your drawing as a versioned `.json` project file
- **Import** — load a `.json` project file via file picker or drag-and-drop onto the canvas
- **Reset** — clear the entire canvas (protected by a non-blocking confirmation modal)

### 🎨 Design & UX
- Premium glassmorphic dark UI with dot-grid canvas background
- MacBook dock-style toolbar: buttons scale up (`scale(1.08)`) and lift (`translateY(-4px)`) on hover
- Animated Sketchflow logo with pulsing emerald glow
- Non-blocking custom confirmation modals (no `confirm()` jank — zero INP blocking)
- Per-tool cursor icons: `crosshair` for drawing, `default` for select, `grab` for hand, `alias` for eraser
- Toast notifications for import/export results
- High-DPI / Retina display support via `devicePixelRatio` canvas scaling

---

## 🏗 Architecture

Sketchflow uses a clean **pub-sub state → render pipeline** with zero coupling between modules:

```
User Interaction
      │
      ▼
  ToolManager          ← dispatches pointer events to active tool
      │
      ▼
  Active Tool          ← shapeTool / selectTool / pencilTool / eraserTool / panTool
      │
      ▼
   state.js            ← single source of truth (shapes[], viewport, selectedShapeIds[])
      │
      ▼ notify()
   canvas.js           ← requestAnimationFrame batched render loop
      │
      ▼
  renderShape.js       ← pure shape renderers (rectangle, ellipse, line, arrow, pencil)
```

Every state mutation (add, update, remove, undo, redo, paste) automatically calls `pushUndo()` before applying the change, and triggers a single `notify()` to re-render.

---

## 📁 Project Structure

```
Sketchflow/
├── index.html                    # App entry point & toolbar HTML
├── styles/
│   └── main.css                  # All styles — dark theme, glassmorphism, modal, animations
└── js/
    ├── main.js                   # Bootstrap: registers tools, wires UI, subscribes to state
    ├── core/
    │   ├── state.js              # Pub-sub store: shapes, viewport, history, clipboard
    │   ├── canvas.js             # RAF render loop, dot-grid, selection overlays
    │   ├── coordinates.js        # screenToWorld / worldToScreen (viewport-aware)
    │   └── keyboard.js           # Global keyboard shortcuts + spacebar tracking
    ├── tools/
    │   ├── ToolManager.js        # Pointer event dispatcher → active tool
    │   ├── shapeTool.js          # Parameterized factory for rectangle/ellipse/line/arrow
    │   ├── pencilTool.js         # Freehand stroke capture + smoothing
    │   ├── selectTool.js         # Click-select, drag-select, move, resize
    │   ├── eraserTool.js         # Stroke-only hit detection eraser
    │   ├── panTool.js            # Viewport translation (hand tool)
    │   └── zoomHandler.js        # Scroll-wheel zoom anchored to cursor
    ├── shapes/
    │   ├── Shape.js              # Factory: plain JSON-serializable shape objects
    │   ├── renderShape.js        # Pure renderers + selection overlay drawing
    │   ├── hitTest.js            # getShapeAtPoint / getShapeAtStroke / getShapesInRect
    │   └── bounds.js             # WeakMap-cached bounding box calculations
    ├── persistence/
    │   ├── autosave.js           # Debounced localStorage autosave (800ms)
    │   ├── localStorage.js       # saveToLocalStorage / loadFromLocalStorage
    │   ├── exportImport.js       # JSON download + file import + toast notifications
    │   └── schema.js             # validateSaveFile — version + shape + viewport checks
    └── ui/
        └── modal.js              # Async non-blocking confirm modal (replaces confirm())
```

---

## 🚀 Running Locally

ES Modules require a server (browsers block `file://` imports). Pick any option:

### Node.js (recommended)
```bash
npx serve
# → http://localhost:3000
```

### Python
```bash
python -m http.server 3000
# → http://localhost:3000
```

### VS Code
Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension and click **Go Live**.

No build step. No install. Open and draw.

---

## 🔧 Technical Decisions

| Decision | Rationale |
|---|---|
| **No framework** | Zero dependency surface, instant load, full control over render loop |
| **No bundler** | Native ES Modules work in all modern browsers; no transpilation needed |
| **Pub-sub state** | Tools and UI never import each other — all communication through `state.js` |
| **WeakMap bounds cache** | `getShapeBounds` is called every frame; caching avoids redundant geometry math |
| **requestAnimationFrame batching** | Multiple rapid state changes collapse into one render call |
| **Stroke-only eraser** | `getShapeAtStroke` tests only shape outlines — clicking inside a rectangle's empty interior does not erase it |
| **Async confirm modal** | Native `confirm()` blocks the main thread causing ~800ms INP; replaced with a `Promise`-based non-blocking modal |
| **50-entry undo cap** | Prevents unbounded `undoStack` memory growth |
| **Versioned save schema** | `version: 1` field in export JSON enables safe future migrations |
| **Zoom-adaptive eraser tolerance** | `Math.max(8, 12 / viewport.zoom)` keeps the eraser usable at any zoom level |

---

## 📋 Save File Format

Exported `.json` files use a stable versioned schema:

```json
{
  "version": 1,
  "shapes": [
    {
      "id": "uuid-v4",
      "type": "rectangle",
      "x": 120,
      "y": 80,
      "width": 200,
      "height": 100,
      "strokeColor": "#ffffff",
      "strokeWidth": 2,
      "fillColor": "transparent"
    }
  ],
  "viewport": {
    "x": 0,
    "y": 0,
    "zoom": 1
  }
}
```

All shape objects are plain JSON — no class instances, no function references. Safe to serialize, diff, and version control.

---

## 🗺 Spec / Changelog

Detailed implementation notes for each development phase live in [`spec/`](spec/):

| File | Phase | Contents |
|---|---|---|
| [`00_initial_setup.md`](spec/00_initial_setup.md) | Phase 1 | Canvas engine, state store, coordinate system |
| [`04_phase2_shape_tools.md`](spec/04_phase2_shape_tools.md) | Phase 2 | Rectangle, Ellipse, Line, Arrow tools |
| [`05_phase3_pencil_tool.md`](spec/05_phase3_pencil_tool.md) | Phase 3 | Freehand pencil strokes |
| [`06_phase4_select_tool.md`](spec/06_phase4_select_tool.md) | Phase 4 | Select, move, resize, delete |
| [`07_phase5_infinite_canvas.md`](spec/07_phase5_infinite_canvas.md) | Phase 5 | Pan, zoom, cursor-anchored scroll |
| [`08_phase6_persistence.md`](spec/08_phase6_persistence.md) | Phase 6 | Autosave, export, import, schema |
| [`09_advanced_editing_features.md`](spec/09_advanced_editing_features.md) | Advanced | Multi-select, undo/redo, copy/paste, eraser, hand tool |

---

## 📄 License

MIT — free to use, fork, and build upon.

---

<div align="center">
  <sub>Built with ✎ and zero dependencies.</sub>
</div>
