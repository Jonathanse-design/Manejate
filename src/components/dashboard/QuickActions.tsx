import { CreditCard, Landmark, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';

import type { PageKey } from '../layout/AppShell';

export const QuickActions = ({ onNavigate }: { onNavigate: (page: PageKey) => void }) => (
  <section className="quick-actions">
    <div className="section-title">
      <h3>Registrar rápido</h3>
    </div>
    <button className="quick-primary" onClick={() => onNavigate('movements')} type="button">
      <TrendingUp size={18} />
      + Ingreso
    </button>
    <button onClick={() => onNavigate('movements')} type="button">
      <TrendingDown size={17} />
      + Gasto
    </button>
    <button onClick={() => onNavigate('banking')} type="button">
      <CreditCard size={17} />
      + Consumo tarjeta
    </button>
    <button onClick={() => onNavigate('savings')} type="button">
      <PiggyBank size={17} />
      + Ahorro
    </button>
    <button onClick={() => onNavigate('banking')} type="button">
      <Landmark size={17} />
      + Pago
    </button>
  </section>
);
