import { useState } from 'react';

import type { AppMode, Transaction } from '../../types/finance';
import { toDateKey } from '../../utils/dates';
import { createId, nowIso } from '../../utils/id';

const incomeTypes = ['Sueldo', 'Trabajo freelance', 'Uber / transporte', 'Ventas', 'Servicios profesionales', 'Reembolso', 'Otro'];
const expenseCategories = [
  'Vivienda',
  'Comida',
  'Transporte',
  'Combustible',
  'Servicios',
  'Internet',
  'Teléfono',
  'Salud',
  'Educación',
  'Familia',
  'Deudas',
  'Tarjetas',
  'Mantenimiento vehículo',
  'Entretenimiento',
  'Emergencias',
  'Otros'
];
const methods = ['Efectivo', 'Cuenta bancaria', 'Tarjeta de débito', 'Tarjeta de crédito', 'Transferencia', 'Otro'];

export const TransactionForm = ({
  mode,
  onSave
}: {
  mode: AppMode;
  onSave: (transaction: Transaction) => void;
}) => {
  const [kind, setKind] = useState<Transaction['kind']>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Comida');
  const [description, setDescription] = useState('');
  const [expenseType, setExpenseType] = useState<Transaction['expenseType']>('variable');

  const save = () => {
    const value = Number(amount);
    if (!value || value <= 0) return;
    const stamp = nowIso();
    onSave({
      id: createId('tx'),
      mode,
      kind,
      amount: value,
      category,
      description: description || category,
      date: toDateKey(new Date()),
      method: methods[0],
      recurring: expenseType === 'fixed',
      expenseType: kind === 'expense' ? expenseType : undefined,
      createdAt: stamp,
      updatedAt: stamp
    });
    setAmount('');
    setDescription('');
  };

  const categories = kind === 'income' ? incomeTypes : expenseCategories;

  return (
    <div className="form-card">
      <div className="segmented">
        <button className={kind === 'expense' ? 'active' : ''} onClick={() => setKind('expense')} type="button">
          Gasto
        </button>
        <button className={kind === 'income' ? 'active' : ''} onClick={() => setKind('income')} type="button">
          Ingreso
        </button>
      </div>
      <label>
        Monto
        <input inputMode="decimal" onChange={(event) => setAmount(event.target.value)} placeholder="RD$ 0" value={amount} />
      </label>
      <label>
        Categoría
        <select onChange={(event) => setCategory(event.target.value)} value={category}>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      {kind === 'expense' && (
        <label>
          Tipo de gasto
          <select onChange={(event) => setExpenseType(event.target.value as Transaction['expenseType'])} value={expenseType}>
            <option value="fixed">Fijo</option>
            <option value="variable">Variable</option>
            <option value="extraordinary">Extraordinario</option>
          </select>
        </label>
      )}
      <label>
        Descripción o nota
        <input onChange={(event) => setDescription(event.target.value)} placeholder="Ej. supermercado, sueldo, gasolina" value={description} />
      </label>
      <button className="primary-btn" onClick={save} type="button">
        Registrar {kind === 'income' ? 'ingreso' : 'gasto'}
      </button>
    </div>
  );
};
