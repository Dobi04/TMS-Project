import { apiClient } from './client';
import type { PagedResult } from '../types/paged';
import type { TyreEntry, TyreFilter } from '../types/tyre';

function toParams(filter: TyreFilter, page: number, pageSize: number) {
  return {
    code: filter.code || undefined,
    operatorId: filter.operatorId || undefined,
    shift: filter.shift || undefined,
    machineNumber: filter.machineNumber || undefined,
    isActive: filter.isActive,
    dateFrom: filter.dateFrom || undefined,
    dateTo: filter.dateTo || undefined,
    page,
    pageSize,
  };
}

export async function getMyTyres(filter: TyreFilter, page: number, pageSize: number) {
  const response = await apiClient.get<PagedResult<TyreEntry>>('/api/Tyre/mine', {
    params: toParams(filter, page, pageSize),
  });

  return response.data;
}

export async function getAllTyres(filter: TyreFilter, page: number, pageSize: number) {
  const response = await apiClient.get<PagedResult<TyreEntry>>('/api/Tyre', {
    params: toParams(filter, page, pageSize),
  });

  return response.data;
}
