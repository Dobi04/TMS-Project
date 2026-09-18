import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

type ProductionByDay = {
  date: string;
  totalQuantityProduced: number;
};

type ProductionByShift = {
  shift: string;
  totalQuantityProduced: number;
};

type ProductionByMachine = {
  machineNumber: number;
  totalQuantityProduced: number;
};

type ProductionByOperator = {
  operatorId: number;
  totalQuantityProduced: number;
};

type StockBalance = {
  tyreCode: string;
  totalProduced: number;
  totalSold: number;
  stockBalance: number;
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

export default function SummaryReportsPage() {
  const [productionByDay, setProductionByDay] = useState<ProductionByDay[]>([]);
  const [productionByShift, setProductionByShift] = useState<ProductionByShift[]>([]);
  const [productionByMachine, setProductionByMachine] = useState<ProductionByMachine[]>([]);
  const [productionByOperator, setProductionByOperator] = useState<ProductionByOperator[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState('');
  const [stockBalance, setStockBalance] = useState<StockBalance[]>([]);
  const [stockDate, setStockDate] = useState(new Date().toISOString().slice(0, 10));
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState('');

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      apiClient.get<ProductionByDay[]>('/api/Reports/production-by-day'),
      apiClient.get<ProductionByShift[]>('/api/Reports/production-by-shift'),
      apiClient.get<ProductionByMachine[]>('/api/Reports/production-by-machine'),
      apiClient.get<ProductionByOperator[]>('/api/Reports/production-by-operator'),
    ])
      .then(([dayResponse, shiftResponse, machineResponse, operatorResponse]) => {
        if (isMounted) {
          setProductionByDay(dayResponse.data);
          setProductionByShift(shiftResponse.data);
          setProductionByMachine(machineResponse.data);
          setProductionByOperator(operatorResponse.data);
          setReportsError('');
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setReportsError(getErrorMessage(error, 'Could not load summary reports.'));
        }
      })
      .finally(() => {
        if (isMounted) {
          setReportsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loadStockBalance = async () => {
    setStockLoading(true);
    setStockError('');

    try {
      const response = await apiClient.get<StockBalance[]>('/api/Reports/stock-balance', {
        params: { date: stockDate },
      });
      setStockBalance(response.data);
    } catch (error: unknown) {
      setStockError(getErrorMessage(error, 'Could not load stock balance.'));
    } finally {
      setStockLoading(false);
    }
  };

  useEffect(() => {
    void loadStockBalance();
  }, []);

  return (
    <section className="border-t-4 border-[#f5c400] bg-white p-5 shadow-[0_12px_30px_rgba(24,59,112,0.08)] sm:p-8" aria-label="Summary reports page">
      <div className="border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e4002b]">Business unit leader</p>
        <h1 className="mt-3 text-3xl font-black text-[#183b70]">Summary Reports</h1>
        <p className="mt-2 max-w-xl text-base text-slate-600">Review production performance and current stock balance.</p>
      </div>

      <div className="mt-6 space-y-8">
        {reportsLoading && <LoadingState message="Loading summary reports..." />}
        {!reportsLoading && reportsError && <ErrorState message={reportsError} />}
        {!reportsLoading && !reportsError && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <ReportSection title="Production By Day" isEmpty={productionByDay.length === 0}>
              <table className="min-w-120 w-full text-left text-sm">
                <thead className="bg-[#183b70] text-xs uppercase tracking-wider text-white"><tr><th className="px-4 py-4 font-bold">Date</th><th className="px-4 py-4 font-bold">Total Quantity Produced</th></tr></thead>
                <tbody className="divide-y divide-slate-200">{productionByDay.map((report) => <tr key={report.date} className="transition hover:bg-[#f5f7fa]"><td className="px-4 py-4 font-semibold text-[#183b70]">{formatDate(report.date)}</td><td className="px-4 py-4 text-slate-600">{report.totalQuantityProduced.toLocaleString()}</td></tr>)}</tbody>
              </table>
            </ReportSection>

            <ReportSection title="Production By Shift" isEmpty={productionByShift.length === 0}>
              <table className="min-w-100 w-full text-left text-sm">
                <thead className="bg-[#183b70] text-xs uppercase tracking-wider text-white"><tr><th className="px-4 py-4 font-bold">Shift</th><th className="px-4 py-4 font-bold">Total Quantity Produced</th></tr></thead>
                <tbody className="divide-y divide-slate-200">{productionByShift.map((report) => <tr key={report.shift} className="transition hover:bg-[#f5f7fa]"><td className="px-4 py-4 font-semibold text-[#183b70]">{report.shift}</td><td className="px-4 py-4 text-slate-600">{report.totalQuantityProduced.toLocaleString()}</td></tr>)}</tbody>
              </table>
            </ReportSection>

            <ReportSection title="Production By Machine" isEmpty={productionByMachine.length === 0}>
              <table className="min-w-100 w-full text-left text-sm">
                <thead className="bg-[#183b70] text-xs uppercase tracking-wider text-white"><tr><th className="px-4 py-4 font-bold">Machine Number</th><th className="px-4 py-4 font-bold">Total Quantity Produced</th></tr></thead>
                <tbody className="divide-y divide-slate-200">{productionByMachine.map((report) => <tr key={report.machineNumber} className="transition hover:bg-[#f5f7fa]"><td className="px-4 py-4 font-semibold text-[#183b70]">{report.machineNumber}</td><td className="px-4 py-4 text-slate-600">{report.totalQuantityProduced.toLocaleString()}</td></tr>)}</tbody>
              </table>
            </ReportSection>

            <ReportSection title="Production By Operator" isEmpty={productionByOperator.length === 0}>
              <table className="min-w-100 w-full text-left text-sm">
                <thead className="bg-[#183b70] text-xs uppercase tracking-wider text-white"><tr><th className="px-4 py-4 font-bold">Operator Id</th><th className="px-4 py-4 font-bold">Total Quantity Produced</th></tr></thead>
                <tbody className="divide-y divide-slate-200">{productionByOperator.map((report) => <tr key={report.operatorId} className="transition hover:bg-[#f5f7fa]"><td className="px-4 py-4 font-semibold text-[#183b70]">{report.operatorId}</td><td className="px-4 py-4 text-slate-600">{report.totalQuantityProduced.toLocaleString()}</td></tr>)}</tbody>
              </table>
            </ReportSection>
          </div>
        )}

        <section className="overflow-hidden border border-slate-200" aria-labelledby="stock-balance-heading">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div><h2 id="stock-balance-heading" className="text-xl font-black text-[#183b70]">Stock Balance</h2><p className="mt-1 text-sm text-slate-500">Check stock levels for a selected date.</p></div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#183b70]">Date</span><input type="date" value={stockDate} onChange={(event) => setStockDate(event.target.value)} className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#183b70] outline-none transition focus:border-[#f5c400]" /></label>
              <button type="button" onClick={() => void loadStockBalance()} disabled={stockLoading || !stockDate} className="bg-[#e4002b] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#b90024] disabled:cursor-not-allowed disabled:opacity-60">{stockLoading ? 'Loading...' : 'Refresh'}</button>
            </div>
          </div>
          {stockLoading && <LoadingState message="Loading stock balance..." />}
          {!stockLoading && stockError && <ErrorState message={stockError} />}
          {!stockLoading && !stockError && stockBalance.length === 0 && <p className="p-10 text-center text-sm text-slate-500">No stock balance data for this date.</p>}
          {!stockLoading && !stockError && stockBalance.length > 0 && <div className="overflow-x-auto"><table className="min-w-150 w-full text-left text-sm"><thead className="bg-[#183b70] text-xs uppercase tracking-wider text-white"><tr><th className="px-4 py-4 font-bold">Tyre Code</th><th className="px-4 py-4 font-bold">Total Produced</th><th className="px-4 py-4 font-bold">Total Sold</th><th className="px-4 py-4 font-bold">Stock Balance</th></tr></thead><tbody className="divide-y divide-slate-200">{stockBalance.map((stock) => <tr key={stock.tyreCode} className="transition hover:bg-[#f5f7fa]"><td className="px-4 py-4 font-semibold text-[#183b70]">{stock.tyreCode}</td><td className="px-4 py-4 text-slate-600">{stock.totalProduced.toLocaleString()}</td><td className="px-4 py-4 text-slate-600">{stock.totalSold.toLocaleString()}</td><td className={`px-4 py-4 font-bold ${stock.stockBalance < 0 ? 'text-[#e4002b]' : 'text-slate-600'}`}>{stock.stockBalance.toLocaleString()}</td></tr>)}</tbody></table></div>}
        </section>
      </div>
    </section>
  );
}

function ReportSection({ title, isEmpty, children }: { title: string; isEmpty: boolean; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden border border-slate-200" aria-label={title}>
      <div className="border-b border-slate-200 px-4 py-4 sm:px-6"><h2 className="text-xl font-black text-[#183b70]">{title}</h2></div>
      {isEmpty ? <p className="p-10 text-center text-sm text-slate-500">No report data available.</p> : <div className="overflow-x-auto">{children}</div>}
    </section>
  );
}