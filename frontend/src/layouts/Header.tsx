import type { getThemeClasses } from '../lib/themeClasses';
import type { Theme } from '../hooks/useTheme';

type Props = {
  classes: ReturnType<typeof getThemeClasses>;
  theme: Theme;
  onToggleTheme: () => void;
  onToggleMobileSidebar: () => void;
  isLoggedIn: boolean;
  username: string;
  onOpenAuth: (mode: 'signin' | 'login') => void;
  isSidebarCollapsed: boolean;
};

export default function Header({
  classes,
  theme,
  onToggleTheme,
  onToggleMobileSidebar,
  isLoggedIn,
  username,
  onOpenAuth,
  isSidebarCollapsed,
}: Props) {
  return (
    <header
      className={`sticky top-0 z-20 border-b backdrop-blur-xl transition-[padding] duration-300 ${classes.headerBg} ${
        isSidebarCollapsed ? 'md:pl-20' : 'md:pl-72'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            aria-label="Toggle navigation"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-lg md:hidden ${classes.ghostButton}`}
          >
            ☰
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-2 rounded-full border border-violet-300/40 bg-violet-500/10 px-2.5 py-1.5">
              <span className={`text-[10px] uppercase tracking-[0.18em] ${classes.subtleText}`}>Welcome</span>
              <span className="text-xs font-semibold text-violet-500">{username}</span>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth('signin')}
                className={`hidden rounded-full border px-3 py-2 text-xs font-medium md:inline-flex ${classes.secondaryButton}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="hidden rounded-full bg-violet-500 px-3 py-2 text-xs font-semibold text-white md:inline-flex"
              >
                Log in
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className={`rounded-full border px-2.5 py-2 text-xs font-medium ${classes.secondaryButton}`}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </header>
  );
}