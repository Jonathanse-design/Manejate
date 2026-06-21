import { Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import type { AppMode, FinancialHealth } from '../../types/finance';

const statusCopy: Record<FinancialHealth, string> = {
  healthy: 'Buen mes: tus ingresos superan tus gastos.',
  tight: 'Este mes vas ajustado. Vigila los gastos variables.',
  critical: 'Estás gastando más de lo que entra.'
};

export const DashboardHeader = ({
  userName,
  mode,
  health,
  privacyMode,
  onTogglePrivacy
}: {
  userName?: string;
  mode: AppMode;
  health: FinancialHealth;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
}) => (
  <header className="dashboard-header">
    <div className="dashboard-brand-row">
      <img className="brand-logo" src="./assets/logo-manejate-dark.svg" alt="Manéjate" />
      <span className={`mode-pill ${mode}`}>{mode === 'demo' ? 'Modo Demo' : 'Modo Real'}</span>
    </div>
    <div className="dashboard-welcome">
      <div>
        <p className="eyebrow">{format(new Date(), 'MMMM yyyy', { locale: es })}</p>
        <h1>Hola{userName ? `, ${userName}` : ''}</h1>
        <p>Así va tu dinero este mes.</p>
      </div>
      <div className={`financial-status ${health}`}>
        <span>Estado: {health === 'healthy' ? 'Saludable' : health === 'tight' ? 'Ajustado' : 'Crítico'}</span>
        <p>{statusCopy[health]}</p>
      </div>
    </div>
    <button
      aria-label={privacyMode ? 'Mostrar montos' : 'Ocultar montos'}
      className="privacy dashboard-privacy"
      onClick={onTogglePrivacy}
      type="button"
    >
      {privacyMode ? <Eye size={17} /> : <EyeOff size={17} />}
      {privacyMode ? 'Mostrar montos' : 'Ocultar montos'}
    </button>
  </header>
);
