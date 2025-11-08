/**
 * Toast notification utility
 * Provides a simple way to show toast notifications throughout the app
 */

import { createRoot } from 'react-dom/client';
import ToastNotification from '../components/ToastNotification';

class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
  }

  init() {
    if (typeof document === 'undefined') return;
    
    // Create container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none';
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 5000) {
    this.init();
    
    const toastId = Date.now();
    const toastElement = document.createElement('div');
    toastElement.className = 'pointer-events-auto mb-2';
    this.container.appendChild(toastElement);

    const root = createRoot(toastElement);
    
    const handleClose = () => {
      setTimeout(() => {
        root.unmount();
        toastElement.remove();
        this.toasts = this.toasts.filter(t => t.id !== toastId);
      }, 300);
    };

    root.render(
      <ToastNotification
        message={message}
        type={type}
        duration={duration}
        onClose={handleClose}
      />
    );

    this.toasts.push({ id: toastId, element: toastElement });

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(handleClose, duration);
    }

    return toastId;
  }

  success(message, duration = 5000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 7000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 6000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 5000) {
    return this.show(message, 'info', duration);
  }

  clear() {
    this.toasts.forEach(toast => {
      const root = createRoot(toast.element);
      root.unmount();
      toast.element.remove();
    });
    this.toasts = [];
  }
}

const toastManager = new ToastManager();

export const toast = {
  show: (message, type, duration) => toastManager.show(message, type, duration),
  success: (message, duration) => toastManager.success(message, duration),
  error: (message, duration) => toastManager.error(message, duration),
  warning: (message, duration) => toastManager.warning(message, duration),
  info: (message, duration) => toastManager.info(message, duration),
  clear: () => toastManager.clear(),
};

export default toast;

