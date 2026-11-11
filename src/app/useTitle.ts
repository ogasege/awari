/** Sets `document.title` for the current screen (01-app-shell Req 2.5). */
import { useEffect } from 'react';

export function useTitle(title: string | undefined): void {
  useEffect(() => {
    document.title = title ? `${title} · Awari` : 'Awari: discover the world';
  }, [title]);
}
