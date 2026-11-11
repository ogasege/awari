/**
 * Registers the hand-written service worker (built to /sw.js) in
 * production builds, so packs keep working without a network.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return;
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is progressive; the app still works online.
    });
  });
}
