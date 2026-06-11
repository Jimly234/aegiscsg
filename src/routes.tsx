import PublicPortalPage from './pages/PublicPortalPage';
import LoginPage from './pages/LoginPage';
import GuardianDashboardPage from './pages/GuardianDashboardPage';
import CommandCenterPage from './pages/CommandCenterPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. */
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Public Safety Portal',
    path: '/',
    element: <PublicPortalPage />,
    public: true,
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    public: true,
  },
  {
    name: 'Guardian Dashboard',
    path: '/guardian',
    element: <GuardianDashboardPage />,
    public: false,
  },
  {
    name: 'Command Center',
    path: '/command',
    element: <CommandCenterPage />,
    public: false,
  },
];
