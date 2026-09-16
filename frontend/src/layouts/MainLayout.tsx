import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AuthModal from '../features/auth/AuthModal';
import Sidebar from './sidebar/Sidebar';
import Header from './Header';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useSidebar } from '../hooks/useSidebar';
import { getThemeClasses } from '../lib/themeClasses';

export type LayoutOutletContext = {
  theme: 'dark' | 'light';
};

type AuthMode = 'signin' | 'login';

export default function MainLayout() {
  const { theme, toggleTheme } = useTheme();
  const { username, role, isLogedIn: isLoggedIn, refresh, logout } = useAuth();
  const sidebar = useSidebar();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  const classes = getThemeClasses(theme);

  const openAuthModal = (mode: AuthMode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    sidebar.closeMobile();
  };

  const handleLogout = () => {
    logout();
    sidebar.closeMobile();
  };

  const handleAuthSuccess = () => {
    refresh();
    setIsAuthModalOpen(false);
  };

  return (
    <>
      <div className={`min-h-screen transition-colors duration-200 ${classes.shell}`}>
        <Sidebar
          classes={classes}
          isMobileOpen={sidebar.isMobileOpen}
          isCollapsed={sidebar.isCollapsed}
          onCloseMobile={sidebar.closeMobile}
          onToggleCollapsed={sidebar.toggleCollapsed}
          isLoggedIn={isLoggedIn}
          username={username}
          role={role}
          onLogout={handleLogout}
          onOpenAuth={openAuthModal}
        />

        <div className={`min-h-screen transition-[padding] duration-300 ${sidebar.isCollapsed ? 'md:pl-20' : 'md:pl-72'}`}>
          <Header
            classes={classes}
            theme={theme}
            onToggleTheme={toggleTheme}
            onToggleMobileSidebar={sidebar.isMobileOpen ? sidebar.closeMobile : sidebar.openMobile}
            isLoggedIn={isLoggedIn}
            username={username}
            onOpenAuth={openAuthModal}
            isSidebarCollapsed={sidebar.isCollapsed}
          />

          <main className="mx-auto max-w-md px-4 py-5 pb-20">
            <Outlet context={{ theme } satisfies LayoutOutletContext} />
          </main>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        mode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onModeChange={setAuthMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}