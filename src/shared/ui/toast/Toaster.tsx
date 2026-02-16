import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from '@/app/providers';

export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme}
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'border border-gray-200 dark:border-gray-700',
        },
      }}
      richColors
      closeButton
    />
  );
}
