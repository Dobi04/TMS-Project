import { useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../layouts/MainLayout';

export default function HomePage() {
  const outletContext = useOutletContext<LayoutOutletContext | undefined>();
  const theme = outletContext?.theme ?? 'light';
  const isDark = theme === 'dark';

  return (
    <section className="space-y-4" aria-label="Home page">
      <div
        className={`rounded-[28px] border p-5 shadow-2xl ${
          isDark
            ? 'border-violet-500/20 bg-linear-to-br from-violet-500/15 via-slate-900 to-slate-900 shadow-violet-950/30'
            : 'border-violet-200 bg-linear-to-br from-violet-100 via-white to-slate-100 shadow-violet-200/50'
        }`}
      >
        <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-violet-200' : 'text-violet-600'}`}>
          Overview
        </p>
        <h1 className={`mt-3 text-3xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Plan your next excursion in one place.
        </h1>
        <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Manage trips, track team activity, and keep the payment flow simple from a phone-first dashboard.
        </p>

        <div className="mt-5 flex gap-2">
          <button type="button" className="flex-1 rounded-2xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white">
            New trip
          </button>
          <button
            type="button"
            className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
          >
            View tasks
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <p className={`text-xs uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Trips</p>
          <p className={`mt-4 text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>24</p>
        </div>

        <div className={`rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <p className={`text-xs uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Teams</p>
          <p className={`mt-4 text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>8</p>
        </div>
      </div>

      <div className={`rounded-[26px] border p-4 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center justify-between">
          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Today</p>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${
              isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            Active
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {['Morning briefing', 'Route check-in', 'Payment review'].map((item, index) => (
            <div
              key={item}
              className={`flex items-center justify-between rounded-2xl px-3 py-3 ${
                isDark ? 'bg-slate-800' : 'bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-[10px] font-bold ${
                    isDark ? 'bg-violet-500/20 text-violet-200' : 'bg-violet-100 text-violet-700'
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item}</span>
              </div>
              <span className={`text-[10px] uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                09:{30 + index * 15}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
