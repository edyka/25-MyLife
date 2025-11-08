/**
 * Image optimization utility
 * Provides lazy loading, responsive images, and optimization helpers
 */

/**
 * Lazy load images with Intersection Observer
 */
export const lazyLoadImage = (imgElement, src, options = {}) => {
  if (!imgElement || !src) return;

  const {
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
    onLoad = null,
    onError = null,
  } = options;

  // Set placeholder initially
  if (placeholder && !imgElement.src) {
    imgElement.src = placeholder;
  }

  // Use Intersection Observer for lazy loading
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Load the actual image
            const imageLoader = new Image();
            imageLoader.onload = () => {
              img.src = src;
              img.classList.add('loaded');
              if (onLoad) onLoad(img);
            };
            imageLoader.onerror = () => {
              img.classList.add('error');
              if (onError) onError(img);
            };
            imageLoader.src = src;
            
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
      }
    );

    observer.observe(imgElement);
  } else {
    // Fallback for browsers without Intersection Observer
    imgElement.src = src;
  }
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (baseUrl, sizes = [320, 640, 1024, 1920]) => {
  return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
};

/**
 * Generate sizes attribute for responsive images
 */
export const generateSizes = (breakpoints = {
  mobile: '100vw',
  tablet: '50vw',
  desktop: '33vw',
}) => {
  return `(max-width: 640px) ${breakpoints.mobile}, (max-width: 1024px) ${breakpoints.tablet}, ${breakpoints.desktop}`;
};

/**
 * Preload critical images
 */
export const preloadImage = (src, as = 'image') => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

/**
 * Check if image is already loaded
 */
export const isImageLoaded = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};

/**
 * Optimize image URL for CDN (if using image CDN)
 */
export const optimizeImageUrl = (url, options = {}) => {
  if (!url) return url;

  const {
    width,
    height,
    quality = 80,
    format = 'auto',
  } = options;

  // If using a CDN like Cloudinary, Imgix, etc., add optimization parameters
  // This is a placeholder - adjust based on your CDN
  const urlObj = new URL(url, window.location.origin);
  
  if (width) urlObj.searchParams.set('w', width);
  if (height) urlObj.searchParams.set('h', height);
  if (quality) urlObj.searchParams.set('q', quality);
  if (format) urlObj.searchParams.set('f', format);

  return urlObj.toString();
};

/**
 * Create a blur placeholder for images
 */
export const createBlurPlaceholder = (width = 20, height = 20) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Create a simple gradient placeholder
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#e2e8f0');
  gradient.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
};

export default {
  lazyLoadImage,
  generateSrcSet,
  generateSizes,
  preloadImage,
  isImageLoaded,
  optimizeImageUrl,
  createBlurPlaceholder,
};

