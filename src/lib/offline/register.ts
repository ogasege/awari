/**
 * Registers the hand-written service worker (built to /sw.js) in
 * production builds, and tells the header whether the site is saved for
 * offline use (09-offline Req 3). Offline support is progressive: with no
 * service worker the app still works online.
 */
import { useSyncExternalStore } from 'react';

/** `unsupported`: no worker here; `preparing`: saving; `ready`: saved. */
export type OfflineStatus = 'unsupported' | 'preparing' | 'ready';

let status: OfflineStatus = 'unsupported';
const listeners = new Set<() => void>();

function set(next: OfflineStatus): void {
  if (next !== status) {
    status = next;
    listeners.forEach((l) => l());
  }
}

/** Current status, for tests and non-React callers. */
export function getOfflineStatus(): OfflineStatus {
  return status;
}

/** Files saved so far during the first save, and the total; null when unknown. */
export interface SaveProgress {
  saved: number;
  total: number;
}
let progress: SaveProgress | null = null;

function setProgress(next: SaveProgress | null): void {
  progress = next;
  listeners.forEach((l) => l());
}

export function getSaveProgress(): SaveProgress | null {
  return progress;
}

/** Test helper. */
export function setSaveProgressForTests(next: SaveProgress | null): void {
  setProgress(next);
}

/** The save progress, re-rendering when it changes. */
export function useSaveProgress(): SaveProgress | null {
  return useSyncExternalStore(subscribe, getSaveProgress, () => null);
}

/** Set once the "Saved" notice has been dismissed, so it is shown only the first time. */
export const SAVED_NOTICE_KEY = 'awari.savedNoticeDismissed';

/** Whether the one-time "Saved" notice is still to be shown. */
export function savedNoticePending(): boolean {
  try {
    return localStorage.getItem(SAVED_NOTICE_KEY) !== '1';
  } catch {
    return false;
  }
}

/** Records that the "Saved" notice was dismissed. */
export function dismissSavedNotice(): void {
  try {
    localStorage.setItem(SAVED_NOTICE_KEY, '1');
  } catch {
    // storage unavailable: the notice simply shows again next time
  }
}

/** Test helper. */
export function setOfflineStatusForTests(next: OfflineStatus): void {
  set(next);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The offline status, re-rendering when it changes. */
export function useOfflineStatus(): OfflineStatus {
  return useSyncExternalStore(subscribe, getOfflineStatus, () => 'unsupported');
}

/** Asks the active worker whether the whole site is already saved. */
async function askWorker(reg: ServiceWorkerRegistration): Promise<void> {
  const worker = reg.active;
  if (!worker) {
    return;
  }
  const channel = new MessageChannel();
  channel.port1.onmessage = (event: MessageEvent<{ type?: string; ready?: boolean }>) => {
    if (event.data?.type === 'status' && event.data.ready) {
      set('ready');
    }
  };
  worker.postMessage({ type: 'status' }, [channel.port2]);
}

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return;
  }
  set('preparing');
  navigator.serviceWorker.addEventListener(
    'message',
    (event: MessageEvent<{ type?: string; saved?: number; total?: number }>) => {
      if (event.data?.type === 'ready') {
        setProgress(null);
        set('ready');
      } else if (event.data?.type === 'progress' && typeof event.data.saved === 'number' && typeof event.data.total === 'number') {
        setProgress({ saved: event.data.saved, total: event.data.total });
      }
    },
  );
  const start = (): void => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then(askWorker)
      .catch(() => set('unsupported'));
  };
  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start);
  }
}
