import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initBackgroundServiceWorker } from './services/backgroundSync.ts';

// Inisialisasi Service Worker & Sinkronisasi Latar Belakang PWA
initBackgroundServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
