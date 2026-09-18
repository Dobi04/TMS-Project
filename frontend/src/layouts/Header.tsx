import type { getThemeClasses } from '../lib/themeClasses';
import type { Theme } from '../hooks/useTheme';
import MichelinLogo from '../assets/Michelin-logo.jpg';
import { Link } from 'react-router-dom';

type Props = {
  classes: ReturnType<typeof getThemeClasses>;
  theme: Theme;
  onToggleTheme: () => void;
  isLoggedIn: boolean;
  username: string;
  role: string;
  onLogout: () => void;
  onOpenAuth: (mode: 'signin' | 'login') => void;
};

export default function Header({
  classes,
  theme,
  onToggleTheme,
  isLoggedIn,
  username,
  role,
  onLogout,
  onOpenAuth,
}: Props) {
  const isProductionOperator = role.trim().toLowerCase() === 'productionoperator';
  const isQualitySupervisor = role.trim().toLowerCase() === 'qualitysupervisor';
  const isBusinessUnitLeader = role.trim().toLowerCase() === 'businessunitleader';

  return (
    <header className={`sticky top-0 z-20 border-b ${classes.headerBg}`}>
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Michelin TMS home">
          <div className="flex h-14 w-36 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-white p-1 shadow-sm">
            <img src={MichelinLogo} alt="Michelin TMS" className="h-full w-full object-contain" />
          </div>
          <div className="hidden border-l border-slate-200 pl-3 sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#183b70]">TMS portal</p>
            <p className="text-xs text-slate-500">Tyre management system</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          <Link className="text-sm font-semibold text-[#183b70]" to="/">
            Home
          </Link>
          {isLoggedIn && isProductionOperator && (
            <Link className="text-sm font-medium text-slate-500 transition hover:text-[#183b70]" to="/my-entrys">
              My Entrys
            </Link>
          )}
          {isLoggedIn && isQualitySupervisor && (
            <Link className="text-sm font-medium text-slate-500 transition hover:text-[#183b70]" to="/sale-history">
              Sale History
            </Link>
          )}
          {isLoggedIn && isQualitySupervisor && (
            <Link className="text-sm font-medium text-slate-500 transition hover:text-[#183b70]" to="/production-history">
              Production History
            </Link>
          )}
          {isLoggedIn && isQualitySupervisor && (
            <Link className="text-sm font-medium text-slate-500 transition hover:text-[#183b70]" to="/audit-log">
              Audit Log
            </Link>
          )}
          {isLoggedIn && isBusinessUnitLeader && (
            <Link className="text-sm font-medium text-slate-500 transition hover:text-[#183b70]" to="/summary-reports">
              Summary Reports
            </Link>
          )}
          {isLoggedIn && isBusinessUnitLeader && (
            <Link className="text-sm font-medium text-slate-500 transition hover:text-[#183b70]" to="/all-entries">
              Entry History
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">

          {isLoggedIn ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e4002b]">Welcome</p>
                <p className="text-sm font-semibold text-[#183b70]">{username}</p>
                <p className="text-[10px] text-slate-500">{role}</p>
              </div>
              <button type="button" onClick={onLogout} className="border border-[#183b70] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#183b70] transition hover:bg-[#183b70] hover:text-white">Log out</button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className="border-b-2 border-transparent px-2 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#183b70] transition hover:border-[#e4002b] hover:text-[#e4002b]"
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="border border-[#e4002b] bg-[#e4002b] px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-sm transition hover:bg-[#b90024] hover:shadow-md"
              >
                Log in
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="hidden border border-slate-200 px-2.5 py-2 text-xs font-bold uppercase text-slate-500 transition hover:border-[#183b70] hover:text-[#183b70] sm:inline-flex"
          >
            {theme === 'dark' ? 'Light' : 'Dark'} mode
          </button>
        </div>
      </div>
    </header>
  );
}