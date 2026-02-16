import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/shared/lib/utils';

export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
  id,
}: SwitchProps) {
  const switchId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <SwitchPrimitive.Root
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors data-[state=checked]:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700"
      >
        <SwitchPrimitive.Thumb className="block h-5 w-5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
      </SwitchPrimitive.Root>
      {label && (
        <label
          htmlFor={switchId}
          className="cursor-pointer text-sm text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
    </div>
  );
}
