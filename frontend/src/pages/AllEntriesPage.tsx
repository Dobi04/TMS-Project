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

type Sale = {
  id: number;
  tyreCode: string;
  quantitySold: number;
  unitOfMeasure: string;
  salePriceByUnit: number;
  saleDate: string;
  destinationMarket: string;
  purchasingCompany: string;
  registeredById: number;
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
  const [entries, setEntries] = useState<TyreEntry[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isEntriesLoading, setIsEntriesLoading] = useState(true);
  const [isSalesLoading, setIsSalesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState('');
  const [salesError, setSalesError] = useState('');

  useEffect(() => {
    let isMounted = true;

    apiClient
      .get<TyreEntry[]>('/api/Tyre')
      .then((response) => {
        if (isMounted) {
          setEntries(response.data);
          setEntriesError('');
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setEntriesError(getErrorMessage(error, 'Could not load production entries.'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsEntriesLoading(false);
        }
      });

    apiClient
      .get<Sale[]>('/api/Sales')
      .then((response) => {
        if (isMounted) {
          setSales(response.data);
          setSalesError('');
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setSalesError(getErrorMessage(error, 'Could not load sales.'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsSalesLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
          {isEntriesLoading && <LoadingState message="Loading production entries..." />}
          {!isEntriesLoading && entriesError && <ErrorState message={entriesError} />}
          {!isEntriesLoading && !entriesError && entries.length === 0 && (
            <p className="p-10 text-center text-sm text-slate-500">No production entries yet.</p>
          )}
          {!isEntriesLoading && !entriesError && entries.length > 0 && (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="overflow-hidden border border-slate-200" aria-labelledby="sales-heading">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
            <h2 id="sales-heading" className="text-xl font-black text-[#183b70]">Sales</h2>
          </div>
          {isSalesLoading && <LoadingState message="Loading sales..." />}
          {!isSalesLoading && salesError && <ErrorState message={salesError} />}
          {!isSalesLoading && !salesError && sales.length === 0 && (
            <p className="p-10 text-center text-sm text-slate-500">No sales yet.</p>
          )}
          {!isSalesLoading && !salesError && sales.length > 0 && (
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
                  {sales.map((sale) => (
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
        </section>
      </div>
    </section>
  );
}
