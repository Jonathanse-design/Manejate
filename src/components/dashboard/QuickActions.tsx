import { CreditCard, Landmark, PiggyBank, Plus } from 'lucide-react';

import type { PageKey } from '../layout/AppShell';

export const QuickActions = ({ onNavigate }: { onNavigate: (page: PageKey) => void }) => (
  <section className="quick-actions">
    <button className="quick-primary" onClick={() => onNavigate('movements')} type="button">
      <Plus size={18} />
      Registrar movimiento
    </button>
    <button onClick={() => onNavigate('banking')} type="button">
      <CreditCard size={17} />
      Consumo tarjeta
    </button>
    <button onClick={() => onNavigate('savings')} type="button">
      <PiggyBank size={17} />
      Agregar ahorro
    </button>
    <button onClick={() => onNavigate('banking')} type="button">
      <Landmark size={17} />
      Registrar pago
    </button>
  </section>
);
