import { useState, useCallback, createElement } from 'react';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';

interface UseConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

interface UseConfirmReturn {
  confirm: () => Promise<boolean>;
  ConfirmDialogComponent: React.ReactElement | null;
}

export function useConfirm(options: UseConfirmOptions): UseConfirmReturn {
  const [open, setOpen] = useState(false);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
      setOpen(true);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    resolveRef?.(true);
    setResolveRef(null);
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    resolveRef?.(false);
    setResolveRef(null);
  }, [resolveRef]);

  const ConfirmDialogComponent = open
    ? createElement(ConfirmDialog, {
        open,
        title: options.title,
        description: options.description,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        variant: options.variant,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
      })
    : null;

  return { confirm, ConfirmDialogComponent };
}
