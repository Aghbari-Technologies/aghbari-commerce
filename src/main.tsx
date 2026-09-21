import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './AppV3Fixed';
import InvitationAcceptance from './InvitationAcceptance';
import AppErrorBoundary from './AppErrorBoundary';
import './offline.css';
import './accessibility.css';
import './product-excellence.css';
import './command-palette.css';
import './aghbari-ui-system.css';
import './reference-premium.css';
import './ui-final-visual-closure.css';
import './aghbari-visual-atelier.css';

const invitationToken = new URLSearchParams(window.location.search).get('invite');
const RootApp = invitationToken ? <InvitationAcceptance token={invitationToken} /> : <App />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      {RootApp}
    </AppErrorBoundary>
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const moduleScript = document.querySelector('script[type="module"][src]')?.getAttribute('src') ?? 'fallback';
    const cacheVersion = (moduleScript.split('/').pop() || 'fallback').replace(/[^a-zA-Z0-9._-]/g, '_');
    navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(cacheVersion)}`).catch(() => undefined);
  });
}
