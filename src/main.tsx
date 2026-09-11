import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './AppV3Fixed';
import InvitationAcceptance from './InvitationAcceptance';
import AppErrorBoundary from './AppErrorBoundary';
import './offline.css';
import './accessibility.css';
import './product-excellence.css';

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
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}
