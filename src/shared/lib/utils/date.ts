import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd.MM.yyyy', { locale: ru });
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: ru });
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ru });
}
