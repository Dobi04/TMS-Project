import SidebarNav from './SidebarNav';
import UserPanel from './userPanel';
import type { getThemeClasses } from '../../lib/themeClasses';

type Props = {
  classes: ReturnType<typeof getThemeClasses>;
  isMobileOpen: boolean;
  isCollapsed: boolean;
  onCloseMobile: () => void;
  onToggleCollapsed: () => void;
  isLoggedIn: boolean;
  username: string;
  role: string;
  onLogout: () => void;
  onOpenAuth: (mode: 'signin' | 'login') => void;
};

export default function Sidebar({
  classes,
  isMobileOpen,
  isCollapsed,
  onCloseMobile,
  onToggleCollapsed,
  isLoggedIn,
  username,
  role,
  onLogout,
  onOpenAuth,
}: Props) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        aria-hidden={!isMobileOpen}
        onClick={onCloseMobile}
        className={`fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r p-4 shadow-2xl shadow-slate-950/30 backdrop-blur-xl transition-all duration-300 ease-out md:translate-x-0 ${
          classes.sidebar
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'md:w-20' : 'md:w-72'} w-72`}
      >
        <div className={`flex items-center justify-between border-b pb-4 ${classes.border}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-xs font-black tracking-[0.2em] text-violet-400">
              ES
            </div>
            {!isCollapsed && (
              <div>
                <p className={`text-xs uppercase tracking-[0.24em] ${classes.subtleText}`}>App</p>
                <h1 className="text-base font-semibold">TMS</h1>
              </div>
            )}
          </div>

          {/* Close (mobile only) */}
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onCloseMobile}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-lg md:hidden ${classes.ghostButton}`}
          >
            ×
          </button>

          {/* Collapse toggle (desktop only) */}
          <button
            type="button"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleCollapsed}
            className={`hidden h-9 w-9 items-center justify-center rounded-full border text-sm md:inline-flex ${classes.ghostButton}`}
          >
            {isCollapsed ? '»' : '«'}
          </button>
        </div>

        <SidebarNav
          classes={classes}
          isCollapsed={isCollapsed}
          isLoggedIn={isLoggedIn}
          role={role}
          onNavigate={onCloseMobile}
        />

        <div className={`mt-auto space-y-3 border-t pt-4 ${classes.border}`}>
          <UserPanel
            classes={classes}
            isCollapsed={isCollapsed}
            isLoggedIn={isLoggedIn}
            username={username}
            role={role}
            onLogout={onLogout}
            onOpenAuth={onOpenAuth}
          />
        </div>
      </aside>
    </>
  );
}