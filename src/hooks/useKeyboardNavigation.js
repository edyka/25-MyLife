import { useEffect, useCallback, useState } from 'react';

/**
 * useKeyboardNavigation - Custom hook for grid keyboard navigation
 *
 * Features:
 * - Arrow key navigation
 * - Space/Enter to paint week
 * - Escape to deselect mood
 * - Tab navigation support
 * - Screen reader announcements
 *
 * @param {Object} params
 * @param {number} params.currentWeek - Current week number
 * @param {number} params.totalWeeks - Total weeks in grid
 * @param {string|null} params.selectedMood - Currently selected mood
 * @param {Function} params.onWeekClick - Handler for painting a week
 * @param {Function} params.onMoodDeselect - Handler for deselecting mood
 * @param {boolean} params.enabled - Whether keyboard navigation is enabled
 */
export const useKeyboardNavigation = ({
  currentWeek = 0,
  totalWeeks = 4160,
  selectedMood = null,
  onWeekClick = () => {},
  onMoodDeselect = () => {},
  enabled = true
}) => {
  const [focusedWeek, setFocusedWeek] = useState(currentWeek);
  const [announcement, setAnnouncement] = useState('');

  // Announce changes for screen readers
  const announce = useCallback((message) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    const { key, shiftKey } = event;

    switch (key) {
      case 'ArrowRight':
        event.preventDefault();
        setFocusedWeek(prev => {
          const next = Math.min(prev + 1, totalWeeks - 1);
          announce(`Week ${next}`);
          return next;
        });
        break;

      case 'ArrowLeft':
        event.preventDefault();
        setFocusedWeek(prev => {
          const next = Math.max(prev - 1, 0);
          announce(`Week ${next}`);
          return next;
        });
        break;

      case 'ArrowDown':
        event.preventDefault();
        setFocusedWeek(prev => {
          const next = Math.min(prev + 52, totalWeeks - 1);
          announce(`Week ${next}, age ${Math.floor(next / 52)}`);
          return next;
        });
        break;

      case 'ArrowUp':
        event.preventDefault();
        setFocusedWeek(prev => {
          const next = Math.max(prev - 52, 0);
          announce(`Week ${next}, age ${Math.floor(next / 52)}`);
          return next;
        });
        break;

      case 'Home':
        event.preventDefault();
        if (shiftKey) {
          setFocusedWeek(0);
          announce('First week');
        } else {
          // Go to start of current year
          setFocusedWeek(prev => Math.floor(prev / 52) * 52);
          announce(`Start of age ${Math.floor(focusedWeek / 52)}`);
        }
        break;

      case 'End':
        event.preventDefault();
        if (shiftKey) {
          setFocusedWeek(totalWeeks - 1);
          announce('Last week');
        } else {
          // Go to end of current year
          setFocusedWeek(prev => Math.min(Math.floor(prev / 52) * 52 + 51, totalWeeks - 1));
          announce(`End of age ${Math.floor(focusedWeek / 52)}`);
        }
        break;

      case 'PageDown':
        event.preventDefault();
        setFocusedWeek(prev => {
          const next = Math.min(prev + 260, totalWeeks - 1); // Jump 5 years
          announce(`Week ${next}, age ${Math.floor(next / 52)}`);
          return next;
        });
        break;

      case 'PageUp':
        event.preventDefault();
        setFocusedWeek(prev => {
          const next = Math.max(prev - 260, 0); // Jump back 5 years
          announce(`Week ${next}, age ${Math.floor(next / 52)}`);
          return next;
        });
        break;

      case ' ':
      case 'Enter':
        event.preventDefault();
        if (selectedMood) {
          onWeekClick(focusedWeek);
          announce(`Painted week ${focusedWeek} with ${selectedMood}`);
        } else {
          announce('Please select a mood first');
        }
        break;

      case 'Escape':
        event.preventDefault();
        if (selectedMood) {
          onMoodDeselect();
          announce('Mood deselected');
        }
        break;

      case 'c':
        // Jump to current week
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          setFocusedWeek(currentWeek);
          announce(`Current week ${currentWeek}`);
        }
        break;

      default:
        break;
    }
  }, [
    enabled,
    focusedWeek,
    totalWeeks,
    currentWeek,
    selectedMood,
    onWeekClick,
    onMoodDeselect,
    announce
  ]);

  // Attach keyboard listener
  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  // Focus management for current week
  useEffect(() => {
    if (enabled && focusedWeek !== null) {
      // Scroll focused week into view
      const weekElement = document.querySelector(`[data-week="${focusedWeek}"]`);
      if (weekElement) {
        weekElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }
  }, [enabled, focusedWeek]);

  return {
    focusedWeek,
    setFocusedWeek,
    announcement,
    handleKeyDown
  };
};

export default useKeyboardNavigation;
