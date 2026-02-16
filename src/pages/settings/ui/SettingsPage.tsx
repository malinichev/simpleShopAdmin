import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Save, Store, Truck, CreditCard, Bell, Users, Pencil } from 'lucide-react';
import type { Resolver } from 'react-hook-form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Select } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { Modal } from '@/shared/ui/modal';
import { Badge } from '@/shared/ui/badge';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { Skeleton } from '@/shared/ui/skeleton';
import { api } from '@/shared/api';
import { formatDate } from '@/shared/lib/utils/date';
import { useCustomers } from '@/features/customer-management';
import {
  useSettings,
  useUpdateSettings,
  useShippingMethods,
  useCreateShippingMethod,
  useUpdateShippingMethod,
  useDeleteShippingMethod,
  usePaymentMethods,
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
} from '@/features/settings-management';
import type {
  ShippingMethod as ShippingMethodType,
  PaymentMethod as PaymentMethodType,
} from '@/features/settings-management';
import { toast } from 'sonner';

// ============================================================
// General Settings Tab
// ============================================================

const generalSchema = z.object({
  storeName: z.string().min(1, 'Название обязательно'),
  email: z.string().email('Некорректный email'),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string(),
  language: z.string(),
});

type GeneralFormData = z.infer<typeof generalSchema>;

const currencyOptions = [
  { value: 'RUB', label: 'Рубль (₽)' },
  { value: 'USD', label: 'Доллар ($)' },
  { value: 'EUR', label: 'Евро (€)' },
];

const languageOptions = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
];

function GeneralTab() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const resolver: Resolver<GeneralFormData> = zodResolver(
    generalSchema,
  ) as Resolver<GeneralFormData>;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = useForm<GeneralFormData>({
    resolver,
    defaultValues: {
      storeName: '',
      email: '',
      phone: '',
      address: '',
      currency: 'RUB',
      language: 'ru',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        storeName: settings.storeName,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        currency: settings.currency,
        language: settings.language,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: GeneralFormData) => {
    updateSettings.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Общие настройки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xl space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Общие настройки</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
          <Input
            label="Название магазина"
            {...register('storeName')}
            error={errors.storeName?.message}
          />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Телефон" {...register('phone')} />
          <Textarea label="Адрес" {...register('address')} rows={2} />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <Select
                  label="Валюта"
                  options={currencyOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="language"
              render={({ field }) => (
                <Select
                  label="Язык"
                  options={languageOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={!isDirty} loading={updateSettings.isPending}>
              <Save className="mr-1.5 h-4 w-4" />
              Сохранить
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Shipping Tab
// ============================================================

const shippingSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  price: z.coerce.number().min(0, 'Цена >= 0'),
  description: z.string().optional(),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

function ShippingTab() {
  const { data: methods = [], isLoading } = useShippingMethods();
  const createMethod = useCreateShippingMethod();
  const updateMethod = useUpdateShippingMethod();
  const deleteMethod = useDeleteShippingMethod();

  const [editMethod, setEditMethod] = useState<ShippingMethodType | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resolver: Resolver<ShippingFormData> = zodResolver(
    shippingSchema,
  ) as Resolver<ShippingFormData>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver,
  });

  const openForm = useCallback(
    (method?: ShippingMethodType) => {
      setEditMethod(method ?? null);
      reset(
        method
          ? { name: method.name, price: method.price, description: method.description }
          : { name: '', price: 0, description: '' },
      );
      setFormOpen(true);
    },
    [reset],
  );

  const onSubmit = (data: ShippingFormData) => {
    if (editMethod) {
      updateMethod.mutate({ id: editMethod._id, data }, { onSuccess: () => setFormOpen(false) });
    } else {
      createMethod.mutate(data, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const toggleActive = (method: ShippingMethodType) => {
    updateMethod.mutate({ id: method._id, data: { isActive: !method.isActive } });
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteMethod.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Способы доставки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Способы доставки</CardTitle>
          <Button size="sm" onClick={() => openForm()}>
            <Plus className="mr-1.5 h-4 w-4" />
            Добавить
          </Button>
        </CardHeader>
        <CardContent>
          {methods.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Нет способов доставки</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Название
                    </th>
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Цена
                    </th>
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Описание
                    </th>
                    <th className="pb-3 text-center font-medium text-gray-500 dark:text-gray-400">
                      Активен
                    </th>
                    <th className="pb-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map((m) => (
                    <tr
                      key={m._id}
                      className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                    >
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{m.name}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-300">
                        {m.price === 0 ? 'Бесплатно' : `${m.price} ₽`}
                      </td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">{m.description}</td>
                      <td className="py-3 text-center">
                        <Switch checked={m.isActive} onCheckedChange={() => toggleActive(m)} />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openForm(m)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(m._id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editMethod ? 'Редактировать доставку' : 'Новый способ доставки'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Название" {...register('name')} error={errors.name?.message} />
          <Input
            label="Цена (₽)"
            type="number"
            {...register('price')}
            error={errors.price?.message}
          />
          <Textarea label="Описание" {...register('description')} rows={2} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" loading={createMethod.isPending || updateMethod.isPending}>
              {editMethod ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Удалить способ доставки?"
        description="Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
        loading={deleteMethod.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

// ============================================================
// Payment Tab
// ============================================================

const paymentSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

function PaymentTab() {
  const { data: methods = [], isLoading } = usePaymentMethods();
  const createMethod = useCreatePaymentMethod();
  const updateMethod = useUpdatePaymentMethod();
  const deleteMethod = useDeletePaymentMethod();

  const [editMethod, setEditMethod] = useState<PaymentMethodType | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resolver: Resolver<PaymentFormData> = zodResolver(
    paymentSchema,
  ) as Resolver<PaymentFormData>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver,
  });

  const openForm = useCallback(
    (method?: PaymentMethodType) => {
      setEditMethod(method ?? null);
      reset(
        method
          ? { name: method.name, description: method.description }
          : { name: '', description: '' },
      );
      setFormOpen(true);
    },
    [reset],
  );

  const onSubmit = (data: PaymentFormData) => {
    if (editMethod) {
      updateMethod.mutate({ id: editMethod._id, data }, { onSuccess: () => setFormOpen(false) });
    } else {
      createMethod.mutate(data, {
        onSuccess: () => setFormOpen(false),
      });
    }
  };

  const toggleActive = (method: PaymentMethodType) => {
    updateMethod.mutate({ id: method._id, data: { isActive: !method.isActive } });
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteMethod.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Способы оплаты</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Способы оплаты</CardTitle>
          <Button size="sm" onClick={() => openForm()}>
            <Plus className="mr-1.5 h-4 w-4" />
            Добавить
          </Button>
        </CardHeader>
        <CardContent>
          {methods.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Нет способов оплаты</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Название
                    </th>
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Описание
                    </th>
                    <th className="pb-3 text-center font-medium text-gray-500 dark:text-gray-400">
                      Активен
                    </th>
                    <th className="pb-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map((m) => (
                    <tr
                      key={m._id}
                      className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                    >
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{m.name}</td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">{m.description}</td>
                      <td className="py-3 text-center">
                        <Switch checked={m.isActive} onCheckedChange={() => toggleActive(m)} />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openForm(m)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(m._id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editMethod ? 'Редактировать способ оплаты' : 'Новый способ оплаты'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Название" {...register('name')} error={errors.name?.message} />
          <Textarea label="Описание" {...register('description')} rows={2} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" loading={createMethod.isPending || updateMethod.isPending}>
              {editMethod ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Удалить способ оплаты?"
        description="Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
        loading={deleteMethod.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

// ============================================================
// Email Notifications Tab
// ============================================================

interface NotificationItem {
  key: string;
  name: string;
  description: string;
}

const notificationItems: NotificationItem[] = [
  { key: 'newOrder', name: 'Новый заказ', description: 'Уведомление при создании нового заказа' },
  {
    key: 'statusChange',
    name: 'Смена статуса заказа',
    description: 'Уведомление при изменении статуса заказа',
  },
  {
    key: 'paymentReceived',
    name: 'Оплата получена',
    description: 'Уведомление при успешной оплате',
  },
  { key: 'newReview', name: 'Новый отзыв', description: 'Уведомление при новом отзыве' },
  {
    key: 'customerRegistration',
    name: 'Регистрация клиента',
    description: 'Уведомление при регистрации нового клиента',
  },
  {
    key: 'lowStock',
    name: 'Низкий остаток товара',
    description: 'Уведомление когда товар заканчивается',
  },
  {
    key: 'refundRequest',
    name: 'Возврат заказа',
    description: 'Уведомление при запросе на возврат',
  },
];

function EmailTab() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [notifyEmail, setNotifyEmail] = useState('');

  useEffect(() => {
    if (settings) {
      setNotifyEmail(settings.notificationEmail ?? '');
    }
  }, [settings]);

  const defaultNotifications = {
    newOrder: false,
    statusChange: false,
    paymentReceived: false,
    newReview: false,
    customerRegistration: false,
    lowStock: false,
    refundRequest: false,
  };

  const notifications = settings?.notifications ?? defaultNotifications;

  const toggleNotification = (key: string) => {
    if (!settings) return;
    updateSettings.mutate({
      notifications: {
        ...defaultNotifications,
        ...settings.notifications,
        [key]: !notifications[key as keyof typeof notifications],
      },
    });
  };

  const handleSaveEmail = () => {
    updateSettings.mutate({ notificationEmail: notifyEmail });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email для уведомлений</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-96 rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Типы уведомлений</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email для уведомлений</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex max-w-md items-end gap-3">
            <div className="flex-1">
              <Input
                label="Email"
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <Button
              onClick={handleSaveEmail}
              loading={updateSettings.isPending}
              disabled={notifyEmail === settings?.notificationEmail}
            >
              <Save className="mr-1.5 h-4 w-4" />
              Сохранить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Типы уведомлений</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notificationItems?.map((n) => (
              <div key={n.key} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{n.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{n.description}</p>
                </div>
                <Switch
                  checked={Boolean(notifications[n.key as keyof typeof notifications] ?? false)}
                  onCheckedChange={() => toggleNotification(n.key)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Admins Tab
// ============================================================

const adminFormSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  email: z.string().email('Некорректный email'),
  role: z.enum(['admin', 'manager']),
  password: z.string().min(8, 'Минимум 8 символов'),
});

type AdminFormData = z.infer<typeof adminFormSchema>;

const roleOptions = [
  { value: 'admin', label: 'Администратор' },
  { value: 'manager', label: 'Менеджер' },
];

const roleBadgeVariant: Record<string, 'default' | 'secondary'> = {
  admin: 'default',
  manager: 'secondary',
};

const roleLabels: Record<string, string> = {
  admin: 'Администратор',
  manager: 'Менеджер',
};

function AdminsTab() {
  const { data, isLoading, refetch } = useCustomers({ page: 1, limit: 100, role: 'admin' });
  const { data: managersData, refetch: refetchManagers } = useCustomers({
    page: 1,
    limit: 100,
    role: 'manager',
  });

  const admins = useMemo(() => {
    const adminList = data?.data ?? [];
    const managerList = managersData?.data ?? [];
    return [...adminList, ...managerList];
  }, [data, managersData]);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const resolver: Resolver<AdminFormData> = zodResolver(adminFormSchema) as Resolver<AdminFormData>;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AdminFormData>({
    resolver,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'manager',
      password: '',
    },
  });

  const handleOpen = useCallback(() => {
    reset({ firstName: '', lastName: '', email: '', role: 'manager', password: '' });
    setFormOpen(true);
  }, [reset]);

  const onSubmit = useCallback(
    async (formData: AdminFormData) => {
      setIsSubmitting(true);
      try {
        await api.post('/users', {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        });

        toast.success('Администратор добавлен');
        setFormOpen(false);
        refetch();
        refetchManagers();
      } catch {
        toast.error('Ошибка при создании администратора');
      } finally {
        setIsSubmitting(false);
      }
    },
    [refetch, refetchManagers],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/users/${deleteId}`);
      toast.success('Администратор удалён');
      setDeleteId(null);
      refetch();
      refetchManagers();
    } catch {
      toast.error('Ошибка при удалении');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteId, refetch, refetchManagers]);

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Администраторы</CardTitle>
          <Button size="sm" onClick={handleOpen}>
            <Plus className="mr-1.5 h-4 w-4" />
            Добавить
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Имя
                    </th>
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </th>
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Роль
                    </th>
                    <th className="pb-3 text-left font-medium text-gray-500 dark:text-gray-400">
                      Дата регистрации
                    </th>
                    <th className="pb-3 text-right font-medium text-gray-500 dark:text-gray-400">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr
                      key={admin._id}
                      className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                    >
                      <td className="py-3 font-medium text-gray-900 dark:text-white">
                        {admin.firstName} {admin.lastName}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-300">{admin.email}</td>
                      <td className="py-3">
                        <Badge variant={roleBadgeVariant[admin.role] ?? 'secondary'}>
                          {roleLabels[admin.role] ?? admin.role}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => setDeleteId(admin._id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                        Нет администраторов
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Admin Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Новый администратор">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Имя" {...register('firstName')} error={errors.firstName?.message} />
            <Input label="Фамилия" {...register('lastName')} error={errors.lastName?.message} />
          </div>
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select
                label="Роль"
                options={roleOptions}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Input
            label="Пароль"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="Минимум 8 символов"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Создать
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Удалить администратора?"
        description="Пользователь потеряет доступ к админ-панели."
        confirmText="Удалить"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

// ============================================================
// Settings Page
// ============================================================

const tabItems = [
  { value: 'general', label: 'Общие', icon: Store },
  { value: 'shipping', label: 'Доставка', icon: Truck },
  { value: 'payment', label: 'Оплата', icon: CreditCard },
  { value: 'email', label: 'Уведомления', icon: Bell },
  { value: 'admins', label: 'Администраторы', icon: Users },
];

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Настройки</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Управление настройками магазина
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          {tabItems.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-1.5">
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general">
          <GeneralTab />
        </TabsContent>

        <TabsContent value="shipping">
          <ShippingTab />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentTab />
        </TabsContent>

        <TabsContent value="email">
          <EmailTab />
        </TabsContent>

        <TabsContent value="admins">
          <AdminsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
