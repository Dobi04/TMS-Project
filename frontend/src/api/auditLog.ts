import { apiClient } from './client';
import type { AuditLog, AuditLogFilter, AuditLogPage } from '../types/auditLog';

export async function getAuditLogs(filter: AuditLogFilter) {
  const response = await apiClient.get<AuditLogPage>('/api/AuditLog', {
    params: {
      ...filter,
      action: filter.action === undefined ? undefined : filter.action,
      userId: filter.userId || undefined,
      dateFrom: filter.dateFrom || undefined,
      dateTo: filter.dateTo || undefined,
      entityName: filter.entityName || undefined,
    },
  });

  return response.data;
}

export async function getEntityHistory(entityName: string, entityId: string) {
  const response = await apiClient.get<AuditLog[]>(
    `/api/AuditLog/entity/${encodeURIComponent(entityName)}/${encodeURIComponent(entityId)}`,
  );

  return response.data;
}