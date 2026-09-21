import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { getAuditLogs } from '../api/auditLog';
import type { AuditAction, AuditLog, AuditLogFilter } from '../types/auditLog';

const pageSize = 25;

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = error.response;
    if (response && typeof response === 'object' && 'data' in response) {
      const data = response.data;
      if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
        return data.message;
      }
    }
  }

  return fallback;
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not available'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function actionLabel(action: AuditAction) {
  return ['Create', 'Update', 'Delete', 'Login', 'Login failed'][action] ?? 'Unknown';
}

function actionClasses(action: AuditAction) {
  if (action === 0) return 'bg-emerald-100 text-emerald-700';
  if (action === 1) return 'bg-amber-100 text-amber-800';
  if (action === 2) return 'bg-red-100 text-[#b90024]';
  return 'bg-slate-100 text-slate-700';
}

function formatSnapshot(value: string | null) {
  if (!value) return 'No snapshot recorded.';

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#183b70]">
      {label}
      {children}
    </label>
  );
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [entityName, setEntityName] = useState('');
  const [action, setAction] = useState<AuditAction | ''>('');
  const [userId, setUserId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    let isMounted = true;
    const filter: AuditLogFilter = {
      entityName: entityName || undefined,
      action: action === '' ? undefined : action,
      userId: userId ? Number(userId) : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo ? `${dateTo}T23:59:59` : undefined,
      page: currentPage,
      pageSize,
    };

    setIsLoading(true);
    getAuditLogs(filter)
      .then((result) => {
        if (isMounted) {
          setLogs(result.items);
          setTotalCount(result.totalCount);
          setTotalPages(result.totalPages);
          setLoadError('');
        }
      })
      .catch((error: unknown) => {
        if (isMounted) setLoadError(getErrorMessage(error, 'Could not load the audit log.'));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [action, currentPage, dateFrom, dateTo, entityName, userId]);

  const resetPage = () => setCurrentPage(1);

  const handleUserIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUserId(event.target.value.replace(/\D/g, ''));
    resetPage();
  };

  const clearFilters = () => {
    setEntityName('');
    setAction('');
    setUserId('');
    setDateFrom('');
    setDateTo('');
    resetPage();
  };

  return (
    <section className="border-t-4 border-[#f5c400] bg-white p-5 shadow-[0_12px_30px_rgba(24,59,112,0.08)] sm:p-8" aria-label="Audit log page">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e4002b]">Quality supervisor</p>
        <h1 className="mt-3 text-3xl font-black text-[#183b70]">Audit Log</h1>
        <p className="mt-2 max-w-xl text-base text-slate-600">Review system changes and user activity.</p>
      </div>

      <div className="mt-6 grid gap-4 border border-slate-200 bg-[#f5f7fa] p-4 sm:grid-cols-2 lg:grid-cols-5">
        <FilterField label="Entity">
          <select value={entityName} onChange={(event) => { setEntityName(event.target.value); resetPage(); }} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]">
            <option value="">All entities</option>
            <option value="Tyre">Tyre</option>
            <option value="Sales">Sales</option>
            <option value="User">User</option>
            <option value="Machine">Machine</option>
          </select>
        </FilterField>
        <FilterField label="Action">
          <select value={action} onChange={(event) => { setAction(event.target.value === '' ? '' : Number(event.target.value) as AuditAction); resetPage(); }} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]">
            <option value="">All actions</option>
            <option value="0">Create</option>
            <option value="1">Update</option>
            <option value="2">Delete</option>
            <option value="3">Login</option>
            <option value="4">Login failed</option>
          </select>
        </FilterField>
        <FilterField label="User ID">
          <input value={userId} onChange={handleUserIdChange} inputMode="numeric" placeholder="Any user" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" />
        </FilterField>
        <FilterField label="From">
          <input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); resetPage(); }} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]" />
        </FilterField>
        <FilterField label="To">
          <input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); resetPage(); }} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]" />
        </FilterField>
        <button type="button" onClick={clearFilters} className="justify-self-start border border-[#183b70] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#183b70] transition hover:bg-[#183b70] hover:text-white sm:col-span-2 lg:col-span-5">Clear filters</button>
      </div>

      <div className="mt-6 overflow-hidden border border-slate-200">
        {isLoading && <p className="p-8 text-center text-sm text-slate-500">Loading audit log...</p>}
        {!isLoading && loadError && (
          <div className="p-8 text-center" role="alert">
            <p className="font-semibold text-[#e4002b]">{loadError}</p>
            <p className="mt-2 text-sm text-slate-500">Refresh the page and try again.</p>
          </div>
        )}
        {!isLoading && !loadError && logs.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-lg font-bold text-[#183b70]">No audit entries found</p>
            <p className="mt-2 text-sm text-slate-500">Try changing the filters or return after a system change is recorded.</p>
          </div>
        )}
        {!isLoading && !loadError && logs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-225 w-full text-left text-sm">
              <thead className="bg-[#183b70] text-xs uppercase tracking-wider text-white">
                <tr>
                  <th className="px-4 py-4 font-bold">Timestamp</th>
                  <th className="px-4 py-4 font-bold">Entity</th>
                  <th className="px-4 py-4 font-bold">Entity ID</th>
                  <th className="px-4 py-4 font-bold">Action</th>
                  <th className="px-4 py-4 font-bold">User</th>
                  <th className="px-4 py-4 font-bold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  return (
                    <tr key={log.id} className="align-top transition hover:bg-[#f5f7fa]">
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">{formatTimestamp(log.timestamp)}</td>
                      <td className="px-4 py-4 font-semibold text-[#183b70]">{log.entityName}</td>
                      <td className="px-4 py-4 font-mono text-xs text-slate-600">{log.entityId || 'Pending'}</td>
                      <td className="px-4 py-4"><span className={`inline-flex px-2.5 py-1 text-xs font-bold ${actionClasses(log.action)}`}>{actionLabel(log.action)}</span></td>
                      <td className="px-4 py-4 text-slate-600">{log.username || 'System'}</td>
                      <td className="px-4 py-4">
                        <button type="button" onClick={() => setExpandedId(isExpanded ? null : log.id)} className="border border-[#183b70] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#183b70] transition hover:bg-[#183b70] hover:text-white" aria-expanded={isExpanded}>
                          {isExpanded ? 'Hide values' : 'View values'}
                        </button>
                        {isExpanded && (
                          <div className="mt-3 grid min-w-80 gap-3 lg:grid-cols-2">
                            <Snapshot title="Before" value={log.oldValues} />
                            <Snapshot title="After" value={log.newValues} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && !loadError && totalCount > 0 && (
        <div className="mt-5 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Showing page {currentPage} of {totalPages} · {totalCount.toLocaleString()} total entries</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))} disabled={currentPage <= 1} className="border border-[#183b70] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#183b70] transition hover:bg-[#183b70] hover:text-white disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <button type="button" onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))} disabled={currentPage >= totalPages} className="border border-[#183b70] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#183b70] transition hover:bg-[#183b70] hover:text-white disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </section>
  );
}

function Snapshot({ title, value }: { title: string; value: string | null }) {
  return (
    <div className="min-w-0 border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-[#183b70]">{title}</p>
      <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap wrap-break-word text-xs leading-5 text-slate-600">{formatSnapshot(value)}</pre>
    </div>
  );
}
