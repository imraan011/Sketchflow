// State changes listen karne wale functions ka set
const subscribers = new Set();

// Central state object - single source of truth
export const state = {
  shapes: [],
  selectedShapeIds: [],
  currentTool: "select",
  viewport: { x: 0, y: 0, zoom: 1 },
  undoStack: [],
  redoStack: [],
  clipboard: [],

  // Naya shape add karne ke liye
  addShape(shape) {
    this.pushUndo();
    this.shapes.push(shape);
    this.notify();
  },

  // Shape details update karne ke liye (immutable recreation to avoid cache bugs)
  updateShape(id, changes) {
    let updated = false;
    this.shapes = this.shapes.map(s => {
      if (s.id === id) {
        updated = true;
        return { ...s, ...changes };
      }
      return s;
    });
    if (updated) {
      this.notify();
    }
  },

  // Shape ko list se remove karne ke liye
  removeShape(id) {
    this.pushUndo();
    this.shapes = this.shapes.filter(s => s.id !== id);
    this.selectedShapeIds = this.selectedShapeIds.filter(x => x !== id);
    this.notify();
  },

  // Active drawing tool change karne ke liye
  setTool(toolName) {
    this.setState({ currentTool: toolName });
  },

  // Selected shapes select change karne ke liye
  setSelection(ids) {
    this.setState({ selectedShapeIds: ids });
  },

  // Selected shapes delete karne ke liye
  deleteSelected() {
    this.pushUndo();
    this.shapes = this.shapes.filter(s => !this.selectedShapeIds.includes(s.id));
    this.setState({ selectedShapeIds: [] });
  },

  // Viewport scale & panning position shift change karne ke liye
  setViewport(changes) {
    this.setState({ viewport: changes });
  },

  // Purane state configurations load karke single notify check generate karne ke liye
  loadState(data) {
    this.shapes = data.shapes || [];
    this.selectedShapeIds = [];
    if (data.viewport) {
      this.viewport = { ...this.viewport, ...data.viewport };
    }
    this.notify();
  },

  // Current shapes list clone karke history snapshot push karne ke liye
  pushUndo() {
    const snapshot = JSON.parse(JSON.stringify(this.shapes));
    this.undoStack.push(snapshot);
    this.redoStack = [];
    if (this.undoStack.length > 50) {
      this.undoStack.shift();
    }
  },

  // Undo operation
  undo() {
    if (this.undoStack.length === 0) return;
    const current = JSON.parse(JSON.stringify(this.shapes));
    this.redoStack.push(current);

    const prev = this.undoStack.pop();
    this.shapes = prev;
    this.selectedShapeIds = [];
    this.notify();
  },

  // Redo operation
  redo() {
    if (this.redoStack.length === 0) return;
    const current = JSON.parse(JSON.stringify(this.shapes));
    this.undoStack.push(current);

    const next = this.redoStack.pop();
    this.shapes = next;
    this.selectedShapeIds = [];
    this.notify();
  },

  // Selected shapes details clipboard me copy karne ke liye
  copy() {
    if (this.selectedShapeIds.length === 0) return;
    this.clipboard = this.selectedShapeIds
      .map(id => this.shapes.find(s => s.id === id))
      .filter(Boolean)
      .map(s => JSON.parse(JSON.stringify(s)));
  },

  // Clipboard copy details offset coordinate mapping se paste karne ke liye
  paste() {
    if (this.clipboard.length === 0) return;

    this.pushUndo();
    const offset = 20;
    const pastedIds = [];

    this.clipboard.forEach(item => {
      const copy = JSON.parse(JSON.stringify(item));
      copy.id = `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (copy.type === "pencil") {
        copy.points = copy.points.map(p => ({
          x: p.x + offset,
          y: p.y + offset
        }));
      } else {
        copy.x += offset;
        copy.y += offset;
      }

      this.shapes.push(copy);
      pastedIds.push(copy.id);
    });

    // Sub-sequent pastes chain coordinates shifting offsets update
    this.clipboard = this.clipboard.map(item => {
      const copy = JSON.parse(JSON.stringify(item));
      if (copy.type === "pencil") {
        copy.points = copy.points.map(p => ({ x: p.x + offset, y: p.y + offset }));
      } else {
        copy.x += offset;
        copy.y += offset;
      }
      return copy;
    });

    this.selectedShapeIds = pastedIds;
    this.notify();
  },

  /**
   * State ko update karne aur sabhi subscribers ko notify karne ke liye
   * @param {Partial<typeof state>} nextState 
   */
  setState(nextState) {
    // Agar nextState me nested properties update karni ho jaise viewport
    if (nextState.viewport) {
      this.viewport = { ...this.viewport, ...nextState.viewport };
    }
    
    // Baki main properties ko assign karo
    Object.keys(nextState).forEach(key => {
      if (key !== 'viewport' && key in this) {
        this[key] = nextState[key];
      }
    });

    this.notify();
  },

  /**
   * Naye updates ko listen karne ke liye subscriber add karein
   * @param {(state: typeof state) => void} callback 
   * @returns {() => void} unsubscribe function
   */
  subscribe(callback) {
    subscribers.add(callback);
    
    // Cleanup/Unsubscribe callback return karo
    return () => {
      subscribers.delete(callback);
    };
  },

  // Sabhi registered callbacks ko call karo
  notify() {
    subscribers.forEach(callback => callback(this));
  }
};
