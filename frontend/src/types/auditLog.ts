export type AuditAction = 0 | 1 | 2 | 3 | 4;

export type AuditLog = {
  id: number;
  entityName: string;
  entityId: string;
  action: AuditAction;
  userId: number | null;
  username: string;
  timestamp: string;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
};

import type { PagedResult } from './paged';

export type AuditLogPage = PagedResult<AuditLog>;

export type AuditLogFilter = {
  entityName?: string;
  userId?: number;
  action?: AuditAction;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  pageSize: number;
};