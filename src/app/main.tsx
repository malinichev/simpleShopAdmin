import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { setupInterceptors, bindAuthStore } from '@/shared/api';
import { useAuthStore } from '@/features/auth';
import './styles/tailwind.css';
import './styles/globals.scss';

bindAuthStore({
  getAccessToken: () => useAuthStore.getState().accessToken,
  setAccessToken: (token) => useAuthStore.getState().setAccessToken(token),
  clearAuth: () => useAuthStore.getState().clearAuth(),
});
setupInterceptors();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
