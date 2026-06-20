import { Database, Sparkles } from 'lucide-react';

import type { AppMode } from '../../types/finance';

export const Onboarding = ({ onStart }: { onStart: (mode: AppMode) => void }) => (
  <section className="onboarding">
    <div className="onboarding-card">
      <img src="./icons/logo-horizontal.png" alt="Manéjate" />
      <p className="eyebrow">Primera configuración</p>
      <h1>Controla tu dinero sin exponer tus datos.</h1>
      <p>
        Esta PWA guarda todo localmente en tu navegador. Puedes probar con datos demo o empezar en
        limpio con tus datos reales.
      </p>
      <div className="choice-grid">
        <button onClick={() => onStart('demo')} type="button">
          <Sparkles />
          <strong>Usar datos demo</strong>
          <span>Ideal para explorar o mostrar la app sin revelar información personal.</span>
        </button>
        <button onClick={() => onStart('real')} type="button">
          <Database />
          <strong>Empezar Modo Real</strong>
          <span>Base vacía para registrar ingresos, gastos, bancos, ahorros y alertas.</span>
        </button>
      </div>
    </div>
  </section>
);
