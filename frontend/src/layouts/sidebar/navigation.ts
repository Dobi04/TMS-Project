export type NavItem = {
  label: string;
  icon: string;
  to: string;
};

export const navItems: NavItem[] = [
  { label: 'Home', icon: '⌂', to: '/' },
  { label: 'My Entrys', icon: '▤', to: '/my-entrys' },
  { label: 'Sale History', icon: '▥', to: '/sale-history' },
  { label: 'Production History', icon: '◫', to: '/production-history' },
  { label: 'Audit Log', icon: '⌕', to: '/audit-log' },
  { label: 'Summary Reports', icon: '▦', to: '/summary-reports' },
  { label: 'All Entries', icon: '☰', to: '/all-entries' },
];

export function getVisibleNavItems(isLoggedIn: boolean, role: string) {
  const normalizedRole = role?.trim().toLowerCase() ?? '';

  if (!isLoggedIn) {
    return navItems.filter((item) => item.to === '/');
  }

  return navItems.filter((item) => {
    if (item.to === '/admin') return normalizedRole === 'admin';
    if (item.to === '/my-entrys') return normalizedRole === 'productionoperator';
    if (['/sale-history', '/production-history', '/audit-log'].includes(item.to)) {
      return normalizedRole === 'qualitysupervisor';
    }
    if (item.to === '/summary-reports') {
      return ['businessunitleader', 'busisinessunitleader'].includes(normalizedRole);
    }
    if (item.to === '/all-entries') {
      return ['businessunitleader', 'busisinessunitleader'].includes(normalizedRole);
    }
    return true;
  });
}