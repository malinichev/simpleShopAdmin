import { useState, useDeferredValue } from 'react';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { DateRangePicker } from '@/shared/ui/date-picker';
import { orderStatuses, type OrderStatus } from '@/shared/constants';
import { paymentStatuses } from '@/shared/constants';
import type { PaymentStatus } from '@/entities/order';
import { OrdersTable } from '@/widgets/orders-table';

const statusOptions = [
  { value: '', label: 'Все статусы' },
  ...Object.entries(orderStatuses).map(([value, { label }]) => ({ value, label })),
];

const paymentOptions = [
  { value: '', label: 'Все оплаты' },
  ...Object.entries(paymentStatuses).map(([value, { label }]) => ({ value, label })),
];

export function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');

  const deferredSearch = useDeferredValue(search);

  const dateFrom = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
  const dateTo = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Заказы</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Управление заказами клиентов
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по номеру или email..."
            className="pl-9"
          />
        </div>
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Статус"
          className="w-[170px]"
        />
        <Select
          options={paymentOptions}
          value={paymentFilter}
          onChange={setPaymentFilter}
          placeholder="Оплата"
          className="w-[160px]"
        />
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          placeholder="Период"
          className="w-[260px]"
        />
        <div className="flex items-end gap-2">
          <Input
            value={minTotal}
            onChange={(e) => setMinTotal(e.target.value)}
            placeholder="Сумма от"
            type="number"
            className="w-[120px]"
          />
          <Input
            value={maxTotal}
            onChange={(e) => setMaxTotal(e.target.value)}
            placeholder="Сумма до"
            type="number"
            className="w-[120px]"
          />
        </div>
      </div>

      {/* Table */}
      <OrdersTable
        search={deferredSearch || undefined}
        status={(statusFilter as OrderStatus) || undefined}
        paymentStatus={(paymentFilter as PaymentStatus) || undefined}
        dateFrom={dateFrom}
        dateTo={dateTo}
        minTotal={minTotal ? Number(minTotal) : undefined}
        maxTotal={maxTotal ? Number(maxTotal) : undefined}
      />
    </div>
  );
}
