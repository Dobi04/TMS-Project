import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

type TyreEntry = {
  id: number;
  code: string;
  quantityProduced: number;
  operatorId: number;
  productionDate: string;
  productionShift: string;
  machineNumber: number;
  isActive: boolean;
};

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

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not available'
    : new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export default function ProductionHistoryPage() {
  const [entries, setEntries] = useState<TyreEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .get<TyreEntry[]>('/api/Tyre')
      .then((response) => {
        if (isMounted) {
          setEntries(response.data);
          setLoadError('');
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setLoadError(getErrorMessage(error, 'Could not load production history.'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (entry: TyreEntry) => {
    if (!entry.isActive || !window.confirm(`Delete production entry ${entry.code}?`)) {
      return;
    }

    setDeletingId(entry.id);
    setDeleteError('');

    try {
      await apiClient.delete(`/api/Tyre/${entry.id}`);
      setEntries((current) => current.map((currentEntry) => (
        currentEntry.id === entry.id ? { ...currentEntry, isActive: false } : currentEntry
      )));
    } catch (error: unknown) {
      setDeleteError(getErrorMessage(error, 'Could not delete the production entry.'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="border-t-4 border-[#f5c400] bg-white p-5 shadow-[0_12px_30px_rgba(24,59,112,0.08)] sm:p-8" aria-label="Production history page">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e4002b]">Quality supervisor</p>
        <h1 className="mt-3 text-3xl font-black text-[#183b70]">Production History</h1>
        <p className="mt-2 max-w-xl text-base text-slate-600">Review all production entries and remove records that are no longer active.</p>
      </div>

      <div className="mt-6 overflow-hidden border border-slate-200">
        {isLoading && <p className="p-8 text-center text-sm text-slate-500">Loading production history...</p>}
        {!isLoading && loadError && (
          <div className="p-8 text-center" role="alert">
            <p className="font-semibold text-[#e4002b]">{loadError}</p>
            <p className="mt-2 text-sm text-slate-500">Refresh the page and try again.</p>
          </div>
        )}
        {!isLoading && !loadError && entries.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-lg font-bold text-[#183b70]">No production entries yet</p>
            <p className="mt-2 text-sm text-slate-500">Production records will appear here once they are created.</p>
          </div>
        )}
        {!isLoading && !loadError && entries.length > 0 && (
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
                {entries.map((entry) => (
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
    </section>
  );
}