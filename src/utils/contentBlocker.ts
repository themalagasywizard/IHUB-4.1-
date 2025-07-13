// Enhanced content blocker utility functions - Optimized for sports streaming
const blockAds = () => {
  // Comprehensive ad and popup blocking selectors
  const adSelectors = [
    // Standard ad networks
    'iframe[src*="doubleclick.net"]',
    'iframe[src*="google-analytics.com"]',
    'iframe[src*="googleadservices.com"]',
    'iframe[src*="googlesyndication.com"]',
    'iframe[src*="googletagmanager.com"]',
    'iframe[src*="facebook.com/tr"]',
    'iframe[src*="outbrain.com"]',
    'iframe[src*="taboola.com"]',
    
    // Generic ad classes and IDs
    'div[class*="ad-"]',
    'div[class*="ads-"]',
    'div[class*="advertisement"]',
    'div[id*="ad-"]',
    'div[id*="ads-"]',
    'div[id*="advertisement"]',
    'ins.adsbygoogle',
    '[class*="sponsored"]',
    '[id*="sponsored"]',
    
    // Malicious/annoying domains
    'iframe[src*="nexusbloom.xyz"]',
    'a[href*="nexusbloom.xyz"]',
    'iframe[src*="clickid"]',
    'a[href*="clickid"]',
    'iframe[src*="kzt2afc1rp52.com"]',
    'a[href*="kzt2afc1rp52.com"]',
    'iframe[src*="youradexchange.com"]',
    'a[href*="youradexchange.com"]',
    'iframe[src*="hoodlumbragget.com"]',
    'a[href*="hoodlumbragget.com"]',
    'iframe[src*="madurird.com"]',
    'a[href*="madurird.com"]',
    'iframe[src*="rtmark.net"]',
    'a[href*="rtmark.net"]',
    
    // Video player specific selectors
    'div[class*="player-ads"]',
    'div[class*="video-ad"]',
    'div[class*="preroll"]',
    'div[class*="midroll"]',
    'div[class*="postroll"]',
    '.overlay-ad',
    '#player-advertising',
    '[id*="adContainer"]',
    '[class*="ad-overlay"]',
    '[id*="ad-overlay"]',
    
    // Popup and overlay selectors - more comprehensive
    '[class*="overlay"]:not([class*="player-overlay"]):not([class*="video-overlay"])',
    '[class*="popup"]:not([class*="video-popup"])',
    '[class*="modal"]:not([class*="video-modal"]):not([class*="player-modal"])',
    '[id*="overlay"]:not([id*="player"]):not([id*="video"])',
    '[id*="popup"]:not([id*="player"]):not([id*="video"])',
    '[id*="modal"]:not([id*="player"]):not([id*="video"])',
    
    // Common popup patterns
    'div[style*="position: fixed"]',
    'div[style*="z-index: 999"]',
    'div[style*="z-index: 9999"]',
    '[class*="floating"]',
    '[class*="sticky-banner"]',
    '[class*="notification-bar"]',
    
    // Suspicious elements
    '[onclick*="window.open"]',
    '[onclick*="popup"]',
    '[onclick*="alert"]',
    'a[target="_blank"]:not([href*="daddylive2.top"]):not([href*="stream2watch.pk"]):not([href*="livecric.pk"])',
    
    // Known ad script containers
    'script[src*="ads"]',
    'script[src*="advertisement"]',
    'script[src*="doubleclick"]',
    'script[src*="googlesyndication"]',
    'script[src*="outbrain"]',
    'script[src*="taboola"]'
  ];

  const removeAds = () => {
    adSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(element => {
          // Additional check to avoid removing legitimate video players
          if (!element.closest('[class*="video-player"]') && 
              !element.closest('[id*="video-player"]') &&
              !element.closest('[class*="player-container"]')) {
            element.remove();
          }
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

// Enhanced popup and redirect blocking
const blockPopupsAndRedirects = () => {
  const maliciousDomains = new Set([
    'nexusbloom.xyz',
    'clickid',
    'doubleclick.net',
    'googleadservices.com',
    'googlesyndication.com',
    'googletagmanager.com',
    'kzt2afc1rp52.com',
    'youradexchange.com',
    'hoodlumbragget.com',
    'madurird.com',
    'rtmark.net',
    'outbrain.com',
    'taboola.com',
    'facebook.com/tr',
    'popads.net',
    'popcash.net',
    'propellerads.com',
    'adnxs.com',
    'adsystem.com',
    'amazon-adsystem.com'
  ]);

  // Trusted streaming domains that should not be blocked
  const trustedStreamingDomains = new Set([
    'daddylive2.top',
    'stream2watch.pk',
    'livecric.pk',
    'vidsrc.to',
    'vidsrc.me',
    'api.themoviedb.org',
    'image.tmdb.org',
    'localhost',
    '127.0.0.1'
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

  const isTrustedDomain = (url: string): boolean => {
    try {
      const urlObj = new URL(url, window.location.origin);
      return trustedStreamingDomains.has(urlObj.hostname) || 
             Array.from(trustedStreamingDomains).some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  // Block suspicious clicks
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link.href) {
      // Block malicious domains
      if (isMaliciousDomain(link.href)) {
        event.preventDefault();
        event.stopPropagation();
        console.warn('Blocked malicious link:', link.href);
        return;
      }
      
      // Block suspicious external links that aren't trusted
      if (link.target === '_blank' && !isTrustedDomain(link.href)) {
        event.preventDefault();
        event.stopPropagation();
        console.warn('Blocked suspicious external link:', link.href);
        return;
      }
    }
    
    // Block clicks on suspicious elements
    if (target.onclick && target.onclick.toString().includes('window.open')) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('Blocked suspicious onclick with window.open');
    }
  }, true);

  // Block form submissions to malicious domains
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement;
    if (form && form.action && isMaliciousDomain(form.action)) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('Blocked malicious form submission:', form.action);
    }
  }, true);

  // Enhanced popup blocking - block ALL popups except trusted domains
  try {
    const originalOpen = window.open;
    window.open = function(...args) {
      const url = args[0]?.toString();
      
      // Allow empty/undefined URLs (some legitimate popups)
      if (!url || url === 'about:blank') {
        return originalOpen.apply(this, args);
      }
      
      // Block malicious domains
      if (isMaliciousDomain(url)) {
        console.warn('Blocked malicious popup:', url);
        return null;
      }
      
      // Block all external popups except trusted streaming domains
      if (!isTrustedDomain(url)) {
        console.warn('Blocked external popup:', url);
        return null;
      }
      
      return originalOpen.apply(this, args);
    };
  } catch (e) {
    console.warn('Could not override window.open:', e);
  }

  // Block focus stealing
  document.addEventListener('focus', (event) => {
    const target = event.target as HTMLElement;
    if (target && (target.matches('[class*="popup"]') || target.matches('[class*="overlay"]'))) {
      event.preventDefault();
      event.stopPropagation();
      target.blur();
    }
  }, true);

  // Block context menu on suspicious elements
  document.addEventListener('contextmenu', (event) => {
    const target = event.target as HTMLElement;
    if (target && target.matches('[class*="ad-"], [class*="popup"], [class*="overlay"]')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  // Block keyboard shortcuts that might trigger popups
  document.addEventListener('keydown', (event) => {
    // Block Ctrl+N (new window), Ctrl+Shift+N (incognito), etc.
    if (event.ctrlKey && (event.key === 'n' || event.key === 'N')) {
      const target = event.target as HTMLElement;
      if (!target.matches('input, textarea, [contenteditable]')) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }, true);
};

// Export the protectIframe function - Minimal restrictions for streaming compatibility
export const protectIframe = (iframe: HTMLIFrameElement) => {
  try {
    // Remove sandbox attribute entirely for streaming compatibility
    iframe.removeAttribute('sandbox');
    
    // Remove any CSP restrictions that might interfere
    iframe.removeAttribute('csp');
    
    // Remove deprecated fullscreen attributes to avoid warnings (if they exist)
    iframe.removeAttribute('allowfullscreen');
    iframe.removeAttribute('webkitallowfullscreen');
    iframe.removeAttribute('mozallowfullscreen');
    
    // Add event listener to prevent iframe from stealing focus
    iframe.addEventListener('load', () => {
      try {
        // Prevent iframe from opening popups
        if (iframe.contentWindow) {
          const originalOpen = iframe.contentWindow.open;
          iframe.contentWindow.open = function() {
            console.warn('Blocked iframe popup attempt');
            return null;
          };
        }
      } catch (e) {
        // Cross-origin restrictions might prevent this
      }
    });
    
    // Ensure the iframe has minimal restrictions for streaming
    console.log('Iframe protection applied - minimal restrictions for streaming');
  } catch (e) {
    console.warn('Error protecting iframe:', e);
  }
};

// Initialize all blockers with enhanced popup protection
export const initializeBlockers = () => {
  try {
    blockAds();
    blockPopupsAndRedirects();
    
    // Additional protection against common popup triggers
    setTimeout(() => {
      // Block delayed popups that might trigger after page load
      const suspiciousElements = document.querySelectorAll('div[style*="position: fixed"], div[style*="z-index: 999"]');
      suspiciousElements.forEach(element => {
        if (!element.closest('[class*="video-player"]') && 
            !element.closest('[class*="player-container"]') &&
            !element.closest('[class*="navigation"]') &&
            !element.closest('[class*="header"]') &&
            !element.closest('[class*="footer"]')) {
          element.remove();
        }
      });
    }, 2000);
    
    console.log('Enhanced content blockers initialized with popup protection');
  } catch (error) {
    console.warn('Error initializing content blockers:', error);
    // Continue execution even if blockers fail to initialize
  }
};