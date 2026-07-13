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

  // Shape details update karne ke liye
  updateShape(id, changes) {
    const shape = this.shapes.find(s => s.id === id);
    if (shape) {
      Object.assign(shape, changes);
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
