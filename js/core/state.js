// State changes listen karne wale functions ka set
const subscribers = new Set();

// Central state object - single source of truth
export const state = {
  shapes: [],
  selectedShapeIds: [],
  currentTool: "select",
  viewport: { x: 0, y: 0, zoom: 1 },

  // Naya shape add karne ke liye
  addShape(shape) {
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
    this.shapes = this.shapes.filter(s => s.id !== id);
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
    this.shapes = this.shapes.filter(s => !this.selectedShapeIds.includes(s.id));
    this.setState({ selectedShapeIds: [] });
  },

  // Viewport scale & panning position shift change karne ke liye
  setViewport(changes) {
    this.setState({ viewport: changes });
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
