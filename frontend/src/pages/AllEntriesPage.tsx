import { useState } from 'react';
import { getAllSales } from '../api/sales';
import { getAllTyres } from '../api/tyres';
import FilterBar from '../components/FilterBar';
import FilterField from '../components/FilterField';
import Pagination from '../components/Pagination';
import { usePagedQuery } from '../hooks/usePagedQuery';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { formatDate } from '../lib/format';
import { getErrorMessage } from '../lib/http';
import { PAGE_SIZE } from '../lib/pagination';

function LoadingState({ message }: { message: string }) {
  return <p className="p-8 text-center text-sm text-slate-500">{message}</p>;
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-8 text-center" role="alert">
      <p className="font-semibold text-[#e4002b]">{message}</p>
      <p className="mt-2 text-sm text-slate-500">Refresh the page and try again.</p>
    </div>
  );
}

export default function AllEntriesPage() {
  const [entryCode, setEntryCode] = useState('');
  const [entryOperatorId, setEntryOperatorId] = useState('');
  const [entryShift, setEntryShift] = useState('');
  const [entryMachineNumber, setEntryMachineNumber] = useState('');
  const [entryStatus, setEntryStatus] = useState('');
  const [entryDateFrom, setEntryDateFrom] = useState('');
  const [entryDateTo, setEntryDateTo] = useState('');
  const [saleTyreCode, setSaleTyreCode] = useState('');
  const [saleDestinationMarket, setSaleDestinationMarket] = useState('');
  const [salePurchasingCompany, setSalePurchasingCompany] = useState('');
  const [saleRegisteredById, setSaleRegisteredById] = useState('');
  const [saleDateFrom, setSaleDateFrom] = useState('');
  const [saleDateTo, setSaleDateTo] = useState('');
  const debouncedEntryCode = useDebouncedValue(entryCode);
  const debouncedSaleTyreCode = useDebouncedValue(saleTyreCode);
  const debouncedSaleDestinationMarket = useDebouncedValue(saleDestinationMarket);
  const debouncedSalePurchasingCompany = useDebouncedValue(salePurchasingCompany);
  const entriesQuery = usePagedQuery({
    code: debouncedEntryCode || undefined,
    operatorId: entryOperatorId ? Number(entryOperatorId) : undefined,
    shift: entryShift ? Number(entryShift) : undefined,
    machineNumber: entryMachineNumber ? Number(entryMachineNumber) : undefined,
    isActive: entryStatus === '' ? undefined : entryStatus === 'active',
    dateFrom: entryDateFrom || undefined,
    dateTo: entryDateTo || undefined,
  }, PAGE_SIZE, getAllTyres);
  const salesQuery = usePagedQuery({
    tyreCode: debouncedSaleTyreCode || undefined,
    destinationMarket: debouncedSaleDestinationMarket || undefined,
    purchasingCompany: debouncedSalePurchasingCompany || undefined,
    registeredById: saleRegisteredById ? Number(saleRegisteredById) : undefined,
    dateFrom: saleDateFrom || undefined,
    dateTo: saleDateTo || undefined,
  }, PAGE_SIZE, getAllSales);
  const entriesError = entriesQuery.error ? getErrorMessage(entriesQuery.error, 'Could not load production entries.') : '';
  const salesError = salesQuery.error ? getErrorMessage(salesQuery.error, 'Could not load sales.') : '';
  const clearEntryFilters = () => {
    setEntryCode(''); setEntryOperatorId(''); setEntryShift(''); setEntryMachineNumber(''); setEntryStatus(''); setEntryDateFrom(''); setEntryDateTo('');
  };
  const clearSaleFilters = () => {
    setSaleTyreCode(''); setSaleDestinationMarket(''); setSalePurchasingCompany(''); setSaleRegisteredById(''); setSaleDateFrom(''); setSaleDateTo('');
  };

  return (
    <section className="border-t-4 border-[#f5c400] bg-white p-5 shadow-[0_12px_30px_rgba(24,59,112,0.08)] sm:p-8" aria-label="All entries page">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e4002b]">Business unit leader</p>
        <h1 className="mt-3 text-3xl font-black text-[#183b70]">All Entries</h1>
        <p className="mt-2 max-w-xl text-base text-slate-600">Review production entries and sales across the business unit.</p>
      </div>

      <div className="mt-6 space-y-8">
        <section className="overflow-hidden border border-slate-200" aria-labelledby="production-entries-heading">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
            <h2 id="production-entries-heading" className="text-xl font-black text-[#183b70]">Production Entries</h2>
          </div>
          <FilterBar onClear={clearEntryFilters}>
            <FilterField label="Code"><input value={entryCode} onChange={(event) => setEntryCode(event.target.value)} placeholder="Any code" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" /></FilterField>
            <FilterField label="Operator ID"><input value={entryOperatorId} onChange={(event) => setEntryOperatorId(event.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Any operator" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" /></FilterField>
            <FilterField label="Shift"><select value={entryShift} onChange={(event) => setEntryShift(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]"><option value="">All shifts</option><option value="1">Morning</option><option value="2">Afternoon</option><option value="3">Night</option></select></FilterField>
            <FilterField label="Machine number"><input value={entryMachineNumber} onChange={(event) => setEntryMachineNumber(event.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Any machine" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" /></FilterField>
            <FilterField label="Status"><select value={entryStatus} onChange={(event) => setEntryStatus(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]"><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></FilterField>
            <FilterField label="From"><input type="date" value={entryDateFrom} onChange={(event) => setEntryDateFrom(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]" /></FilterField>
            <FilterField label="To"><input type="date" value={entryDateTo} onChange={(event) => setEntryDateTo(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]" /></FilterField>
          </FilterBar>
          {entriesQuery.isLoading && <LoadingState message="Loading production entries..." />}
          {!entriesQuery.isLoading && entriesError && <ErrorState message={entriesError} />}
          {!entriesQuery.isLoading && !entriesError && entriesQuery.items.length === 0 && (
            <p className="p-10 text-center text-sm text-slate-500">{entryCode || entryOperatorId || entryShift || entryMachineNumber || entryStatus || entryDateFrom || entryDateTo ? 'No production entries match these filters.' : 'No production entries yet.'}</p>
          )}
          {!entriesQuery.isLoading && !entriesError && entriesQuery.items.length > 0 && (
            <div className="overflow-x-auto">
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {entriesQuery.items.map((entry) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!entriesQuery.isLoading && !entriesError && <Pagination page={entriesQuery.page} totalPages={entriesQuery.totalPages} totalCount={entriesQuery.totalCount} pageSize={PAGE_SIZE} onPageChange={entriesQuery.setPage} />}
        </section>

        <section className="overflow-hidden border border-slate-200" aria-labelledby="sales-heading">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
            <h2 id="sales-heading" className="text-xl font-black text-[#183b70]">Sales</h2>
          </div>
          <FilterBar onClear={clearSaleFilters}>
            <FilterField label="Tyre code"><input value={saleTyreCode} onChange={(event) => setSaleTyreCode(event.target.value)} placeholder="Any code" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" /></FilterField>
            <FilterField label="Destination market"><input value={saleDestinationMarket} onChange={(event) => setSaleDestinationMarket(event.target.value)} placeholder="Any market" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" /></FilterField>
            <FilterField label="Purchasing company"><input value={salePurchasingCompany} onChange={(event) => setSalePurchasingCompany(event.target.value)} placeholder="Any company" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" /></FilterField>
            <FilterField label="Registered by ID"><input value={saleRegisteredById} onChange={(event) => setSaleRegisteredById(event.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Any user" className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#183b70]" /></FilterField>
            <FilterField label="From"><input type="date" value={saleDateFrom} onChange={(event) => setSaleDateFrom(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]" /></FilterField>
            <FilterField label="To"><input type="date" value={saleDateTo} onChange={(event) => setSaleDateTo(event.target.value)} className="border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-[#183b70]" /></FilterField>
          </FilterBar>
          {salesQuery.isLoading && <LoadingState message="Loading sales..." />}
          {!salesQuery.isLoading && salesError && <ErrorState message={salesError} />}
          {!salesQuery.isLoading && !salesError && salesQuery.items.length === 0 && (
            <p className="p-10 text-center text-sm text-slate-500">{saleTyreCode || saleDestinationMarket || salePurchasingCompany || saleRegisteredById || saleDateFrom || saleDateTo ? 'No sales match these filters.' : 'No sales yet.'}</p>
          )}
          {!salesQuery.isLoading && !salesError && salesQuery.items.length > 0 && (
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
                    <th className="px-4 py-4 font-bold">Registered By Id</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {salesQuery.items.map((sale) => (
                    <tr key={sale.id} className="transition hover:bg-[#f5f7fa]">
                      <td className="px-4 py-4 font-semibold text-[#183b70]">{sale.tyreCode}</td>
                      <td className="px-4 py-4 text-slate-600">{sale.quantitySold.toLocaleString()}</td>
                      <td className="px-4 py-4 text-slate-600">{sale.unitOfMeasure}</td>
                      <td className="px-4 py-4 text-slate-600">{sale.salePriceByUnit.toFixed(2)}</td>
                      <td className="px-4 py-4 text-slate-600">{formatDate(sale.saleDate)}</td>
                      <td className="px-4 py-4 text-slate-600">{sale.destinationMarket}</td>
                      <td className="px-4 py-4 text-slate-600">{sale.purchasingCompany}</td>
                      <td className="px-4 py-4 text-slate-600">{sale.registeredById}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!salesQuery.isLoading && !salesError && <Pagination page={salesQuery.page} totalPages={salesQuery.totalPages} totalCount={salesQuery.totalCount} pageSize={PAGE_SIZE} onPageChange={salesQuery.setPage} />}
        </section>
      </div>
    </section>
  );
}
