import { create } from 'zustand';

/**
 * Selection Store - Manages week selection and painting interactions
 * Handles all selection-related state including dragging, range selection, and painting
 */
export const useSelectionStore = create((set, get) => ({
  // Selection state
  selectedWeek: null,
  selectedColor: null,
  selectedWeeks: new Set(),
  pinnedWeeks: new Set(),
  
  // Interaction state
  isDragging: false,
  draggedWeeks: new Set(),
  dragStartWeek: null,
  selectionMode: 'single', // 'single', 'range', 'rectangular'
  
  // Range selection state
  rangeStart: null,
  isInRangeMode: false,
  
  // Selection preview (for showing potential selections)
  selectionPreview: new Set(),
  
  // Basic selection actions
  setSelectedWeek: (week) => set({ selectedWeek: week }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setSelectionMode: (mode) => set({ selectionMode: mode }),
  
  // Dragging actions
  setIsDragging: (isDragging) => set({ isDragging }),
  setDraggedWeeks: (weeks) => set({ draggedWeeks: weeks }),
  setDragStartWeek: (week) => set({ dragStartWeek: week }),
  
  // Week selection management
  setSelectedWeeks: (weeks) => {
    const weekSet = weeks instanceof Set ? weeks : new Set(weeks);
    set({ selectedWeeks: weekSet });
  },
  
  addToSelectedWeeks: (week) => {
    const { selectedWeeks } = get();
    const newSelected = new Set(selectedWeeks);
    newSelected.add(week);
    set({ selectedWeeks: newSelected });
  },
  
  removeFromSelectedWeeks: (week) => {
    const { selectedWeeks } = get();
    const newSelected = new Set(selectedWeeks);
    newSelected.delete(week);
    set({ selectedWeeks: newSelected });
  },
  
  toggleWeekSelection: (week) => {
    const { selectedWeeks } = get();
    const newSelected = new Set(selectedWeeks);
    if (newSelected.has(week)) {
      newSelected.delete(week);
    } else {
      newSelected.add(week);
    }
    set({ selectedWeeks: newSelected });
  },
  
  clearSelectedWeeks: () => set({ selectedWeeks: new Set() }),
  
  // Pinned weeks management
  setPinnedWeeks: (weeks) => {
    const weekSet = weeks instanceof Set ? weeks : new Set(weeks);
    set({ pinnedWeeks: weekSet });
  },
  
  addToPinnedWeeks: (week) => {
    const { pinnedWeeks } = get();
    const newPinned = new Set(pinnedWeeks);
    newPinned.add(week);
    set({ pinnedWeeks: newPinned });
  },
  
  removeFromPinnedWeeks: (week) => {
    const { pinnedWeeks } = get();
    const newPinned = new Set(pinnedWeeks);
    newPinned.delete(week);
    set({ pinnedWeeks: newPinned });
  },
  
  clearPinnedWeeks: () => set({ pinnedWeeks: new Set() }),
  
  // Range selection management
  startRangeSelection: (week) => {
    set({
      rangeStart: week,
      isInRangeMode: true,
      selectedWeeks: new Set([week])
    });
  },
  
  completeRangeSelection: (endWeek) => {
    const { rangeStart } = get();
    if (!rangeStart) return;
    
    const start = Math.min(rangeStart, endWeek);
    const end = Math.max(rangeStart, endWeek);
    const rangeWeeks = new Set();
    
    for (let week = start; week <= end; week++) {
      rangeWeeks.add(week);
    }
    
    set({
      selectedWeeks: rangeWeeks,
      pinnedWeeks: rangeWeeks,
      rangeStart: null,
      isInRangeMode: false
    });
  },
  
  resetRangeSelection: () => {
    set({
      rangeStart: null,
      isInRangeMode: false,
      selectedWeeks: new Set()
    });
  },
  
  // Selection preview for UI feedback
  setSelectionPreview: (weeks) => {
    const weekSet = weeks instanceof Set ? weeks : new Set(weeks);
    set({ selectionPreview: weekSet });
  },
  
  clearSelectionPreview: () => set({ selectionPreview: new Set() }),
  
  // Rectangular selection
  selectRectangularArea: (startWeek, endWeek, weeksPerRow = 52) => {
    const startRow = Math.floor((startWeek - 1) / weeksPerRow);
    const endRow = Math.floor((endWeek - 1) / weeksPerRow);
    const startCol = (startWeek - 1) % weeksPerRow;
    const endCol = (endWeek - 1) % weeksPerRow;
    
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    const selectedWeeks = new Set();
    
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const week = row * weeksPerRow + col + 1;
        selectedWeeks.add(week);
      }
    }
    
    set({ selectedWeeks });
    return selectedWeeks;
  },
  
  // Utility functions
  getWeeksInSelection: () => {
    const { selectedWeeks, pinnedWeeks } = get();
    return new Set([...selectedWeeks, ...pinnedWeeks]);
  },
  
  isWeekSelected: (week) => {
    const { selectedWeeks, pinnedWeeks } = get();
    return selectedWeeks.has(week) || pinnedWeeks.has(week);
  },
  
  getSelectionCount: () => {
    const { selectedWeeks, pinnedWeeks } = get();
    return new Set([...selectedWeeks, ...pinnedWeeks]).size;
  },
  
  // Clear all selections
  clearAllSelections: () => {
    set({
      selectedWeek: null,
      selectedColor: null,
      selectedWeeks: new Set(),
      pinnedWeeks: new Set(),
      rangeStart: null,
      isInRangeMode: false,
      selectionPreview: new Set(),
      isDragging: false,
      draggedWeeks: new Set(),
      dragStartWeek: null
    });
  }
}));