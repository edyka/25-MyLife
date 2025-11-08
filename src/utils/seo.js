/**
 * SEO utility functions
 * Provides dynamic meta tag management and Open Graph tags
 */

/**
 * Update page title
 */
export const setPageTitle = (title) => {
  if (typeof document !== 'undefined') {
    document.title = title ? `${title} | Viventiva` : 'Viventiva - Visualize Your Life';
  }
};

/**
 * Update meta description
 */
export const setMetaDescription = (description) => {
  if (typeof document === 'undefined') return;
  
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = description || 'Visualize your life as a grid of weeks. Track milestones, set goals, and live intentionally with Viventiva.';
};

/**
 * Update Open Graph tags
 */
export const setOpenGraphTags = ({ title, description, image, url, type = 'website' }) => {
  if (typeof document === 'undefined') return;
  
  const baseUrl = window.location.origin;
  const defaultImage = `${baseUrl}/og-image.png`;
  
  const tags = {
    'og:title': title || 'Viventiva - Visualize Your Life',
    'og:description': description || 'Visualize your life as a grid of weeks. Track milestones, set goals, and live intentionally.',
    'og:image': image || defaultImage,
    'og:url': url || window.location.href,
    'og:type': type,
    'og:site_name': 'Viventiva',
  };

  Object.entries(tags).forEach(([property, content]) => {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  });
};

/**
 * Update Twitter Card tags
 */
export const setTwitterCard = ({ title, description, image, card = 'summary_large_image' }) => {
  if (typeof document === 'undefined') return;
  
  const baseUrl = window.location.origin;
  const defaultImage = `${baseUrl}/og-image.png`;
  
  const tags = {
    'twitter:card': card,
    'twitter:title': title || 'Viventiva - Visualize Your Life',
    'twitter:description': description || 'Visualize your life as a grid of weeks. Track milestones, set goals, and live intentionally.',
    'twitter:image': image || defaultImage,
  };

  Object.entries(tags).forEach(([name, content]) => {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  });
};

/**
 * Set canonical URL
 */
export const setCanonicalUrl = (url) => {
  if (typeof document === 'undefined') return;
  
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url || window.location.href;
};

/**
 * Initialize SEO for a page
 */
export const initSEO = ({ title, description, image, url, type }) => {
  setPageTitle(title);
  setMetaDescription(description);
  setOpenGraphTags({ title, description, image, url, type });
  setTwitterCard({ title, description, image });
  setCanonicalUrl(url);
};

/**
 * Structured data (JSON-LD) for rich snippets
 */
export const setStructuredData = (data) => {
  if (typeof document === 'undefined') return;
  
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Generate organization structured data
 */
export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Viventiva',
    description: 'A life visualization tool that helps you track milestones, set goals, and live intentionally.',
    url: window.location.origin,
    logo: `${window.location.origin}/logo.png`,
  };
};

/**
 * Generate WebApplication structured data
 */
export const generateWebAppSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Viventiva',
    description: 'Visualize your life as a grid of weeks. Track milestones, set goals, and live intentionally.',
    url: window.location.origin,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
};

export default {
  setPageTitle,
  setMetaDescription,
  setOpenGraphTags,
  setTwitterCard,
  setCanonicalUrl,
  initSEO,
  setStructuredData,
  generateOrganizationSchema,
  generateWebAppSchema,
};

