import { useState } from 'react';

import type { AppMode, SavingsContribution, SavingsGoal } from '../../types/finance';
import { toDateKey } from '../../utils/dates';
import { createId, nowIso } from '../../utils/id';

export const SavingsGoalForm = ({ mode, onSave }: { mode: AppMode; onSave: (goal: SavingsGoal) => void }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [monthly, setMonthly] = useState('');

  const save = () => {
    if (!name || !Number(target)) return;
    const stamp = nowIso();
    onSave({
      id: createId('goal'),
      mode,
      name,
      targetAmount: Number(target),
      currentAmount: 0,
      desiredMonthlyContribution: Number(monthly || 0),
      priority: 'media',
      createdAt: stamp,
      updatedAt: stamp
    });
    setName('');
    setTarget('');
    setMonthly('');
  };

  return (
    <div className="form-card">
      <label>
        Meta
        <input onChange={(event) => setName(event.target.value)} placeholder="Ej. Fondo para vehículo" value={name} />
      </label>
      <label>
        Monto objetivo
        <input inputMode="decimal" onChange={(event) => setTarget(event.target.value)} value={target} />
      </label>
      <label>
        Aporte mensual deseado
        <input inputMode="decimal" onChange={(event) => setMonthly(event.target.value)} value={monthly} />
      </label>
      <button className="primary-btn" onClick={save} type="button">
        Crear meta
      </button>
    </div>
  );
};

export const SavingsContributionForm = ({
  mode,
  goals,
  onSave
}: {
  mode: AppMode;
  goals: SavingsGoal[];
  onSave: (contribution: SavingsContribution) => void;
}) => {
  const [goalId, setGoalId] = useState(goals[0]?.id || '');
  const [amount, setAmount] = useState('');

  const save = () => {
    if (!goalId || !Number(amount)) return;
    const stamp = nowIso();
    onSave({
      id: createId('saving'),
      mode,
      goalId,
      date: toDateKey(new Date()),
      amount: Number(amount),
      source: 'Disponible',
      createdAt: stamp,
      updatedAt: stamp
    });
    setAmount('');
  };

  return (
    <div className="form-card">
      <label>
        Meta asociada
        <select onChange={(event) => setGoalId(event.target.value)} value={goalId}>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Aporte
        <input inputMode="decimal" onChange={(event) => setAmount(event.target.value)} value={amount} />
      </label>
      <button className="primary-btn" disabled={!goals.length} onClick={save} type="button">
        Registrar aporte
      </button>
    </div>
  );
};
