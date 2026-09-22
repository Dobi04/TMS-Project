import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { getMyTyres } from '../api/tyres';
import { getMachines } from '../api/machines';
import FilterBar from '../components/FilterBar';
import FilterField from '../components/FilterField';
import Pagination from '../components/Pagination';
import SearchableSelect from '../components/SearchableSelect';
import { usePagedQuery } from '../hooks/usePagedQuery';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { formatDate } from '../lib/format';
import { getErrorMessage } from '../lib/http';
import { PAGE_SIZE } from '../lib/pagination';
import type { TyreEntry } from '../types/tyre';

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

export default function MyEntrysPage() {
  const [code, setCode] = useState('');
  const [shift, setShift] = useState('');
  const [machineNumber, setMachineNumber] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const debouncedCode = useDebouncedValue(code);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<EntryForm>(emptyForm);
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [machines, setMachines] = useState<{ machineNumber: number; name: string }[]>([]);
  const [machineLoadError, setMachineLoadError] = useState('');
  const query = usePagedQuery(
    {
      code: debouncedCode || undefined,
      shift: shift ? Number(shift) : undefined,
      machineNumber: machineNumber ? Number(machineNumber) : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    PAGE_SIZE,
    getMyTyres,
  );
  const loadError = query.error ? getErrorMessage(query.error, 'Could not load your production entries.') : '';

  useEffect(() => {
    getMachines().then(setMachines).catch((error: unknown) => setMachineLoadError(getErrorMessage(error, 'Could not load machines.')));
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
    if (!Number.isInteger(machineNumber) || machineNumber < 1 || !machines.some((machine) => machine.machineNumber === machineNumber)) {
      setValidationError('Select a valid machine.');
      return;
    }

    setValidationError('');
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await apiClient.post<TyreEntry>('/api/Tyre', {
        code: form.code.trim(),
        quantityProduced,
        productionShift: Number(form.productionShift),
        machineNumber,
        productionDate: form.productionDate || null,
      });

      query.setPage(1);
      query.reload();
      setIsModalOpen(false);
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error, 'Could not create the production entry.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setCode('');
    setShift('');
    setMachineNumber('');
    setDateFrom('');
    setDateTo('');
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

      <FilterBar onClear={clearFilters}>
        <FilterField label="Code">
          <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Any code" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" />
        </FilterField>
        <FilterField label="Shift">
          <select value={shift} onChange={(event) => setShift(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]">
            <option value="">All shifts</option>
            {shifts.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </FilterField>
        <FilterField label="Machine number">
          <input value={machineNumber} onChange={(event) => setMachineNumber(event.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Any machine" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" />
        </FilterField>
        <FilterField label="From">
          <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]" />
        </FilterField>
        <FilterField label="To">
          <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]" />
        </FilterField>
      </FilterBar>

      <div className="mt-6 overflow-hidden border border-slate-200">
        {query.isLoading && <p className="p-8 text-center text-sm text-slate-500">Loading your entries...</p>}
        {!query.isLoading && loadError && (
          <div className="p-8 text-center" role="alert">
            <p className="font-semibold text-[#e4002b]">{loadError}</p>
            <p className="mt-2 text-sm text-slate-500">Refresh the page and try again.</p>
          </div>
        )}
        {!query.isLoading && !loadError && query.items.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-lg font-bold text-[#183b70]">{code || shift || machineNumber || dateFrom || dateTo ? 'No entries match these filters' : 'No entries yet'}</p>
            <p className="mt-2 text-sm text-slate-500">{code || shift || machineNumber || dateFrom || dateTo ? 'Clear the filters to see all your production entries.' : 'Add your first production entry to see it here.'}</p>
          </div>
        )}
        {!query.isLoading && !loadError && query.items.length > 0 && (
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
                {query.items.map((entry) => (
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

      {!query.isLoading && !loadError && <Pagination page={query.page} totalPages={query.totalPages} totalCount={query.totalCount} pageSize={PAGE_SIZE} onPageChange={query.setPage} />}

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
                  <span className="mb-2 block text-sm font-medium text-[#183b70]">Machine</span>
                  <SearchableSelect value={form.machineNumber} options={machines.map((machine) => ({ value: String(machine.machineNumber), label: `${machine.machineNumber} - ${machine.name}` }))} placeholder={machineLoadError || 'Search machine'} disabled={Boolean(machineLoadError) || machines.length === 0} onChange={(value) => { setForm((current) => ({ ...current, machineNumber: value })); setValidationError(''); setSubmitError(''); }} />
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
