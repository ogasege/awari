/** React binding for the progress store. */
import { useEffect, useSyncExternalStore } from 'react';
import { getProgress, loadProgress, subscribe, type Progress } from './progress.ts';

export function useProgress(): Progress {
  useEffect(() => {
    void loadProgress();
  }, []);
  return useSyncExternalStore(subscribe, getProgress, getProgress);
}
