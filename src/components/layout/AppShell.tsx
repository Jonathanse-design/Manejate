import {
  BarChart3,
  Bell,
  Gauge,
  PiggyBank,
  PlusCircle,
  ReceiptText,
  Settings,
  Shield,
  WalletCards
} from 'lucide-react';
import type { ReactNode } from 'react';

import type { AppMode } from '../../types/finance';

export type PageKey = 'dashboard' | 'movements' | 'banking' | 'budget' | 'savings' | 'analytics' | 'settings';

const nav = [
  { key: 'dashboard', label: 'Inicio', icon: Gauge },
  { key: 'movements', label: 'Movimientos', icon: PlusCircle },
  { key: 'banking', label: 'Productos', icon: WalletCards },
  { key: 'budget', label: 'Presupuesto', icon: ReceiptText },
  { key: 'savings', label: 'Metas', icon: PiggyBank },
  { key: 'analytics', label: 'Insights', icon: BarChart3 },
  { key: 'settings', label: 'Ajustes', icon: Settings }
] as const;

type AppShellProps = {
  page: PageKey;
  onPageChange: (page: PageKey) => void;
  mode: AppMode;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  children: ReactNode;
};

export const AppShell = ({ page, onPageChange, mode, privacyMode, onTogglePrivacy, children }: AppShellProps) => (
  <div className="app-shell">
    <aside className="sidebar">
      <div className="brand-block">
        <img className="brand-logo" src="./assets/logo-manejate-dark.svg" alt="Manéjate" />
        <span>Finanzas personales</span>
      </div>
      <nav>
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={page === item.key ? 'active' : ''}
              key={item.key}
              onClick={() => onPageChange(item.key)}
              type="button"
            >
              <Icon size={19} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>

    <main className="main-content">
      {page !== 'dashboard' && (
        <header className="topbar">
          <div>
            <p className="eyebrow">Manéjate</p>
            <h1>{nav.find((item) => item.key === page)?.label}</h1>
          </div>
          <div className="top-actions">
            <span className={`mode-pill ${mode}`}>{mode === 'demo' ? 'Modo Demo' : 'Modo Real'}</span>
            <button
              aria-label={privacyMode ? 'Mostrar montos' : 'Ocultar montos'}
              className={privacyMode ? 'privacy active' : 'privacy'}
              onClick={onTogglePrivacy}
              type="button"
            >
              <Shield size={17} />
              {privacyMode ? 'Mostrar montos' : 'Ocultar montos'}
            </button>
            <Bell aria-label="Alertas" size={20} />
          </div>
        </header>
      )}
      {children}
    </main>

    <nav className="bottom-nav">
      {nav.map((item) => {
        const Icon = item.icon;
        return (
          <button
            aria-label={item.label}
            className={page === item.key ? 'active' : ''}
            key={item.key}
            onClick={() => onPageChange(item.key)}
            type="button"
          >
            <Icon size={21} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  </div>
);
