import { useOutletContext } from 'react-router-dom';
import type { LayoutOutletContext } from '../layouts/MainLayout';

export default function AdminPage() {
  const outletContext = useOutletContext<LayoutOutletContext | undefined>();
  const theme = outletContext?.theme ?? 'light';
  const isDark = theme === 'dark';

  return (
    <section className="space-y-4" aria-label="Admin page">
      <div
        className={`rounded-[28px] border p-6 shadow-2xl ${
          isDark
            ? 'border-violet-500/20 bg-slate-900 shadow-violet-950/30'
            : 'border-violet-200 bg-white shadow-violet-200/50'
        }`}
      >
        <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${isDark ? 'text-violet-200' : 'text-violet-600'}`}>
          Admin panel
        </p>
        <h1 className={`mt-3 text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Ovo je admin stranica
        </h1>
        <p className={`mt-3 text-sm leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Ovaj deo je dostupan samo administratorima.
        </p>
      </div>
    </section>
  );
}
