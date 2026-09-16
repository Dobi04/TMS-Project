export type NavItem = {
  label: string;
  icon: string;
  to: string;
};

export const navItems: NavItem[] = [
  { label: 'Home', icon: '⌂', to: '/' },
  { label: 'Excursions', icon: '🗺️', to: '/excursions' },
  { label: 'Tracking', icon: '📍', to: '/tracking' },
  { label: 'Payments', icon: '💳', to: '/payments' },
  { label: 'Admin', icon: '⚙️', to: '/admin' },
];

export function getVisibleNavItems(isLoggedIn: boolean, role: string) {
  const normalizedRole = role?.trim().toLowerCase() ?? '';

  if (!isLoggedIn) {
    return navItems.filter((item) => item.to === '/');
  }

  if (normalizedRole === 'admin') {
    return navItems;
  }

  return navItems.filter((item) => item.to !== '/admin');
}