import { formatCurrency } from './formatters';

export function formatRUB(value: number): string {
  return formatCurrency(value, 'RUB', 'ru-RU');
}
