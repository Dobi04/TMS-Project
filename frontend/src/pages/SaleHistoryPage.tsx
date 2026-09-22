import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { getMySales } from '../api/sales';
import { getAllTyres } from '../api/tyres';
import FilterBar from '../components/FilterBar';
import FilterField from '../components/FilterField';
import Pagination from '../components/Pagination';
import SearchableSelect from '../components/SearchableSelect';
import { usePagedQuery } from '../hooks/usePagedQuery';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { formatDate } from '../lib/format';
import { getErrorMessage } from '../lib/http';
import { PAGE_SIZE } from '../lib/pagination';
import type { Sale } from '../types/sale';

type SaleForm = {
  tyreCode: string;
  quantitySold: string;
  unitOfMeasure: string;
  salePriceByUnit: string;
  saleDate: string;
  destinationMarket: string;
  purchasingCompany: string;
};

const emptyForm: SaleForm = {
  tyreCode: '',
  quantitySold: '',
  unitOfMeasure: '',
  salePriceByUnit: '',
  saleDate: new Date().toISOString().slice(0, 10),
  destinationMarket: '',
  purchasingCompany: '',
};

export default function SaleHistoryPage() {
  const [tyreCodeFilter, setTyreCodeFilter] = useState('');
  const [destinationMarketFilter, setDestinationMarketFilter] = useState('');
  const [purchasingCompanyFilter, setPurchasingCompanyFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<SaleForm>(emptyForm);
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tyres, setTyres] = useState<{ code: string }[]>([]);
  const [tyreLoadError, setTyreLoadError] = useState('');
  const debouncedTyreCode = useDebouncedValue(tyreCodeFilter);
  const debouncedDestinationMarket = useDebouncedValue(destinationMarketFilter);
  const debouncedPurchasingCompany = useDebouncedValue(purchasingCompanyFilter);
  const query = usePagedQuery(
    {
      tyreCode: debouncedTyreCode || undefined,
      destinationMarket: debouncedDestinationMarket || undefined,
      purchasingCompany: debouncedPurchasingCompany || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    PAGE_SIZE,
    getMySales,
  );
  const loadError = query.error ? getErrorMessage(query.error, 'Could not load your sales.') : '';

  useEffect(() => {
    getAllTyres({ isActive: true }, 1, 100)
      .then((result) => setTyres(result.items))
      .catch((error: unknown) => setTyreLoadError(getErrorMessage(error, 'Could not load tyres.')));
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
    setForm({ ...emptyForm, saleDate: new Date().toISOString().slice(0, 10) });
    setValidationError('');
    setSubmitError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setValidationError('');
    setSubmitError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantitySold = Number(form.quantitySold);
    const salePriceByUnit = Number(form.salePriceByUnit);

    if (!form.tyreCode.trim() || form.tyreCode.trim().length > 50) {
      setValidationError('Tyre code is required and must be 50 characters or fewer.');
      return;
    }
    if (!Number.isInteger(quantitySold) || quantitySold < 1) {
      setValidationError('Quantity sold must be a whole number greater than zero.');
      return;
    }
    if (!form.unitOfMeasure.trim()) {
      setValidationError('Unit of measure is required.');
      return;
    }
    if (!Number.isFinite(salePriceByUnit) || salePriceByUnit < 0.01) {
      setValidationError('Sale price by unit must be greater than zero.');
      return;
    }
    if (!form.destinationMarket.trim()) {
      setValidationError('Destination market is required.');
      return;
    }
    if (!form.purchasingCompany.trim()) {
      setValidationError('Purchasing company is required.');
      return;
    }

    setValidationError('');
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await apiClient.post<Sale>('/api/Sales', {
        tyreCode: form.tyreCode.trim(),
        quantitySold,
        unitOfMeasure: form.unitOfMeasure.trim(),
        salePriceByUnit,
        saleDate: form.saleDate || null,
        destinationMarket: form.destinationMarket.trim(),
        purchasingCompany: form.purchasingCompany.trim(),
      });

      query.setPage(1);
      query.reload();
      setIsModalOpen(false);
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error, 'Could not register the sale.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setTyreCodeFilter('');
    setDestinationMarketFilter('');
    setPurchasingCompanyFilter('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <section className="border-t-4 border-[#f5c400] bg-white p-5 shadow-[0_12px_30px_rgba(24,59,112,0.08)] sm:p-8" aria-label="Sale history page">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e4002b]">Quality supervisor</p>
          <h1 className="mt-3 text-3xl font-black text-[#183b70]">Sale History</h1>
          <p className="mt-2 max-w-xl text-base text-slate-600">Review the sales you have registered and record new tyre sales.</p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex shrink-0 items-center justify-center gap-2 bg-[#e4002b] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-red-200 transition hover:bg-[#b90024]"
        >
          <span className="text-lg leading-none" aria-hidden="true">+</span>
          Register Sale
        </button>
      </div>

      <FilterBar onClear={clearFilters}>
        <FilterField label="Tyre code">
          <input value={tyreCodeFilter} onChange={(event) => setTyreCodeFilter(event.target.value)} placeholder="Any code" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" />
        </FilterField>
        <FilterField label="Destination market">
          <input value={destinationMarketFilter} onChange={(event) => setDestinationMarketFilter(event.target.value)} placeholder="Any market" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" />
        </FilterField>
        <FilterField label="Purchasing company">
          <input value={purchasingCompanyFilter} onChange={(event) => setPurchasingCompanyFilter(event.target.value)} placeholder="Any company" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" />
        </FilterField>
        <FilterField label="From">
          <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]" />
        </FilterField>
        <FilterField label="To">
          <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]" />
        </FilterField>
      </FilterBar>

      <div className="mt-6 overflow-hidden border border-slate-200">
        {query.isLoading && <p className="p-8 text-center text-sm text-slate-500">Loading your sales...</p>}
        {!query.isLoading && loadError && (
          <div className="p-8 text-center" role="alert">
            <p className="font-semibold text-[#e4002b]">{loadError}</p>
            <p className="mt-2 text-sm text-slate-500">Refresh the page and try again.</p>
          </div>
        )}
        {!query.isLoading && !loadError && query.items.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-lg font-bold text-[#183b70]">{tyreCodeFilter || destinationMarketFilter || purchasingCompanyFilter || dateFrom || dateTo ? 'No sales match these filters' : 'No sales yet'}</p>
            <p className="mt-2 text-sm text-slate-500">{tyreCodeFilter || destinationMarketFilter || purchasingCompanyFilter || dateFrom || dateTo ? 'Clear the filters to see all your sales.' : 'Register your first sale to see it here.'}</p>
          </div>
        )}
        {!query.isLoading && !loadError && query.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-270 w-full text-left text-sm">
              <thead className="bg-[#183b70] text-xs uppercase tracking-wider text-white">
                <tr>
                  <th className="px-4 py-4 font-bold">Tyre Code</th>
                  <th className="px-4 py-4 font-bold">Quantity Sold</th>
                  <th className="px-4 py-4 font-bold">Unit of Measure</th>
                  <th className="px-4 py-4 font-bold">Sale Price By Unit</th>
                  <th className="px-4 py-4 font-bold">Sale Date</th>
                  <th className="px-4 py-4 font-bold">Destination Market</th>
                  <th className="px-4 py-4 font-bold">Purchasing Company</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {query.items.map((sale) => (
                  <tr key={sale.id} className="transition hover:bg-[#f5f7fa]">
                    <td className="px-4 py-4 font-semibold text-[#183b70]">{sale.tyreCode}</td>
                    <td className="px-4 py-4 text-slate-600">{sale.quantitySold.toLocaleString()}</td>
                    <td className="px-4 py-4 text-slate-600">{sale.unitOfMeasure}</td>
                    <td className="px-4 py-4 text-slate-600">{sale.salePriceByUnit.toFixed(2)}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(sale.saleDate)}</td>
                    <td className="px-4 py-4 text-slate-600">{sale.destinationMarket}</td>
                    <td className="px-4 py-4 text-slate-600">{sale.purchasingCompany}</td>
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
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e4002b]">Quality supervisor</p>
                <h2 className="mt-2 text-2xl font-black text-[#183b70]">Register sale</h2>
                <p className="mt-1 text-sm text-slate-500">Record the details of a tyre sale.</p>
              </div>
              <button type="button" onClick={closeModal} disabled={isSubmitting} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl text-[#183b70] transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Close modal">
                ×
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#183b70]">Tyre</span>
                <SearchableSelect value={form.tyreCode} options={tyres.map((tyre) => ({ value: tyre.code, label: tyre.code }))} placeholder={tyreLoadError || 'Search tyre by name or code'} disabled={Boolean(tyreLoadError) || tyres.length === 0} onChange={(value) => { setForm((current) => ({ ...current, tyreCode: value })); setValidationError(''); setSubmitError(''); }} />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#183b70]">Quantity Sold</span>
                  <input type="number" name="quantitySold" value={form.quantitySold} onChange={handleChange} min="1" step="1" required className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition focus:border-[#f5c400]" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#183b70]">Unit of Measure</span>
                  <input name="unitOfMeasure" value={form.unitOfMeasure} onChange={handleChange} maxLength={20} required className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition focus:border-[#f5c400]" placeholder="kom, kg" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#183b70]">Sale Price By Unit</span>
                  <input type="number" name="salePriceByUnit" value={form.salePriceByUnit} onChange={handleChange} min="0.01" step="0.01" required className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition focus:border-[#f5c400]" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#183b70]">Sale Date</span>
                  <input type="date" name="saleDate" value={form.saleDate} onChange={handleChange} className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition focus:border-[#f5c400]" />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#183b70]">Destination Market</span>
                <input name="destinationMarket" value={form.destinationMarket} onChange={handleChange} maxLength={100} required className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition focus:border-[#f5c400]" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#183b70]">Purchasing Company</span>
                <input name="purchasingCompany" value={form.purchasingCompany} onChange={handleChange} maxLength={150} required className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition focus:border-[#f5c400]" />
              </label>

              {(validationError || submitError) && <p className="text-sm font-medium text-[#e4002b]" role="alert">{validationError || submitError}</p>}
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#e4002b] px-4 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-md transition hover:bg-[#b90024] disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Saving sale...' : 'Save sale'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}