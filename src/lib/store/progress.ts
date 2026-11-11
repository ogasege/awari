/**
 * The student's progress, kept on their device in IndexedDB: discovered
 * countries (stamps), quiz results and castle rooms lit. Falls back to
 * memory when IndexedDB is unavailable (private mode, old browsers).
 * No accounts, nothing leaves the device.
 */

export interface QuizResult {
  /** "<pack>/<articleId>" */
  key: string;
  correct: number;
  total: number;
  hintsUsed: number;
  at: string;
}

export interface Progress {
  /** Country slugs in the order they were discovered. */
  discovered: string[];
  quizzes: Record<string, QuizResult>;
  /** Wing id -> number of rooms lit (0–12). */
  castle: Record<string, number>;
}

export const EMPTY_PROGRESS: Progress = { discovered: [], quizzes: {}, castle: {} };

const DB = 'awari';
const STORE = 'progress';
const KEY = 'me';

let cache: Progress = EMPTY_PROGRESS;
let loaded: Promise<Progress> | null = null;
const listeners = new Set<() => void>();

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function read(): Promise<Progress> {
  const db = await openDb();
  if (!db) {
    return cache;
  }
  return new Promise((resolve) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(normalise(req.result));
    req.onerror = () => resolve(cache);
  });
}

async function write(progress: Progress): Promise<void> {
  const db = await openDb();
  if (!db) {
    return;
  }
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(progress, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

/** Repairs anything malformed read back from storage. */
export function normalise(value: unknown): Progress {
  const v = (value ?? {}) as Partial<Progress>;
  const discovered = Array.isArray(v.discovered)
    ? [...new Set(v.discovered.filter((d): d is string => typeof d === 'string'))]
    : [];
  const quizzes =
    v.quizzes && typeof v.quizzes === 'object' ? { ...v.quizzes } : {};
  const castle: Record<string, number> = {};
  if (v.castle && typeof v.castle === 'object') {
    for (const [k, n] of Object.entries(v.castle)) {
      if (typeof n === 'number' && Number.isFinite(n)) {
        castle[k] = Math.max(0, Math.min(12, Math.floor(n)));
      }
    }
  }
  return { discovered, quizzes, castle };
}

/** Loads progress once; later calls share the same promise. */
export function loadProgress(): Promise<Progress> {
  loaded ??= read().then((p) => {
    cache = p;
    listeners.forEach((l) => l());
    return p;
  });
  return loaded;
}

/** Current in-memory snapshot (EMPTY until loaded). */
export function getProgress(): Progress {
  return cache;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Applies a pure update, notifies subscribers and persists. */
export async function update(fn: (p: Progress) => Progress): Promise<Progress> {
  await loadProgress();
  cache = normalise(fn(cache));
  listeners.forEach((l) => l());
  await write(cache);
  return cache;
}

/** Pure: marks a country discovered (idempotent, keeps first-seen order). */
export function withDiscovered(p: Progress, slug: string): Progress {
  return p.discovered.includes(slug)
    ? p
    : { ...p, discovered: [...p.discovered, slug] };
}

/** Pure: records a quiz result, keeping the best score per quiz. */
export function withQuizResult(p: Progress, r: QuizResult): Progress {
  const prev = p.quizzes[r.key];
  if (prev && prev.correct >= r.correct) {
    return p;
  }
  return { ...p, quizzes: { ...p.quizzes, [r.key]: r } };
}

/** Pure: lights rooms in a wing, never going backwards or past 12. */
export function withRoomsLit(p: Progress, wing: string, lit: number): Progress {
  const next = Math.max(p.castle[wing] ?? 0, Math.min(12, Math.max(0, lit)));
  return { ...p, castle: { ...p.castle, [wing]: next } };
}

/** Test helper: forget the cached state between tests. */
export function resetForTests(): void {
  cache = EMPTY_PROGRESS;
  loaded = null;
  listeners.clear();
}
