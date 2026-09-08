import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AppErrorBoundary from './AppErrorBoundary';
import CustomerExperiencePortal from './CustomerExperiencePortal';
import './offline.css';
import './accessibility.css';
import './product-excellence.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><AppErrorBoundary><><App /><CustomerExperiencePortal /></></AppErrorBoundary></StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
}
