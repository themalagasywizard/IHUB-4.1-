type OpenFn = typeof window.open;

const isPopupTarget = (target: string | null) =>
  target === '_blank' || target === '_new' || target === '_parent' || target === '_top';

const closestLink = (event: Event): HTMLAnchorElement | null => {
  const raw = event.target as Node | null;
  const el = raw && raw.nodeType === 1 ? (raw as Element) : raw?.parentElement;
  return el?.closest?.('a') ?? null;
};

export const installPlayerPopupGuard = () => {
  const nativeOpen: OpenFn = window.open.bind(window);

  const blockedOpen: OpenFn = function blockedOpen(url, target, features) {
    const popup = nativeOpen(url, target, features);
    if (popup) {
      try {
        popup.location.replace('about:blank');
      } catch {
        // Cross-origin popups still expose close()
      }
      try {
        popup.close();
      } catch {
        // Ignore windows the browser will not close
      }
    }
    return popup;
  };

  const lockOpen = () => {
    try {
      window.open = blockedOpen;
    } catch {
      // Ignore if the environment froze window.open
    }
  };

  const blockLink = (event: Event) => {
    const link = closestLink(event);
    if (!link || !isPopupTarget(link.getAttribute('target'))) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const onBlur = () => {
    window.setTimeout(() => {
      if (document.hasFocus()) return;
      try {
        window.focus();
      } catch {
        // Ignore focus failures in the background
      }
    }, 0);
  };

  lockOpen();
  const lockTimer = window.setInterval(lockOpen, 200);
  document.addEventListener('click', blockLink, true);
  document.addEventListener('auxclick', blockLink, true);
  window.addEventListener('blur', onBlur);

  return {
    nativeOpen,
    uninstall: () => {
      window.clearInterval(lockTimer);
      window.open = nativeOpen;
      document.removeEventListener('click', blockLink, true);
      document.removeEventListener('auxclick', blockLink, true);
      window.removeEventListener('blur', onBlur);
    },
  };
};
