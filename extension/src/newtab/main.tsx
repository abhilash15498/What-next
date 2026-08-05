import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppDataProvider } from '../lib/AppDataContext';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppDataProvider>
      <App />
    </AppDataProvider>
  </StrictMode>,
);
