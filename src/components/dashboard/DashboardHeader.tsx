import { Eye, EyeOff, Settings } from 'lucide-react';
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
  greeting,
  mode,
  health,
  privacyMode,
  onTogglePrivacy,
  onOpenSettings
}: {
  userName?: string;
  greeting?: string;
  mode: AppMode;
  health: FinancialHealth;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  onOpenSettings: () => void;
}) => (
  <header className="dashboard-header">
    <div className="dashboard-brand-row">
      <div className="brand-mark" aria-label="Manéjate">
        <span className="brand-symbol-glass"><img src="./assets/logo-manejate-icon.svg" alt="" /></span>
        <strong>Manéjate</strong>
      </div>
      <span className={`mode-pill ${mode}`}>{mode === 'demo' ? 'Modo Demo' : 'Modo Real'}</span>
    </div>
    <div className="dashboard-welcome">
      <div>
        <p className="eyebrow">{format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}</p>
        <h1>{userName ? `Hola, ${userName}` : 'Hola'}</h1>
        <p>{userName ? 'Así va tu dinero este mes.' : greeting?.trim() || 'Personaliza Manéjate para entender mejor tu dinero.'}</p>
      </div>
      <div className={`financial-status ${health}`}>
        <span>Estado: {health === 'healthy' ? 'Saludable' : health === 'tight' ? 'Ajustado' : 'Crítico'}</span>
        <p>{statusCopy[health]}</p>
      </div>
    </div>
    <div className="dashboard-profile">
      <button
        aria-label={privacyMode ? 'Mostrar montos' : 'Ocultar montos'}
        className="privacy dashboard-privacy"
        onClick={onTogglePrivacy}
        type="button"
      >
        {privacyMode ? <Eye size={17} /> : <EyeOff size={17} />}
        {privacyMode ? 'Mostrar' : 'Ocultar'}
      </button>
      <button aria-label="Abrir ajustes" className="profile-button" onClick={onOpenSettings} type="button">
        <span>{userName?.charAt(0).toUpperCase() || 'M'}</span>
        <Settings size={17} />
      </button>
    </div>
  </header>
);
