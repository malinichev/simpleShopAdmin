import { useState, useMemo, useCallback } from 'react';
import { ShoppingBag } from 'lucide-react';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable } from '@/shared/ui/data-table';
import { EmptyState } from '@/shared/ui/empty-state';
import type { Order, OrderQueryParams, PaymentStatus } from '@/entities/order';
import type { OrderStatus } from '@/shared/constants';
import {
  useOrders,
  useUpdateOrderStatus,
  ChangeStatusModal,
} from '@/features/order-management';
import { getOrderColumns } from './columns';

interface OrdersTableProps {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  maxTotal?: number;
}

export function OrdersTable({
  search,
  status,
  paymentStatus,
  dateFrom,
  dateTo,
  minTotal,
  maxTotal,
}: OrdersTableProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);

  const updateStatus = useUpdateOrderStatus();

  const params: OrderQueryParams = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: search || undefined,
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    minTotal: minTotal || undefined,
    maxTotal: maxTotal || undefined,
  };

  const { data, isLoading } = useOrders(params);


  const handleChangeStatus = useCallback((order: Order) => {
    setStatusOrder(order);
  }, []);

  const columns = useMemo(
    () => getOrderColumns({ onChangeStatus: handleChangeStatus }),
    [handleChangeStatus],
  );

  const orders = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  console.log({orders})

  const hasFilters = search || status || paymentStatus || dateFrom || dateTo || minTotal || maxTotal;

  if (!isLoading && orders.length === 0 && !hasFilters) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-12 w-12" />}
        title="Нет заказов"
        description="Заказы появятся здесь, когда покупатели оформят покупки"
      />
    );
  }

  return (
    <>
      <DataTable<Order>
        columns={columns}
        data={orders}
        total={total}
        pagination={pagination}
        sorting={sorting}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        getRowId={(row) => row._id}
        isLoading={isLoading}
      />

      {statusOrder && (
        <ChangeStatusModal
          open
          onClose={() => setStatusOrder(null)}
          currentStatus={statusOrder.status}
          isSubmitting={updateStatus.isPending}
          onSubmit={(newStatus, comment) => {
            updateStatus.mutate(
              { id: statusOrder._id, status: newStatus, comment },
              { onSuccess: () => setStatusOrder(null) },
            );
          }}
        />
      )}
    </>
  );
}
