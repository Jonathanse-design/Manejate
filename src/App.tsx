import { useState } from 'react';

import { AppShell, type PageKey } from './components/layout/AppShell';
import { Onboarding } from './components/layout/Onboarding';
import { useFinance } from './store/financeStore';
import { Analytics } from './pages/Analytics';
import { Banking } from './pages/Banking';
import { Dashboard } from './pages/Dashboard';
import { Movements } from './pages/Movements';
import { Savings } from './pages/Savings';
import { Settings } from './pages/Settings';

const renderPage = (
  page: PageKey,
  data: NonNullable<ReturnType<typeof useFinance>['data']>,
  onNavigate: (page: PageKey) => void
) => {
  if (page === 'movements') return <Movements />;
  if (page === 'banking') return <Banking />;
  if (page === 'savings') return <Savings />;
  if (page === 'analytics') return <Analytics data={data} />;
  if (page === 'settings') return <Settings />;
  return <Dashboard data={data} onNavigate={onNavigate} />;
};

export const App = () => {
  const { data, loading, togglePrivacy } = useFinance();
  const [page, setPage] = useState<PageKey>('dashboard');

  if (loading || !data) return <div className="loading-screen">Cargando Manéjate...</div>;
  if (!(data.settings.onboarding?.completed ?? data.settings.hasCompletedOnboarding)) return <Onboarding />;

  return (
    <AppShell
      mode={data.settings.selectedMode}
      onPageChange={setPage}
      onTogglePrivacy={togglePrivacy}
      page={page}
      privacyMode={data.settings.privacyMode}
    >
      {renderPage(page, data, setPage)}
    </AppShell>
  );
};
