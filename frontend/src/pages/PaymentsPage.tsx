import { useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../layouts/MainLayout';

export default function PaymentsPage() {
  const outletContext = useOutletContext<LayoutOutletContext | undefined>();
  const theme = outletContext?.theme ?? 'light';
  const isDark = theme === 'dark';

  return (
    <section className="space-y-4" aria-label="Payments page">
      <div
        className={`rounded-[28px] border p-5 shadow-2xl ${
          isDark
            ? 'border-violet-500/20 bg-slate-900 shadow-violet-950/30'
            : 'border-violet-200 bg-white shadow-violet-200/50'
        }`}
      >
        <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-violet-200' : 'text-violet-600'}`}>
          Finance
        </p>
        <h1 className={`mt-3 text-3xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Payments
        </h1>
        <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Keep settlement status, pending approvals, and trip budgets easy to review.
        </p>
      </div>

      <div className={`rounded-[26px] border p-4 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="space-y-3">
          {[
            { name: 'Team transport', status: 'Paid', amount: '€980', accent: 'emerald' },
            { name: 'Hotel deposit', status: 'Pending', amount: '€540', accent: 'amber' },
            { name: 'Airport transfer', status: 'Review', amount: '€220', accent: 'violet' },
          ].map((item) => (
            <div key={item.name} className={`flex items-center justify-between rounded-2xl px-3 py-3 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                <p className={`text-[10px] uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.status}</p>
              </div>
              <span className={`text-sm font-bold ${isDark ? 'text-violet-200' : 'text-violet-700'}`}>{item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
