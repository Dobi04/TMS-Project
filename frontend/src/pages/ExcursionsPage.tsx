import { useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../layouts/MainLayout';

export default function ExcursionsPage() {
  const outletContext = useOutletContext<LayoutOutletContext | undefined>();
  const theme = outletContext?.theme ?? 'light';
  const isDark = theme === 'dark';

  return (
    <section className="space-y-4" aria-label="Excursions page">
      <div
        className={`rounded-[28px] border p-5 shadow-2xl ${
          isDark
            ? 'border-violet-500/20 bg-slate-900 shadow-violet-950/30'
            : 'border-violet-200 bg-white shadow-violet-200/50'
        }`}
      >
        <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-violet-200' : 'text-violet-600'}`}>
          Trips
        </p>
        <h1 className={`mt-3 text-3xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Excursions
        </h1>
        <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Review upcoming trips, assign teams, and keep preparation tasks in one place.
        </p>
      </div>

      <div className={`rounded-[26px] border p-4 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <p className={`text-xs uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Overview</p>
        <div className="mt-4 space-y-3">
          {['Weekend getaway', 'City sprint', 'Family trip'].map((item, index) => (
            <div
              key={item}
              className={`flex items-center justify-between rounded-2xl px-3 py-3 ${
                isDark ? 'bg-slate-800' : 'bg-slate-100'
              }`}
            >
              <span className={`text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{item}</span>
              <span className={`text-[10px] uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {index + 1} / 3
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
