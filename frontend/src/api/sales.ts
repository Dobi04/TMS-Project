import { apiClient } from './client';
import type { PagedResult } from '../types/paged';
import type { Sale, SaleFilter } from '../types/sale';

function toParams(filter: SaleFilter, page: number, pageSize: number) {
  return {
    tyreCode: filter.tyreCode || undefined,
    destinationMarket: filter.destinationMarket || undefined,
    purchasingCompany: filter.purchasingCompany || undefined,
    registeredById: filter.registeredById || undefined,
    dateFrom: filter.dateFrom || undefined,
    dateTo: filter.dateTo || undefined,
    page,
    pageSize,
  };
}

export async function getMySales(filter: SaleFilter, page: number, pageSize: number) {
  const response = await apiClient.get<PagedResult<Sale>>('/api/Sales/mine', {
    params: toParams(filter, page, pageSize),
  });

  return response.data;
}

export async function getAllSales(filter: SaleFilter, page: number, pageSize: number) {
  const response = await apiClient.get<PagedResult<Sale>>('/api/Sales', {
    params: toParams(filter, page, pageSize),
  });

  return response.data;
}
