import { useEffect, useState } from 'react';
import { PAGE_SIZE } from '../lib/pagination';

type ClientPagedList<T> = {
  items: T[];
  totalCount: number;
  totalPages: number;
  page: number;
  setPage: (page: number) => void;
};

export function useClientPagedList<T>(items: T[], filter: (item: T) => boolean, filterKey: string): ClientPagedList<T> {
  const [page, setPageState] = useState(1);
  const filteredItems = items.filter(filter);
  const totalPages = filteredItems.length === 0 ? 0 : Math.ceil(filteredItems.length / PAGE_SIZE);

  useEffect(() => {
    setPageState(1);
  }, [filterKey]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPageState(totalPages);
    }
  }, [page, totalPages]);

  return {
    items: filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    totalCount: filteredItems.length,
    totalPages,
    page,
    setPage: (nextPage) => setPageState(Math.max(nextPage, 1)),
  };
}
