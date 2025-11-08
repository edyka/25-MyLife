/**
 * Accessibility utility functions
 * Provides keyboard navigation, ARIA labels, and screen reader support
 */

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  if (typeof document === 'undefined') return;
  
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Focus management - trap focus within element
 */
export const trapFocus = (element) => {
  if (!element) return null;
  
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTab = (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };
  
  element.addEventListener('keydown', handleTab);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTab);
  };
};

/**
 * Skip to main content link
 */
export const createSkipLink = () => {
  if (typeof document === 'undefined') return;
  
  // Check if skip link already exists
  if (document.getElementById('skip-to-main')) return;
  
  const skipLink = document.createElement('a');
  skipLink.id = 'skip-to-main';
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
};

/**
 * Get accessible name for element
 */
export const getAccessibleName = (element) => {
  if (!element) return '';
  
  // Check aria-label
  if (element.getAttribute('aria-label')) {
    return element.getAttribute('aria-label');
  }
  
  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) {
      return labelElement.textContent || labelElement.getAttribute('aria-label') || '';
    }
  }
  
  // Check associated label
  const id = element.id;
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) {
      return label.textContent || '';
    }
  }
  
  // Check title attribute
  if (element.title) {
    return element.title;
  }
  
  // Check alt for images
  if (element.tagName === 'IMG' && element.alt) {
    return element.alt;
  }
  
  // Fallback to text content
  return element.textContent?.trim() || '';
};

/**
 * Check if element is visible to screen readers
 */
export const isVisibleToScreenReader = (element) => {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    rect.width > 0 &&
    rect.height > 0 &&
    !element.hasAttribute('aria-hidden')
  );
};

/**
 * Initialize accessibility features
 */
export const initAccessibility = () => {
  if (typeof document === 'undefined') return;
  
  // Create skip link
  createSkipLink();
  
  // Add main content landmark if it doesn't exist
  const mainContent = document.getElementById('main-content');
  if (!mainContent) {
    const main = document.querySelector('main');
    if (main) {
      main.id = 'main-content';
      main.setAttribute('role', 'main');
    }
  }
  
  // Respect reduced motion preference
  if (prefersReducedMotion()) {
    document.documentElement.classList.add('reduce-motion');
  }
};

/**
 * Keyboard shortcut handler
 */
export const createKeyboardShortcut = (key, callback, options = {}) => {
  const { ctrlKey = false, shiftKey = false, altKey = false, preventDefault = true } = options;
  
  const handler = (e) => {
    if (
      e.key === key &&
      e.ctrlKey === ctrlKey &&
      e.shiftKey === shiftKey &&
      e.altKey === altKey
    ) {
      if (preventDefault) {
        e.preventDefault();
      }
      callback(e);
    }
  };
  
  document.addEventListener('keydown', handler);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('keydown', handler);
  };
};

export default {
  prefersReducedMotion,
  announceToScreenReader,
  trapFocus,
  createSkipLink,
  getAccessibleName,
  isVisibleToScreenReader,
  initAccessibility,
  createKeyboardShortcut,
};

