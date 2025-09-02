import { useCallback, useRef, useEffect, useState } from "react";
import { useSelectionStore, useUIStore, useLifeStore } from "../stores";

/**
 * Modern accessibility hook with enhanced keyboard navigation and screen reader support
 * Provides comprehensive accessibility features for the life grid
 */
export const useAccessibility = () => {
  const focusedWeekRef = useRef(null);
  const announcementRef = useRef(null);
  
  // Get state from stores
  const {
    selectedWeek,
    selectedColor,
    setSelectedWeek,
    selectionMode,
    setSelectionMode,
    selectedWeeks,
    toggleWeekSelection,
    clearAllSelections,
  } = useSelectionStore();
  
  useUIStore(); // For potential future use
  const { currentWeek, getTotalWeeks } = useLifeStore();

  // Create live region for announcements
  useEffect(() => {
    if (!announcementRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
      announcementRef.current = liveRegion;
    }

    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
        announcementRef.current = null;
      }
    };
  }, []);

  // Announce to screen readers
  const announce = useCallback((message) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
    }
  }, []);

  // Enhanced keyboard navigation
  const handleKeyboardNavigation = useCallback((event) => {
    const totalWeeks = getTotalWeeks();
    const weeksPerRow = 52;
    let newWeek = selectedWeek || currentWeek;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        newWeek = Math.min(newWeek + 1, totalWeeks);
        break;
        
      case 'ArrowLeft':
        event.preventDefault();
        newWeek = Math.max(newWeek - 1, 1);
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        newWeek = Math.min(newWeek + weeksPerRow, totalWeeks);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        newWeek = Math.max(newWeek - weeksPerRow, 1);
        break;
        
      case 'Home':
        event.preventDefault();
        if (event.ctrlKey) {
          newWeek = 1; // Go to very first week
        } else {
          newWeek = Math.floor((newWeek - 1) / weeksPerRow) * weeksPerRow + 1; // Beginning of row
        }
        break;
        
      case 'End':
        event.preventDefault();
        if (event.ctrlKey) {
          newWeek = totalWeeks; // Go to last week
        } else {
          const currentRow = Math.floor((newWeek - 1) / weeksPerRow);
          newWeek = Math.min((currentRow + 1) * weeksPerRow, totalWeeks); // End of row
        }
        break;
        
      case 'PageDown':
        event.preventDefault();
        newWeek = Math.min(newWeek + (weeksPerRow * 5), totalWeeks); // 5 years down
        break;
        
      case 'PageUp':
        event.preventDefault();
        newWeek = Math.max(newWeek - (weeksPerRow * 5), 1); // 5 years up
        break;
        
      case ' ':
      case 'Enter':
        event.preventDefault();
        if (selectedColor) {
          // Paint the current week
          const message = `Week ${newWeek} painted with ${selectedColor}`;
          announce(message);
        } else {
          toggleWeekSelection(newWeek);
          const isSelected = selectedWeeks.has(newWeek);
          const message = isSelected 
            ? `Week ${newWeek} selected` 
            : `Week ${newWeek} deselected`;
          announce(message);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        if (selectionMode !== 'single') {
          setSelectionMode('single');
          announce('Selection mode reset to single');
        } else {
          clearAllSelections();
          announce('All selections cleared');
        }
        break;
        
      case 'F2': {
        event.preventDefault();
        // Toggle selection mode
        const modes = ['single', 'multi', 'range'];
        const currentIndex = modes.indexOf(selectionMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        setSelectionMode(nextMode);
        announce(`Selection mode changed to ${nextMode}`);
        break;
      }
        
      default:
        return;
    }

    if (newWeek !== selectedWeek) {
      setSelectedWeek(newWeek);
      focusedWeekRef.current = newWeek;
      
      // Announce navigation
      const age = Math.floor((newWeek - 1) / 52);
      const quarter = Math.ceil(((newWeek - 1) % 52 + 1) / 13);
      const message = `Week ${newWeek}, Age ${age}, Quarter ${quarter}`;
      announce(message);
    }
  }, [
    selectedWeek,
    currentWeek,
    selectedColor,
    selectionMode,
    selectedWeeks,
    setSelectedWeek,
    setSelectionMode,
    toggleWeekSelection,
    clearAllSelections,
    getTotalWeeks,
    announce
  ]);

  // Focus management for week boxes
  const focusWeek = useCallback((weekNum) => {
    const weekElement = document.querySelector(`[data-week="${weekNum}"]`);
    if (weekElement) {
      weekElement.focus();
      focusedWeekRef.current = weekNum;
    }
  }, []);

  // Skip navigation support
  const createSkipLink = useCallback((targetId, label) => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50';
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    return skipLink;
  }, []);

  // High contrast mode detection and handling
  const [isHighContrast, setIsHighContrast] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-contrast: high)');
      setIsHighContrast(mediaQuery.matches);
      
      const handleChange = (e) => setIsHighContrast(e.matches);
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }
  }, []);

  // Reduced motion detection
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = (e) => setPrefersReducedMotion(e.matches);
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      }
    }
  }, []);

  // Generate accessible week description
  const getWeekDescription = useCallback((weekNum, milestone = null) => {
    const age = Math.floor((weekNum - 1) / 52);
    const quarter = Math.ceil(((weekNum - 1) % 52 + 1) / 13);
    const isPast = weekNum < currentWeek;
    const isCurrent = weekNum === currentWeek;
    
    let description = `Week ${weekNum}, Age ${age} years, Quarter ${quarter}`;
    
    if (isCurrent) {
      description += '. Current week';
    } else if (isPast) {
      description += '. Past week';
    } else {
      description += '. Future week';
    }
    
    if (milestone) {
      description += `. Milestone: ${milestone.title || 'Untitled'}`;
      if (milestone.category) {
        description += `, Category: ${milestone.category}`;
      }
    } else {
      description += '. No milestone set';
    }
    
    if (selectedWeeks.has(weekNum)) {
      description += '. Currently selected';
    }
    
    return description;
  }, [currentWeek, selectedWeeks]);

  // Keyboard shortcuts help
  const getKeyboardShortcuts = useCallback(() => [
    { key: 'Arrow Keys', description: 'Navigate between weeks' },
    { key: 'Home/End', description: 'Go to beginning/end of row' },
    { key: 'Ctrl+Home/End', description: 'Go to first/last week' },
    { key: 'Page Up/Down', description: 'Navigate by 5 years' },
    { key: 'Space/Enter', description: 'Select week or paint if color selected' },
    { key: 'Escape', description: 'Clear selections or reset mode' },
    { key: 'F2', description: 'Cycle selection modes' },
  ], []);

  return {
    // Navigation
    handleKeyboardNavigation,
    focusWeek,
    focusedWeek: focusedWeekRef.current,
    
    // Announcements
    announce,
    
    // Accessibility state
    isHighContrast,
    prefersReducedMotion,
    
    // Utilities
    getWeekDescription,
    getKeyboardShortcuts,
    createSkipLink,
  };
};