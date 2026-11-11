/** Entry point: fonts, global styles, the app and the service worker. */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/bricolage-grotesque/latin-800.css';
import '@fontsource/figtree/latin-400.css';
import '@fontsource/figtree/latin-600.css';
import '@fontsource/figtree/latin-700.css';
import '@fontsource/covered-by-your-grace/latin-400.css';
import './design/tokens.css';
import './design/global.css';
import { App } from './app/App.tsx';
import { registerServiceWorker } from './lib/offline/register.ts';
import { applyDemoFromUrl } from './lib/store/demo.ts';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

registerServiceWorker();
void applyDemoFromUrl(window.location.search);
