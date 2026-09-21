import { useState } from 'react';
import { apiClient } from '../api/client';
import { getAllTyres } from '../api/tyres';
import FilterBar from '../components/FilterBar';
import FilterField from '../components/FilterField';
import Pagination from '../components/Pagination';
import { usePagedQuery } from '../hooks/usePagedQuery';
import { formatDate } from '../lib/format';
import { getErrorMessage } from '../lib/http';
import { PAGE_SIZE } from '../lib/pagination';
import type { TyreEntry } from '../types/tyre';

export default function ProductionHistoryPage() {
  const [code, setCode] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [shift, setShift] = useState('');
  const [machineNumber, setMachineNumber] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const query = usePagedQuery(
    {
      code: code || undefined,
      operatorId: operatorId ? Number(operatorId) : undefined,
      shift: shift ? Number(shift) : undefined,
      machineNumber: machineNumber ? Number(machineNumber) : undefined,
      isActive: status === '' ? undefined : status === 'active',
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    PAGE_SIZE,
    getAllTyres,
  );
  const loadError = query.error ? getErrorMessage(query.error, 'Could not load production history.') : '';

  const handleDelete = async (entry: TyreEntry) => {
    if (!entry.isActive || !window.confirm(`Delete production entry ${entry.code}?`)) {
      return;
    }

    setDeletingId(entry.id);
    setDeleteError('');

    try {
      await apiClient.delete(`/api/Tyre/${entry.id}`);
      query.reload();
    } catch (error: unknown) {
      setDeleteError(getErrorMessage(error, 'Could not delete the production entry.'));
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setCode('');
    setOperatorId('');
    setShift('');
    setMachineNumber('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <section className="border-t-4 border-[#f5c400] bg-white p-5 shadow-[0_12px_30px_rgba(24,59,112,0.08)] sm:p-8" aria-label="Production history page">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e4002b]">Quality supervisor</p>
        <h1 className="mt-3 text-3xl font-black text-[#183b70]">Production History</h1>
        <p className="mt-2 max-w-xl text-base text-slate-600">Review all production entries and remove records that are no longer active.</p>
      </div>

      <FilterBar onClear={clearFilters}>
        <FilterField label="Code">
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Any code" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" />
        </FilterField>
        <FilterField label="Operator ID">
          <input value={operatorId} onChange={(event) => setOperatorId(event.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Any operator" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" />
        </FilterField>
        <FilterField label="Shift">
          <select value={shift} onChange={(event) => setShift(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]">
            <option value="">All shifts</option>
            <option value="1">Morning</option>
            <option value="2">Afternoon</option>
            <option value="3">Night</option>
          </select>
        </FilterField>
        <FilterField label="Machine number">
          <input value={machineNumber} onChange={(event) => setMachineNumber(event.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Any machine" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" />
        </FilterField>
        <FilterField label="Status">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FilterField>
        <FilterField label="From">
          <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]" />
        </FilterField>
        <FilterField label="To">
          <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]" />
        </FilterField>
      </FilterBar>

      <div className="mt-6 overflow-hidden border border-slate-200">
        {query.isLoading && <p className="p-8 text-center text-sm text-slate-500">Loading production history...</p>}
        {!query.isLoading && loadError && (
          <div className="p-8 text-center" role="alert">
            <p className="font-semibold text-[#e4002b]">{loadError}</p>
            <p className="mt-2 text-sm text-slate-500">Refresh the page and try again.</p>
          </div>
        )}
        {!query.isLoading && !loadError && query.items.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-lg font-bold text-[#183b70]">{code || operatorId || shift || machineNumber || status || dateFrom || dateTo ? 'No production entries match these filters' : 'No production entries yet'}</p>
            <p className="mt-2 text-sm text-slate-500">{code || operatorId || shift || machineNumber || status || dateFrom || dateTo ? 'Clear the filters to see all production records.' : 'Production records will appear here once they are created.'}</p>
          </div>
        )}
        {!query.isLoading && !loadError && query.items.length > 0 && (
          <div className="overflow-x-auto">
            {deleteError && <p className="border-b border-red-100 bg-red-50 p-4 text-sm font-semibold text-[#e4002b]" role="alert">{deleteError}</p>}
            <table className="min-w-270 w-full text-left text-sm">
              <thead className="bg-[#183b70] text-xs uppercase tracking-wider text-white">
                <tr>
                  <th className="px-4 py-4 font-bold">Code</th>
                  <th className="px-4 py-4 font-bold">Quantity Produced</th>
                  <th className="px-4 py-4 font-bold">Operator Id</th>
                  <th className="px-4 py-4 font-bold">Production Date</th>
                  <th className="px-4 py-4 font-bold">Production Shift</th>
                  <th className="px-4 py-4 font-bold">Machine Number</th>
                  <th className="px-4 py-4 font-bold">Status</th>
                  <th className="px-4 py-4 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {query.items.map((entry) => (
                  <tr key={entry.id} className="transition hover:bg-[#f5f7fa]">
                    <td className="px-4 py-4 font-semibold text-[#183b70]">{entry.code}</td>
                    <td className="px-4 py-4 text-slate-600">{entry.quantityProduced.toLocaleString()}</td>
                    <td className="px-4 py-4 text-slate-600">{entry.operatorId}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(entry.productionDate)}</td>
                    <td className="px-4 py-4 text-slate-600">{entry.productionShift}</td>
                    <td className="px-4 py-4 text-slate-600">{entry.machineNumber}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-bold ${entry.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {entry.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {entry.isActive && (
                        <button
                          type="button"
                          onClick={() => handleDelete(entry)}
                          disabled={deletingId === entry.id}
                          className="bg-[#e4002b] px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#b90024] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === entry.id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!query.isLoading && !loadError && <Pagination page={query.page} totalPages={query.totalPages} totalCount={query.totalCount} pageSize={PAGE_SIZE} onPageChange={query.setPage} />}
    </section>
  );
}