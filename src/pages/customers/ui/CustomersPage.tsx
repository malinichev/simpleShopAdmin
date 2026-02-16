import { useState, useMemo, useDeferredValue } from 'react';
import { Link } from 'react-router-dom';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import {
  Search,
  Eye,
  Users,
  MapPin,
  ShoppingBag,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { Modal } from '@/shared/ui/modal';
import { Skeleton } from '@/shared/ui/skeleton';
import { DataTable } from '@/shared/ui/data-table';
import { EmptyState } from '@/shared/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { buildOrderDetailPath } from '@/shared/config';
// import { orderStatuses } from '@/shared/constants';
import { formatRUB } from '@/shared/lib/utils/currency';
import { formatDate } from '@/shared/lib/utils/date';
import type { Customer } from '@/entities/customer';
import { CustomerInfo } from '@/entities/customer';
import {
  useCustomers,
  useCustomer,
  useCustomerOrders,
} from '@/features/customer-management';
import { OrderStatusBadge } from '@/features/order-management';

function getCustomerColumns(onView: (customer: Customer) => void): ColumnDef<Customer, unknown>[] {
  return [
    {
      id: 'name',
      header: 'Имя',
      cell: ({ row }) => {
        const c = row.original;
        const initials = c.firstName.charAt(0).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {c.firstName} {c.lastName}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-gray-600 dark:text-gray-400">{row.original.email}</span>
          {row.original.isEmailVerified ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
          )}
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Телефон',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.original.phone || '—'}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'role',
      header: 'Роль',
      cell: ({ row }) => {
        const roleMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'warning' }> = {
          customer: { label: 'Клиент', variant: 'secondary' },
          manager: { label: 'Менеджер', variant: 'default' },
          admin: { label: 'Админ', variant: 'warning' },
        };
        const r = roleMap[row.original.role] ?? roleMap.customer;
        return <Badge variant={r.variant}>{r.label}</Badge>;
      },
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: 'Регистрация',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => onView(row.original)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          title="Просмотр"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
      enableSorting: false,
    },
  ];
}

export function CustomersPage() {
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const deferredSearch = useDeferredValue(search);

  const { data, isLoading } = useCustomers({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: deferredSearch || undefined,
  });

  const columns = useMemo(
    () => getCustomerColumns(setSelectedCustomer),
    [],
  );

  const customers = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Клиенты</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Управление клиентами магазина
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или email..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      {!isLoading && customers.length === 0 && !deferredSearch ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Нет клиентов"
          description="Клиенты появятся здесь после регистрации на сайте"
        />
      ) : (
        <DataTable<Customer>
          columns={columns}
          data={customers}
          total={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          getRowId={(row) => row._id}
          isLoading={isLoading}
        />
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customerId={selectedCustomer._id}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}

/** Customer detail modal with info, addresses, and recent orders */
function CustomerDetailModal({
  customerId,
  onClose,
}: {
  customerId: string;
  onClose: () => void;
}) {
  const { data: customer, isLoading: loadingCustomer } = useCustomer(customerId);
  const { data: ordersData, isLoading: loadingOrders } = useCustomerOrders(customerId);

  const orders = ordersData?.data ?? [];

  return (
    <Modal open onClose={onClose} title="Информация о клиенте" className="max-w-2xl">
      {loadingCustomer ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : customer ? (
        <div className="space-y-6">
          {/* Customer Info */}
          <CustomerInfo customer={customer} />

          <div className="flex flex-wrap gap-3 text-sm">
            <Badge variant={customer.isEmailVerified ? 'success' : 'secondary'}>
              {customer.isEmailVerified ? 'Email подтверждён' : 'Email не подтверждён'}
            </Badge>
            <Badge variant="secondary">
              {customer.role === 'admin' ? 'Админ' : customer.role === 'manager' ? 'Менеджер' : 'Клиент'}
            </Badge>
          </div>

          {/* Addresses */}
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
              <MapPin className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm">Адреса ({customer.addresses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.addresses.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">Адресов нет</p>
              ) : (
                <div className="space-y-3">
                  {customer.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="rounded-lg border border-gray-100 p-3 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {addr.title}
                        </span>
                        {addr.isDefault && (
                          <Badge variant="success" className="text-[10px]">По умолчанию</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {addr.city}, {addr.street}, {addr.building}
                        {addr.apartment ? `, кв. ${addr.apartment}` : ''}, {addr.postalCode}
                      </p>
                      <p className="text-xs text-gray-400">
                        {addr.firstName} {addr.lastName}, {addr.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
              <ShoppingBag className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-sm">Последние заказы</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">Заказов нет</p>
              ) : (
                <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-700">
                  {orders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <Link
                          to={buildOrderDetailPath(order._id)}
                          onClick={onClose}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        >
                          {order.orderNumber}
                        </Link>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatRUB(order.total)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Клиент не найден</p>
      )}
    </Modal>
  );
}
