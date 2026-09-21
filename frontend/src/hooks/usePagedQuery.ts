import { useEffect, useRef, useState } from 'react';
import type { PagedResult } from '../types/paged';

type PageLoader<T, F> = (filters: F, page: number, pageSize: number) => Promise<PagedResult<T>>;

type PagedQueryResult<T> = {
  items: T[];
  totalCount: number;
  totalPages: number;
  page: number;
  setPage: (page: number) => void;
  isLoading: boolean;
  error: unknown;
  reload: () => void;
};

export function usePagedQuery<T, F>(filters: F, pageSize: number, load: PageLoader<T, F>): PagedQueryResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPageState] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const requestId = useRef(0);
  const loadRef = useRef(load);
  const filtersRef = useRef(filters);
  const filterKey = JSON.stringify(filters);
  const previousFilterKey = useRef(filterKey);

  useEffect(() => {
    loadRef.current = load;
    filtersRef.current = filters;
  }, [filterKey, load]);

  useEffect(() => {
    if (previousFilterKey.current !== filterKey) {
      previousFilterKey.current = filterKey;
      setPageState(1);
    }
  }, [filterKey]);

  useEffect(() => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setError(null);

    loadRef.current(filtersRef.current, page, pageSize)
      .then((result) => {
        if (currentRequestId !== requestId.current) return;

        setItems(result.items);
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
        if (result.totalPages > 0 && page > result.totalPages) {
          setPageState(result.totalPages);
        }
      })
      .catch((requestError: unknown) => {
        if (currentRequestId === requestId.current) setError(requestError);
      })
      .finally(() => {
        if (currentRequestId === requestId.current) setIsLoading(false);
      });
  }, [filterKey, page, pageSize, reloadToken]);

  return {
    items,
    totalCount,
    totalPages,
    page,
    setPage: (nextPage) => setPageState(Math.max(nextPage, 1)),
    isLoading,
    error,
    reload: () => setReloadToken((token) => token + 1),
  };
}
