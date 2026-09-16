import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AuthModal from '../features/auth/AuthModal';
import Header from './Header';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { getThemeClasses } from '../lib/themeClasses';

export type LayoutOutletContext = {
  theme: 'dark' | 'light';
};

type AuthMode = 'signin' | 'login';

export default function MainLayout() {
  const { theme, toggleTheme } = useTheme();
  const { username, role, isLogedIn: isLoggedIn, refresh, logout } = useAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  const classes = getThemeClasses(theme);

  const openAuthModal = (mode: AuthMode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  const handleAuthSuccess = () => {
    refresh();
    setIsAuthModalOpen(false);
  };

  return (
    <>
      <div className={`min-h-screen transition-colors duration-200 ${classes.shell}`}>
        <Header
          classes={classes}
          theme={theme}
          onToggleTheme={toggleTheme}
          isLoggedIn={isLoggedIn}
          username={username}
          role={role}
          onLogout={handleLogout}
          onOpenAuth={openAuthModal}
        />

        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <Outlet context={{ theme } satisfies LayoutOutletContext} />
        </main>
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