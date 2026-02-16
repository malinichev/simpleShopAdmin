import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  Search,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Tag,
  BarChart3,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/config';

interface CommandItem {
  id: string;
  label: string;
  section: string;
  icon: React.ElementType;
  path: string;
  keywords?: string[];
}

const commands: CommandItem[] = [
  { id: 'dashboard', label: 'Дашборд', section: 'Навигация', icon: LayoutDashboard, path: ROUTES.HOME, keywords: ['главная', 'home'] },
  { id: 'products', label: 'Товары', section: 'Навигация', icon: Package, path: ROUTES.PRODUCTS, keywords: ['products'] },
  { id: 'product-new', label: 'Создать товар', section: 'Действия', icon: Package, path: ROUTES.PRODUCT_NEW, keywords: ['new product', 'добавить'] },
  { id: 'categories', label: 'Категории', section: 'Навигация', icon: FolderTree, path: ROUTES.CATEGORIES, keywords: ['categories'] },
  { id: 'orders', label: 'Заказы', section: 'Навигация', icon: ShoppingCart, path: ROUTES.ORDERS, keywords: ['orders'] },
  { id: 'customers', label: 'Клиенты', section: 'Навигация', icon: Users, path: ROUTES.CUSTOMERS, keywords: ['clients'] },
  { id: 'promotions', label: 'Промоакции', section: 'Навигация', icon: Tag, path: ROUTES.PROMOTIONS, keywords: ['promos', 'промокоды'] },
  { id: 'analytics', label: 'Аналитика', section: 'Навигация', icon: BarChart3, path: ROUTES.ANALYTICS, keywords: ['statistics', 'статистика'] },
  { id: 'settings', label: 'Настройки', section: 'Навигация', icon: Settings, path: ROUTES.SETTINGS, keywords: ['settings'] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = query.trim()
    ? commands.filter((cmd) => {
        const q = query.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.keywords?.some((k) => k.includes(q))
        );
      })
    : commands;

  const sections = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.section] ??= []).push(item);
    return acc;
  }, {});

  const handleSelect = useCallback(
    (item: CommandItem) => {
      setOpen(false);
      setQuery('');
      navigate(item.path);
    },
    [navigate],
  );

  // Keyboard navigation
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault();
      handleSelect(filtered[activeIndex]);
    }
  }

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery('');
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <DialogPrimitive.Title className="sr-only">
            Командная палитра
          </DialogPrimitive.Title>

          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-gray-200 px-4 dark:border-gray-700">
            <Search className="h-5 w-5 shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Поиск по разделам..."
              className="h-12 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
            />
            <kbd className="hidden shrink-0 rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 sm:inline dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[300px] overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-gray-500">
                Ничего не найдено
              </p>
            ) : (
              Object.entries(sections).map(([section, items]) => (
                <div key={section}>
                  <p className="px-3 py-1.5 text-xs font-medium text-gray-400">
                    {section}
                  </p>
                  {items.map((item) => {
                    const idx = filtered.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        data-index={idx}
                        onClick={() => handleSelect(item)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          idx === activeIndex
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center gap-4 border-t border-gray-200 px-4 py-2 text-xs text-gray-400 dark:border-gray-700">
            <span><kbd className="rounded border border-gray-300 px-1 dark:border-gray-600">&uarr;</kbd> <kbd className="rounded border border-gray-300 px-1 dark:border-gray-600">&darr;</kbd> навигация</span>
            <span><kbd className="rounded border border-gray-300 px-1 dark:border-gray-600">Enter</kbd> открыть</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
