// Awari desktop (25-desktop). Serves the same built site as the web from the bundled `site/`
// folder over a privileged app://awari scheme, so the same service worker runs and every pack
// and thumbnail works with no network from the first launch. No desktop-only features.
const { app, BrowserWindow, protocol, net, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

const SCHEME = 'app';
const HOST = 'awari';
const ORIGIN = `${SCHEME}://${HOST}`;
const SITE = path.join(__dirname, 'site');

protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      allowServiceWorkers: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

/** Maps a request path to a file under SITE, falling back to index.html like the CDN does. */
function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0] || '/');
  const file = path.normalize(path.join(SITE, clean));
  if (!file.startsWith(SITE + path.sep) && file !== SITE) return null;
  try {
    if (fs.statSync(file).isFile()) return file;
  } catch {
    // fall through to the single-page fallback
  }
  return path.join(SITE, 'index.html');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 390,
    title: 'Awari',
    backgroundColor: '#f4ecdc',
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.removeMenu();
  // Links to other sites open in the system browser; the window stays on the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(ORIGIN)) {
      event.preventDefault();
      if (/^https?:/.test(url)) void shell.openExternal(url);
    }
  });
  void win.loadURL(`${ORIGIN}/`);
}

app.whenReady().then(() => {
  protocol.handle(SCHEME, (request) => {
    const url = new URL(request.url);
    if (url.host !== HOST) return new Response('Not found', { status: 404 });
    const file = resolveFile(url.pathname);
    if (!file) return new Response('Not found', { status: 404 });
    return net.fetch(pathToFileURL(file).toString());
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

