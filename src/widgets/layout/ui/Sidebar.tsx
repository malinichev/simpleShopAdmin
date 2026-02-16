import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  MessageSquare,
  Tag,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/config';
import { useAuth } from '@/features/auth';

const navItems = [
  { path: ROUTES.HOME, label: 'Дашборд', icon: LayoutDashboard },
  { path: ROUTES.PRODUCTS, label: 'Товары', icon: Package },
  { path: ROUTES.CATEGORIES, label: 'Категории', icon: FolderTree },
  { path: ROUTES.ORDERS, label: 'Заказы', icon: ShoppingCart },
  { path: ROUTES.CUSTOMERS, label: 'Клиенты', icon: Users },
  { path: ROUTES.REVIEWS, label: 'Отзывы', icon: MessageSquare },
  { path: ROUTES.PROMOTIONS, label: 'Промоакции', icon: Tag },
  { path: ROUTES.ANALYTICS, label: 'Аналитика', icon: BarChart3 },
  { path: ROUTES.SETTINGS, label: 'Настройки', icon: Settings },
] as const;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-200 dark:border-gray-700 dark:bg-gray-900',
        collapsed ? 'w-[72px] items-center' : 'w-[260px]',
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-4 dark:border-gray-700">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white font-bold text-sm">
            SS
          </div>
          {!collapsed && (
            <span className="whitespace-nowrap text-lg font-semibold text-gray-900 dark:text-white">
              SportShop
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === ROUTES.HOME}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
                    collapsed && 'justify-center px-2',
                  )
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="mx-3 mb-2 flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      >
        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>

      {/* User section */}
      <div className="border-t border-gray-200 p-3 dark:border-gray-700">
        <div
          className={cn(
            'flex items-center gap-3',
            collapsed && 'flex-col',
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
            {user?.firstName?.charAt(0)?.toUpperCase() ?? 'A'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {user ? `${user.firstName} ${user.lastName}` : 'Admin'}
              </p>
              <p className="truncate text-xs text-gray-500">{user?.email ?? ''}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
            title="Выйти"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
