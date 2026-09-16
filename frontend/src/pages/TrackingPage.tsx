import { useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../layouts/MainLayout';

export default function TrackingPage() {
  const outletContext = useOutletContext<LayoutOutletContext | undefined>();
  const theme = outletContext?.theme ?? 'light';
  const isDark = theme === 'dark';

  return (
    <section className="space-y-4" aria-label="Tracking page">
      <div
        className={`rounded-[28px] border p-5 shadow-2xl ${
          isDark
            ? 'border-violet-500/20 bg-slate-900 shadow-violet-950/30'
            : 'border-violet-200 bg-white shadow-violet-200/50'
        }`}
      >
        <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-violet-200' : 'text-violet-600'}`}>
          Live status
        </p>
        <h1 className={`mt-3 text-3xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Tracking
        </h1>
        <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Monitor progress, locations, and team checkpoints in real time.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'On route', value: '14' },
          { label: 'Delayed', value: '2' },
          { label: 'Checkpoints', value: '6' },
          { label: 'Alerts', value: '1' },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <p className={`text-xs uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</p>
            <p className={`mt-4 text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
