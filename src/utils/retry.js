/**
 * Retry utility with exponential backoff
 * Used for Supabase sync operations to handle network failures gracefully
 */

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {Function} options.shouldRetry - Function to determine if error should be retried
 * @returns {Promise} Result of the function
 */
export const retryWithBackoff = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error) => {
      // Retry on network errors, 5xx errors, and rate limits
      if (!error) return false;
      if (error.message?.includes('Failed to fetch') || error.message?.includes('network')) return true;
      if (error.status >= 500 && error.status < 600) return true;
      if (error.status === 429) return true; // Rate limit
      if (error.status === 408) return true; // Request timeout
      return false;
    },
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      if (attempt > 0) {
        console.log(`[Retry] Operation succeeded after ${attempt} retry(ies)`);
      }
      return result;
    } catch (_error) {
      lastError = _error;

      // Don't retry if we've exhausted retries or error shouldn't be retried
      if (attempt >= maxRetries || !shouldRetry(_error)) {
        console.error(`[Retry] Operation failed after ${attempt} retries:`, _error);
        throw _error;
      }

      // Calculate exponential backoff delay with jitter
      const jitter = Math.random() * 0.3 * delay; // Add up to 30% jitter
      const backoffDelay = Math.min(delay + jitter, maxDelay);

      console.warn(
        `[Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${Math.round(backoffDelay)}ms:`,
        error.message || error
      );

      await new Promise((resolve) => setTimeout(resolve, backoffDelay));

      // Exponential backoff: double the delay for next attempt
      delay = Math.min(delay * 2, maxDelay);
    }
  }

  throw lastError;
};

/**
 * Queue for failed sync operations to retry later
 */
class SyncQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.maxQueueSize = 50;
  }

  /**
   * Add a failed sync operation to the queue
   */
  enqueue(operation) {
    if (this.queue.length >= this.maxQueueSize) {
      console.warn('[SyncQueue] Queue full, dropping oldest operation');
      this.queue.shift();
    }
    this.queue.push({
      ...operation,
      timestamp: Date.now(),
      retryCount: 0,
    });
    this.processQueue();
  }

  /**
   * Process the queue with exponential backoff
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const operation = this.queue[0];
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      // Remove stale operations
      if (Date.now() - operation.timestamp > maxAge) {
        console.warn('[SyncQueue] Removing stale operation:', operation.type);
        this.queue.shift();
        continue;
      }

      try {
        await retryWithBackoff(operation.fn, {
          maxRetries: 3,
          shouldRetry: operation.shouldRetry,
        });

        // Success - remove from queue
        console.log(`[SyncQueue] Successfully synced ${operation.type}`);
        this.queue.shift();
      } catch (error) {
        operation.retryCount++;

        // If max retries exceeded, remove from queue
        if (operation.retryCount >= 5) {
          console.error(`[SyncQueue] Max retries exceeded for ${operation.type}, removing from queue`);
          this.queue.shift();
        } else {
          // Move to end of queue for later retry
          this.queue.push(this.queue.shift());
          // Wait before next retry
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      length: this.queue.length,
      isProcessing: this.isProcessing,
      operations: this.queue.map((op) => ({
        type: op.type,
        retryCount: op.retryCount,
        age: Date.now() - op.timestamp,
      })),
    };
  }
}

export const syncQueue = new SyncQueue();

// Process queue periodically (every 30 seconds)
if (typeof window !== 'undefined') {
  setInterval(() => {
    syncQueue.processQueue();
  }, 30000);
}

export default {
  retryWithBackoff,
  syncQueue,
};

