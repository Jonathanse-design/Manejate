import { useState } from 'react';

import type { AppMode, BankProduct, ProductType } from '../../types/finance';
import { toDateKey } from '../../utils/dates';
import { createId, nowIso } from '../../utils/id';

export const ProductForm = ({ mode, onSave }: { mode: AppMode; onSave: (product: BankProduct) => void }) => {
  const [type, setType] = useState<ProductType>('credit-card');
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [balance, setBalance] = useState('');
  const [limit, setLimit] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');

  const save = () => {
    if (!name.trim()) return;
    const stamp = nowIso();
    onSave({
      id: createId('product'),
      mode,
      type,
      name,
      bank,
      balance: Number(balance || 0),
      currency: 'RD$',
      color: type === 'credit-card' ? '#38BDF8' : type === 'loan' ? '#22C55E' : '#8B5CF6',
      creditLimit: type === 'credit-card' ? Number(limit || 0) : undefined,
      cutDay: type === 'credit-card' ? 18 : undefined,
      paymentDueDay: type === 'credit-card' ? 5 : undefined,
      estimatedPayment: type === 'credit-card' ? Number(balance || 0) : undefined,
      monthlyPayment: type === 'loan' ? Number(monthlyPayment || 0) : undefined,
      nextPaymentDate: type === 'loan' ? toDateKey(new Date()) : undefined,
      createdAt: stamp,
      updatedAt: stamp
    });
    setName('');
    setBank('');
    setBalance('');
    setLimit('');
    setMonthlyPayment('');
  };

  return (
    <div className="form-card">
      <label>
        Tipo de producto
        <select onChange={(event) => setType(event.target.value as ProductType)} value={type}>
          <option value="credit-card">Tarjeta de crédito</option>
          <option value="loan">Préstamo</option>
          <option value="bank-account">Cuenta bancaria</option>
          <option value="other">Otro producto financiero</option>
        </select>
      </label>
      <label>
        Nombre
        <input onChange={(event) => setName(event.target.value)} placeholder="Ej. Tarjeta APAP" value={name} />
      </label>
      <label>
        Banco o entidad
        <input onChange={(event) => setBank(event.target.value)} placeholder="Banco" value={bank} />
      </label>
      <label>
        Balance actual
        <input inputMode="decimal" onChange={(event) => setBalance(event.target.value)} value={balance} />
      </label>
      {type === 'credit-card' && (
        <label>
          Límite de crédito
          <input inputMode="decimal" onChange={(event) => setLimit(event.target.value)} value={limit} />
        </label>
      )}
      {type === 'loan' && (
        <label>
          Cuota mensual
          <input inputMode="decimal" onChange={(event) => setMonthlyPayment(event.target.value)} value={monthlyPayment} />
        </label>
      )}
      <button className="primary-btn" onClick={save} type="button">
        Guardar producto
      </button>
    </div>
  );
};
