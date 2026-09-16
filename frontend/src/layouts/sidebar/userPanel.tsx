type Props = {
  classes: {
    subtleText: string;
    userPanel: string;
    logoutButton: string;
    secondaryButton: string;
  };
  isCollapsed: boolean;
  isLoggedIn: boolean;
  username: string;
  role: string;
  onLogout: () => void;
  onOpenAuth: (mode: 'signin' | 'login') => void;
};

export default function UserPanel({ classes, isCollapsed, isLoggedIn, username, role, onLogout, onOpenAuth }: Props) {
  if (isCollapsed) return null; // u collapsed modu ostavljamo samo nav ikonice, čisto i minimalno

  if (isLoggedIn) {
    return (
      <>
        <div className={`rounded-2xl border px-3 py-3 ${classes.userPanel}`}>
          <p className={`text-[10px] uppercase tracking-[0.18em] ${classes.subtleText}`}>Welcome</p>
          <p className="mt-1 text-base font-semibold">{username}</p>
          <p className={`mt-2 text-[10px] uppercase tracking-[0.18em] ${classes.subtleText}`}>Uloga</p>
          <p className="text-sm font-medium text-violet-400">{role || 'User'}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${classes.logoutButton}`}
        >
          Log out
        </button>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenAuth('signin')}
        className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${classes.secondaryButton}`}
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={() => onOpenAuth('login')}
        className="w-full rounded-2xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:bg-violet-400"
      >
        Log in
      </button>
    </>
  );
}