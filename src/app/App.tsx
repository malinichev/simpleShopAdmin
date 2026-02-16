import { AppProviders } from './providers';
import { AppRoutes } from './routes';
import { Toaster } from '@/shared/ui';

export function App() {
  return (
    <AppProviders>
      <AppRoutes />
      <Toaster />
    </AppProviders>
  );
}
