import { useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { DayPicker, type DateRange } from 'react-day-picker';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/shared/lib/utils';
import { Button } from '../button';

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Выберите период',
  className,
  disabled,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const label =
    value?.from && value?.to
      ? `${format(value.from, 'dd.MM.yyyy', { locale: ru })} — ${format(value.to, 'dd.MM.yyyy', { locale: ru })}`
      : value?.from
        ? format(value.from, 'dd.MM.yyyy', { locale: ru })
        : placeholder;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value?.from && 'text-gray-400',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          sideOffset={4}
          align="start"
        >
          <DayPicker
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={ru}
            classNames={{
              root: 'text-sm',
              months: 'flex gap-4',
              month_caption: 'flex justify-center items-center h-10 font-medium text-gray-900 dark:text-white',
              nav: 'flex items-center gap-1',
              button_previous: 'absolute left-1 top-0 h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400',
              button_next: 'absolute right-1 top-0 h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400',
              weekday: 'w-9 text-center text-xs font-medium text-gray-500 dark:text-gray-400',
              day: 'h-9 w-9 text-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
              selected: 'bg-primary-500 text-white hover:bg-primary-600',
              range_start: 'rounded-l-md',
              range_end: 'rounded-r-md',
              range_middle: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400',
              today: 'font-bold text-primary-500',
              outside: 'text-gray-300 dark:text-gray-600',
              disabled: 'text-gray-300 dark:text-gray-600 cursor-not-allowed',
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
