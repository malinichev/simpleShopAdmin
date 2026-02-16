import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  Search,
  ShoppingCart,
  Package,
  MessageSquare,
} from 'lucide-react';
import { useTheme } from '@/app/providers';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/shared/config';
import { Breadcrumbs } from './Breadcrumbs';

const mockNotifications = [
  {
    id: '1',
    icon: ShoppingCart,
    title: 'Новый заказ #1042',
    description: 'Клиент оформил заказ на 12 500 руб.',
    time: '5 мин назад',
    read: false,
  },
  {
    id: '2',
    icon: Package,
    title: 'Мало товара на складе',
    description: 'Леггинсы Sport Pro — осталось 3 шт.',
    time: '15 мин назад',
    read: false,
  },
  {
    id: '3',
    icon: MessageSquare,
    title: 'Новый отзыв',
    description: 'Отзыв на "Топ для йоги" ожидает модерации',
    time: '1 час назад',
    read: false,
  },
  {
    id: '4',
    icon: ShoppingCart,
    title: 'Заказ #1041 оплачен',
    description: 'Получена оплата 8 200 руб.',
    time: '2 часа назад',
    read: true,
  },
  {
    id: '5',
    icon: Package,
    title: 'Мало товара на складе',
    description: 'Кроссовки RunFlex — осталось 2 шт.',
    time: '3 часа назад',
    read: true,
  },
];

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-900">
      {/* Left: Breadcrumbs */}
      <Breadcrumbs />

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search shortcut hint */}
        <button
          onClick={() => {
            document.dispatchEvent(
              new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
            );
          }}
          className="hidden items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-600 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:text-gray-300 lg:flex"
          title="Поиск (Ctrl+K)"
        >
          <Search className="h-4 w-4" />
          <span>Поиск...</span>
          <kbd className="ml-2 rounded border border-gray-200 bg-gray-100 px-1 py-0.5 text-[10px] dark:border-gray-600 dark:bg-gray-700">
            Ctrl+K
          </kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            title="Уведомления"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Уведомления
                </p>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {unreadCount} новых
                  </span>
                )}
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      !notif.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      !notif.read
                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      <notif.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!notif.read ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notif.title}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {notif.description}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                        {notif.time}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 px-4 py-2 dark:border-gray-700">
                <button className="w-full text-center text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                  Показать все уведомления
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              {user?.firstName?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user ? `${user.firstName} ${user.lastName}` : 'Admin'}
                </p>
                <p className="text-xs text-gray-500">{user?.email ?? ''}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate(ROUTES.SETTINGS);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <User className="h-4 w-4" />
                Профиль
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-gray-700"
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
