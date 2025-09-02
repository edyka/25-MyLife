import { useState, useCallback, useMemo, useRef } from 'react';

// BitSet implementation for O(1) selection operations
class SelectionBitSet {
  constructor(maxWeeks = 4160) { // 80 years * 52 weeks
    this.size = Math.ceil(maxWeeks / 32);
    this.bits = new Uint32Array(this.size);
    this.count = 0;
  }

  set(weekNum) {
    const index = Math.floor((weekNum - 1) / 32);
    const bit = (weekNum - 1) % 32;
    const mask = 1 << bit;
    
    if (!(this.bits[index] & mask)) {
      this.bits[index] |= mask;
      this.count++;
      return true;
    }
    return false;
  }

  unset(weekNum) {
    const index = Math.floor((weekNum - 1) / 32);
    const bit = (weekNum - 1) % 32;
    const mask = 1 << bit;
    
    if (this.bits[index] & mask) {
      this.bits[index] &= ~mask;
      this.count--;
      return true;
    }
    return false;
  }

  has(weekNum) {
    const index = Math.floor((weekNum - 1) / 32);
    const bit = (weekNum - 1) % 32;
    return !!(this.bits[index] & (1 << bit));
  }

  clear() {
    this.bits.fill(0);
    this.count = 0;
  }

  getRectangularSelection(startWeek, endWeek) {
    const startYear = Math.floor((startWeek - 1) / 52);
    const startWeekInYear = (startWeek - 1) % 52;
    const endYear = Math.floor((endWeek - 1) / 52);
    const endWeekInYear = (endWeek - 1) % 52;
    
    const minYear = Math.min(startYear, endYear);
    const maxYear = Math.max(startYear, endYear);
    const minWeekInYear = Math.min(startWeekInYear, endWeekInYear);
    const maxWeekInYear = Math.max(startWeekInYear, endWeekInYear);
    
    const selection = [];
    for (let year = minYear; year <= maxYear; year++) {
      for (let weekInYear = minWeekInYear; weekInYear <= maxWeekInYear; weekInYear++) {
        selection.push(year * 52 + weekInYear + 1);
      }
    }
    return selection;
  }

  toArray() {
    const result = [];
    for (let i = 0; i < this.size * 32; i++) {
      if (this.has(i + 1)) {
        result.push(i + 1);
      }
    }
    return result;
  }
}

export const useSelectionState = (maxWeeks = 4160) => {
  const selectionSetRef = useRef(new SelectionBitSet(maxWeeks));
  // eslint-disable-next-line no-unused-vars
  const [_selectionVersion, setSelectionVersion] = useState(0);
  
  // Force re-render by incrementing version
  const forceUpdate = useCallback(() => {
    setSelectionVersion(v => v + 1);
  }, []);

  const selectWeek = useCallback((weekNum) => {
    if (selectionSetRef.current.set(weekNum)) {
      forceUpdate();
    }
  }, [forceUpdate]);

  const deselectWeek = useCallback((weekNum) => {
    if (selectionSetRef.current.unset(weekNum)) {
      forceUpdate();
    }
  }, [forceUpdate]);

  const toggleWeek = useCallback((weekNum) => {
    if (selectionSetRef.current.has(weekNum)) {
      deselectWeek(weekNum);
    } else {
      selectWeek(weekNum);
    }
  }, [selectWeek, deselectWeek]);

  const selectRectangle = useCallback((startWeek, endWeek) => {
    const weeks = selectionSetRef.current.getRectangularSelection(startWeek, endWeek);
    let changed = false;
    weeks.forEach(week => {
      if (selectionSetRef.current.set(week)) {
        changed = true;
      }
    });
    if (changed) forceUpdate();
  }, [forceUpdate]);

  const clearSelection = useCallback(() => {
    if (selectionSetRef.current.count > 0) {
      selectionSetRef.current.clear();
      forceUpdate();
    }
  }, [forceUpdate]);

  const isSelected = useCallback((weekNum) => {
    return selectionSetRef.current.has(weekNum);
  }, []); // Remove unnecessary dependency

  const selectedWeeks = useMemo(() => {
    return selectionSetRef.current.toArray();
  }, []);

  const selectionCount = useMemo(() => {
    return selectionSetRef.current.count;
  }, []);

  return {
    selectWeek,
    deselectWeek,
    toggleWeek,
    selectRectangle,
    clearSelection,
    isSelected,
    selectedWeeks,
    selectionCount
  };
};