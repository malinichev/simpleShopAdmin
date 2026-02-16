import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setPagination: (page: number, pageSize: number) => void;
  offset: number;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const setPage = useCallback((p: number) => setPageState(p), []);

  const setPageSize = useCallback((s: number) => {
    setPageSizeState(s);
    setPageState(1);
  }, []);

  const setPagination = useCallback((p: number, s: number) => {
    setPageState(p);
    setPageSizeState(s);
  }, []);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    setPagination,
    offset: (page - 1) * pageSize,
  };
}
