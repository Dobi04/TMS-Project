import type { Theme } from '../hooks/useTheme';

export function getThemeClasses(theme: Theme) {
  const isDark = theme === 'dark';

  return {
    shell: isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900',
    sidebar: isDark
      ? 'border-slate-800 bg-slate-900/95 text-slate-100'
      : 'border-slate-200 bg-white/95 text-slate-900',
    border: isDark ? 'border-slate-800' : 'border-slate-200',
    subtleText: isDark ? 'text-slate-400' : 'text-slate-500',
    iconTile: isDark ? 'bg-slate-800 text-violet-200' : 'bg-slate-100 text-violet-600',
    secondaryButton: isDark
      ? 'border-slate-700 bg-slate-800 text-slate-100 hover:border-violet-400 hover:text-violet-100'
      : 'border-slate-200 bg-slate-100 text-slate-800 hover:border-violet-400 hover:text-violet-700',
    navLink: isDark
      ? 'text-slate-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white'
      : 'text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-slate-900',
    ghostButton: isDark
      ? 'border-slate-700 bg-slate-900 text-slate-100'
      : 'border-slate-200 bg-slate-100 text-slate-800',
    userPanel: isDark ? 'border-violet-500/30 bg-violet-500/10' : 'border-violet-200 bg-violet-50',
    logoutButton: isDark
      ? 'border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'
      : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    headerBg: isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/80',
  };
}