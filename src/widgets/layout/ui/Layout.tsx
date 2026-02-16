import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '@/widgets/command-palette';
import styles from './Layout.module.scss';
import { cn } from '@/shared/lib/utils';

const TABLET_BREAKPOINT = 1024;

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(
    () => window.innerWidth <= TABLET_BREAKPOINT,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent) => setIsTablet(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isTablet;
}

export function Layout() {
  const isTablet = useIsTablet();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(isTablet);
  }, [isTablet]);

  const handleToggle = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />
      <div
        className={cn(
          styles.content,
          collapsed ? styles.contentCollapsed : styles.contentExpanded,
        )}
      >
        <Header />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
