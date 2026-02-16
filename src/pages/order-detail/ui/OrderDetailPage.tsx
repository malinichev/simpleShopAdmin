import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, RefreshCw, User, MapPin, StickyNote, CreditCard } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Textarea } from '@/shared/ui/textarea';
import { ROUTES } from '@/shared/config';
import { paymentStatuses } from '@/shared/constants';
import { formatRUB } from '@/shared/lib/utils/currency';
import { formatDateTime } from '@/shared/lib/utils/date';
import { OrderItemRow } from '@/entities/order';
import type { PaymentStatus } from '@/entities/order';
import {
  useOrder,
  useUpdateOrderStatus,
  useUpdateAdminNote,
  OrderStatusBadge,
  OrderTimeline,
  ChangeStatusModal,
  useUsers,
} from '@/features/order-management';

const paymentVariantMap: Record<
  PaymentStatus,
  'default' | 'secondary' | 'success' | 'warning' | 'destructive'
> = {
  pending: 'warning',
  paid: 'success',
  failed: 'destructive',
  refunded: 'secondary',
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id!);
  const { data: userData, isLoading: isLoadingUser } = useUsers(order?.userId);
  const updateStatus = useUpdateOrderStatus();
  const updateNote = useUpdateAdminNote();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Заказ не найден</p>
        <Link to={ROUTES.ORDERS} className="mt-2 text-primary-600 hover:underline">
          Вернуться к списку
        </Link>
      </div>
    );
  }

  const noteValue = adminNote ?? order.adminNote ?? '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to={ROUTES.ORDERS}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Заказ {order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setStatusModalOpen(true)}>
            <RefreshCw className="h-4 w-4" />
            Изменить статус
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Печать
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Товары</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {order.items.map((item, index) => (
                  <OrderItemRow key={`${item.productId}-${item.variantId}-${index}`} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Итого</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500 dark:text-gray-400">Подытог</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {formatRUB(order.subtotal)}
                  </dd>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500 dark:text-gray-400">
                      Скидка
                      {order.promoCode && (
                        <span className="ml-1 text-xs text-primary-600">({order.promoCode})</span>
                      )}
                    </dt>
                    <dd className="font-medium text-red-600 dark:text-red-400">
                      −{formatRUB(order.discount)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500 dark:text-gray-400">Доставка</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {order.shipping > 0 ? formatRUB(order.shipping) : 'Бесплатно'}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
                  <dt className="text-base font-semibold text-gray-900 dark:text-white">Итого</dt>
                  <dd className="text-base font-semibold text-gray-900 dark:text-white">
                    {formatRUB(order.total)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Right column (1/3) */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <User className="h-5 w-5 text-gray-400" />
              <CardTitle>Клиент</CardTitle>
            </CardHeader>
            {!isLoadingUser && userData && (
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {userData?.firstName} {userData?.lastName}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">{userData?.email}</p>
                  {userData?.phone && (
                    <p className="text-gray-500 dark:text-gray-400">{userData?.phone}</p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Payment & Shipping Method */}
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <CardTitle>Оплата и доставка</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Оплата</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-white">{order.paymentMethod}</span>
                    <Badge
                      variant={
                        paymentVariantMap?.[order.paymentStatus] ?? paymentVariantMap.pending
                      }
                    >
                      {paymentStatuses[order.paymentStatus]?.label ?? paymentStatuses.pending.label}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Доставка</span>
                  <span className="text-gray-900 dark:text-white">{order.shippingMethod}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <MapPin className="h-5 w-5 text-gray-400" />
              <CardTitle>Адрес доставки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.phone}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.street},{' '}
                  {order.shippingAddress.building}
                  {order.shippingAddress.apartment && `, кв. ${order.shippingAddress.apartment}`}
                </p>
                <p>{order.shippingAddress.postalCode}</p>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <StickyNote className="h-5 w-5 text-gray-400" />
              <CardTitle>Заметки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.customerNote && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Комментарий клиента
                    </p>
                    <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                      {order.customerNote}
                    </p>
                  </div>
                )}
                <div>
                  <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Внутренний комментарий
                  </p>
                  <Textarea
                    value={noteValue}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Добавить заметку..."
                    rows={3}
                  />
                  {adminNote !== null && adminNote !== (order.adminNote ?? '') && (
                    <Button
                      size="sm"
                      className="mt-2"
                      loading={updateNote.isPending}
                      onClick={() => updateNote.mutate({ id: id!, adminNote })}
                    >
                      Сохранить
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>История заказа</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTimeline events={order.history} />
        </CardContent>
      </Card>

      {/* Change Status Modal */}
      <ChangeStatusModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        currentStatus={order.status}
        isSubmitting={updateStatus.isPending}
        onSubmit={(newStatus, comment) => {
          updateStatus.mutate(
            { id: order._id, status: newStatus, comment },
            { onSuccess: () => setStatusModalOpen(false) },
          );
        }}
      />
    </div>
  );
}
