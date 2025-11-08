/**
 * Offline support utility
 * Provides offline detection, caching strategies, and sync queue management
 */

class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.listeners = [];
    this.setupEventListeners();
  }

  /**
   * Setup online/offline event listeners
   */
  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('online');
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('offline');
    });
  }

  /**
   * Check if currently online
   */
  isCurrentlyOnline() {
    return navigator.onLine && this.isOnline;
  }

  /**
   * Add listener for online/offline events
   */
  onStatusChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners of status change
   */
  notifyListeners(status) {
    this.listeners.forEach(listener => {
      try {
        listener(status, this.isOnline);
      } catch (error) {
        console.error('[OfflineManager] Error in listener:', error);
      }
    });
  }

  /**
   * Add item to sync queue
   */
  addToSyncQueue(item) {
    this.syncQueue.push({
      ...item,
      timestamp: Date.now(),
      retries: 0,
    });
    this.persistSyncQueue();
  }

  /**
   * Process sync queue when back online
   */
  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    console.log(`[OfflineManager] Processing ${this.syncQueue.length} queued items`);

    const items = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of items) {
      try {
        await item.fn();
        console.log('[OfflineManager] Successfully synced item:', item.id || item.type);
      } catch (error) {
        console.error('[OfflineManager] Failed to sync item:', error);
        // Re-add to queue if retries < max
        if (item.retries < 3) {
          item.retries++;
          this.syncQueue.push(item);
        }
      }
    }

    this.persistSyncQueue();
  }

  /**
   * Persist sync queue to localStorage
   */
  persistSyncQueue() {
    try {
      localStorage.setItem('viventiva_sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('[OfflineManager] Error persisting sync queue:', error);
    }
  }

  /**
   * Load sync queue from localStorage
   */
  loadSyncQueue() {
    try {
      const stored = localStorage.getItem('viventiva_sync_queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[OfflineManager] Error loading sync queue:', error);
      this.syncQueue = [];
    }
  }

  /**
   * Clear sync queue
   */
  clearSyncQueue() {
    this.syncQueue = [];
    this.persistSyncQueue();
  }

  /**
   * Get sync queue status
   */
  getSyncQueueStatus() {
    return {
      count: this.syncQueue.length,
      items: this.syncQueue.map(item => ({
        type: item.type,
        timestamp: item.timestamp,
        retries: item.retries,
      })),
    };
  }
}

const offlineManager = new OfflineManager();

// Load sync queue on initialization
offlineManager.loadSyncQueue();

// Process queue if online
if (offlineManager.isCurrentlyOnline()) {
  offlineManager.processSyncQueue();
}

/**
 * Check if currently online
 */
export const isOnline = () => {
  return offlineManager.isCurrentlyOnline();
};

/**
 * Add listener for online/offline status changes
 */
export const onStatusChange = (callback) => {
  return offlineManager.onStatusChange(callback);
};

/**
 * Queue item for sync when back online
 */
export const queueForSync = (item) => {
  offlineManager.addToSyncQueue(item);
};

/**
 * Process sync queue immediately
 */
export const processSyncQueue = async () => {
  return offlineManager.processSyncQueue();
};

/**
 * Get sync queue status
 */
export const getSyncQueueStatus = () => {
  return offlineManager.getSyncQueueStatus();
};

/**
 * Clear sync queue
 */
export const clearSyncQueue = () => {
  offlineManager.clearSyncQueue();
};

/**
 * Show offline indicator
 */
export const showOfflineIndicator = () => {
  if (typeof document === 'undefined') return;

  // Check if indicator already exists
  if (document.getElementById('offline-indicator')) return;

  const indicator = document.createElement('div');
  indicator.id = 'offline-indicator';
  indicator.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg';
  indicator.textContent = 'You are offline. Changes will sync when connection is restored.';
  indicator.setAttribute('role', 'status');
  indicator.setAttribute('aria-live', 'polite');
  
  document.body.appendChild(indicator);

  // Auto-hide after 5 seconds if back online
  const checkOnline = setInterval(() => {
    if (isOnline()) {
      indicator.remove();
      clearInterval(checkOnline);
    }
  }, 1000);
};

/**
 * Hide offline indicator
 */
export const hideOfflineIndicator = () => {
  const indicator = document.getElementById('offline-indicator');
  if (indicator) {
    indicator.remove();
  }
};

// Auto-show/hide indicator based on status
onStatusChange((status) => {
  if (status === 'offline') {
    showOfflineIndicator();
  } else {
    hideOfflineIndicator();
  }
});

export default offlineManager;

