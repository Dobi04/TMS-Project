import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

type TyreEntry = {
  id: number;
  code: string;
  quantityProduced: number;
  productionDate: string;
  productionShift: string;
  machineNumber: number;
  isActive: boolean;
};

type EntryForm = {
  code: string;
  quantityProduced: string;
  productionShift: string;
  machineNumber: string;
  productionDate: string;
};

const shifts = [
  { value: '1', label: 'Morning' },
  { value: '2', label: 'Afternoon' },
  { value: '3', label: 'Night' },
];

const emptyForm: EntryForm = {
  code: '',
  quantityProduced: '',
  productionShift: '',
  machineNumber: '',
  productionDate: new Date().toISOString().slice(0, 10),
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

export default function MyEntrysPage() {
  const [entries, setEntries] = useState<TyreEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<EntryForm>(emptyForm);
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .get<TyreEntry[]>('/api/Tyre/mine')
      .then((response) => {
        if (isMounted) {
          setEntries(response.data);
          setLoadError('');
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setLoadError(getErrorMessage(error, 'Could not load your production entries.'));
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

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isSubmitting]);

  const openModal = () => {
    setForm({ ...emptyForm, productionDate: new Date().toISOString().slice(0, 10) });
    setValidationError('');
    setSubmitError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setValidationError('');
    setSubmitError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantityProduced = Number(form.quantityProduced);
    const machineNumber = Number(form.machineNumber);

    if (!form.code.trim() || form.code.trim().length > 50) {
      setValidationError('Code is required and must be 50 characters or fewer.');
      return;
    }
    if (!Number.isInteger(quantityProduced) || quantityProduced < 1) {
      setValidationError('Quantity produced must be a whole number greater than zero.');
      return;
    }
    if (!form.productionShift) {
      setValidationError('Select a production shift.');
      return;
    }
    if (!Number.isInteger(machineNumber) || machineNumber < 1) {
      setValidationError('Machine number must be a whole number greater than zero.');
      return;
    }

    setValidationError('');
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const response = await apiClient.post<TyreEntry>('/api/Tyre', {
        code: form.code.trim(),
        quantityProduced,
        productionShift: Number(form.productionShift),
        machineNumber,
        productionDate: form.productionDate || null,
      });

      setEntries((current) => [...current, response.data]);
      setIsModalOpen(false);
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error, 'Could not create the production entry.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="border-t-4 border-[#f5c400] bg-white p-5 shadow-[0_12px_30px_rgba(24,59,112,0.08)] sm:p-8" aria-label="My entries page">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e4002b]">Production operator</p>
          <h1 className="mt-3 text-3xl font-black text-[#183b70]">My Entrys</h1>
          <p className="mt-2 max-w-xl text-base text-slate-600">Track the tyre production entries you have submitted.</p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex shrink-0 items-center justify-center gap-2 bg-[#e4002b] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-red-200 transition hover:bg-[#b90024]"
        >
          <span className="text-lg leading-none" aria-hidden="true">+</span>
          Add Entry
        </button>
      </div>

      <div className="mt-6 overflow-hidden border border-slate-200">
        {isLoading && <p className="p-8 text-center text-sm text-slate-500">Loading your entries...</p>}
        {!isLoading && loadError && (
          <div className="p-8 text-center" role="alert">
            <p className="font-semibold text-[#e4002b]">{loadError}</p>
            <p className="mt-2 text-sm text-slate-500">Refresh the page and try again.</p>
          </div>
        )}
        {!isLoading && !loadError && entries.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-lg font-bold text-[#183b70]">No entries yet</p>
            <p className="mt-2 text-sm text-slate-500">Add your first production entry to see it here.</p>
          </div>
        )}
        {!isLoading && !loadError && entries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-190 w-full text-left text-sm">
              <thead className="bg-[#183b70] text-xs uppercase tracking-wider text-white">
                <tr>
                  <th className="px-4 py-4 font-bold">Code</th>
                  <th className="px-4 py-4 font-bold">Quantity Produced</th>
                  <th className="px-4 py-4 font-bold">Production Date</th>
                  <th className="px-4 py-4 font-bold">Production Shift</th>
                  <th className="px-4 py-4 font-bold">Machine Number</th>
                  <th className="px-4 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="transition hover:bg-[#f5f7fa]">
                    <td className="px-4 py-4 font-semibold text-[#183b70]">{entry.code}</td>
                    <td className="px-4 py-4 text-slate-600">{entry.quantityProduced.toLocaleString()}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(entry.productionDate)}</td>
                    <td className="px-4 py-4 text-slate-600">{entry.productionShift}</td>
                    <td className="px-4 py-4 text-slate-600">{entry.machineNumber}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-bold ${entry.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {entry.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm md:items-center" onClick={closeModal}>
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-[28px] border-t-4 border-[#f5c400] bg-white p-5 shadow-2xl shadow-slate-950/30 md:rounded-sm sm:p-7" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e4002b]">Production operator</p>
                <h2 className="mt-2 text-2xl font-black text-[#183b70]">Add production entry</h2>
                <p className="mt-1 text-sm text-slate-500">Record the tyres produced during your shift.</p>
              </div>
              <button type="button" onClick={closeModal} disabled={isSubmitting} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl text-[#183b70] transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Close modal">
                ×
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#183b70]">Code</span>
                <input name="code" value={form.code} onChange={handleChange} maxLength={50} required className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition focus:border-[#f5c400]" placeholder="Entry code" />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#183b70]">Quantity Produced</span>
                  <input type="number" name="quantityProduced" value={form.quantityProduced} onChange={handleChange} min="1" step="1" required className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition focus:border-[#f5c400]" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#183b70]">Machine Number</span>
                  <input type="number" name="machineNumber" value={form.machineNumber} onChange={handleChange} min="1" step="1" required className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition focus:border-[#f5c400]" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#183b70]">Production Shift</span>
                  <select name="productionShift" value={form.productionShift} onChange={handleChange} required className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition focus:border-[#f5c400]">
                    <option value="">Select shift</option>
                    {shifts.map((shift) => <option key={shift.value} value={shift.value}>{shift.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#183b70]">Production Date</span>
                  <input type="date" name="productionDate" value={form.productionDate} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition focus:border-[#f5c400]" />
                </label>
              </div>

              {(validationError || submitError) && <p className="text-sm font-medium text-[#e4002b]" role="alert">{validationError || submitError}</p>}
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#e4002b] px-4 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-md transition hover:bg-[#b90024] disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Saving entry...' : 'Save entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
