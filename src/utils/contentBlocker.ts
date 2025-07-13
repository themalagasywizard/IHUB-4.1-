// Content blocker utility functions - Simplified for compatibility
const blockAds = () => {
  // Block common ad elements
  const adSelectors = [
    'iframe[src*="doubleclick.net"]',
    'iframe[src*="google-analytics.com"]',
    'iframe[src*="googleadservices.com"]',
    'div[class*="ad-"]',
    'div[class*="ads-"]',
    'div[id*="ad-"]',
    'div[id*="ads-"]',
    'ins.adsbygoogle',
    '[class*="sponsored"]',
    '[id*="sponsored"]',
    'iframe[src*="nexusbloom.xyz"]',
    'a[href*="nexusbloom.xyz"]',
    'iframe[src*="clickid"]',
    'a[href*="clickid"]',
    // Video player specific selectors
    'div[class*="player-ads"]',
    'div[class*="video-ad"]',
    '.overlay-ad',
    '#player-advertising',
    '[class*="preroll"]',
    '[class*="midroll"]',
    '[id*="adContainer"]',
    // Additional overlay and popup selectors
    '[class*="overlay"]',
    '[class*="popup"]',
    '[id*="overlay"]',
    '[id*="popup"]'
  ];

  const removeAds = () => {
    adSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(element => {
          element.remove();
        });
      } catch (e) {
        // Ignore errors removing individual elements
      }
    });
  };

  // Run initially and observe DOM changes
  try {
    removeAds();
    const observer = new MutationObserver(removeAds);
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (e) {
    console.warn('Ad blocker initialization failed:', e);
  }
};

// Minimal redirect blocking - only for known malicious domains
const blockMaliciousRedirects = () => {
  const maliciousDomains = new Set([
    'nexusbloom.xyz',
    'clickid',
    'doubleclick.net',
    'googleadservices.com'
  ]);

  const isMaliciousDomain = (url: string): boolean => {
    try {
      const urlObj = new URL(url, window.location.origin);
      return maliciousDomains.has(urlObj.hostname) || 
             Array.from(maliciousDomains).some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  // Only block clicks to known malicious domains
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    if (link && link.href && isMaliciousDomain(link.href)) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('Blocked malicious link:', link.href);
    }
  }, true);

  // Block malicious form submissions
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement;
    if (form && form.action && isMaliciousDomain(form.action)) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('Blocked malicious form submission:', form.action);
    }
  }, true);

  // Block malicious popups only
  try {
    const originalOpen = window.open;
    window.open = function(...args) {
      const url = args[0]?.toString();
      if (url && isMaliciousDomain(url)) {
        console.warn('Blocked malicious popup:', url);
        return null;
      }
      return originalOpen.apply(this, args);
    };
  } catch (e) {
    console.warn('Could not override window.open:', e);
  }
};

// Export the protectIframe function
export const protectIframe = (iframe: HTMLIFrameElement) => {
  try {
    // Set sandbox attributes to allow minimum required functionality
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
    
    // Set security headers through CSP
    iframe.setAttribute('csp', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *;");
    
    // Prevent iframe from capturing keyboard input when not focused
    iframe.setAttribute('tabindex', '-1');
    
    // Add loading="lazy" for better performance
    iframe.setAttribute('loading', 'lazy');
    
    // Add referrerpolicy to prevent information leakage
    iframe.setAttribute('referrerpolicy', 'no-referrer');
  } catch (e) {
    console.warn('Error protecting iframe:', e);
  }
};

// Initialize all blockers with error handling - Simplified version
export const initializeBlockers = () => {
  try {
    blockAds();
    blockMaliciousRedirects();
    console.log('Simplified content blockers initialized');
  } catch (error) {
    console.warn('Error initializing content blockers:', error);
    // Continue execution even if blockers fail to initialize
  }
};