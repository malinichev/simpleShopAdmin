import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { setupInterceptors } from '@/shared/api';
import './styles/tailwind.css';
import './styles/globals.scss';

setupInterceptors();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
