import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { VioraProvider } from './context/VioraContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New Viora content available, reloading...');
  },
  onOfflineReady() {
    console.log('Viora is ready to work offline');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <VioraProvider>
        <App />
      </VioraProvider>
    </ErrorBoundary>
  </StrictMode>,
);

