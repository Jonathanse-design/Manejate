import { useState } from 'react';

import { SavingsContributionForm, SavingsGoalForm } from '../components/forms/SavingsForm';
import { useFinance } from '../store/financeStore';
import type { EmergencyFund } from '../types/finance';
import { activeData, emergencyFundStatus, totalsForPeriod } from '../utils/calculations';
import { currentMonthPeriod } from '../utils/dates';
import { formatMoney, formatPercent } from '../utils/formatters';
import { nowIso } from '../utils/id';

export const Savings = () => {
  const { data, addSavingsGoal, addSavingsContribution, updateEmergencyFund } = useFinance();
  const [months, setMonths] = useState<1 | 3 | 6>(3);
  if (!data) return null;
  const active = activeData(data);
  const totals = totalsForPeriod(active.transactions, currentMonthPeriod());
  const emergency = emergencyFundStatus(active.emergencyFund, totals.fixed);
  const currency = data.settings.currency;
  const privacy = data.settings.privacyMode;

  const applySuggestedFund = () => {
    const target = totals.fixed * months;
    const next: EmergencyFund = {
      ...active.emergencyFund,
      selectedMonths: months,
      targetAmount: target,
      updatedAt: nowIso()
    };
    updateEmergencyFund(next);
  };

  return (
    <div className="two-column">
      <section>
        <div className="section-title">
          <h2>Ahorros</h2>
          <span>{active.savingsGoals.length} metas</span>
        </div>
        <article className="emergency-panel">
          <div>
            <p className="eyebrow">Fondo de emergencia</p>
            <h3>{formatMoney(active.emergencyFund.currentAmount, currency, privacy)}</h3>
            <p>Estado: {emergency.status}. Cubre {emergency.monthsCovered.toFixed(1)} meses de gastos fijos.</p>
          </div>
          <div className="progress-circle">
            <strong>{formatPercent(emergency.progress)}</strong>
            <span>de la meta</span>
          </div>
          <div className="fund-grid">
            <span>Meta: {formatMoney(emergency.target, currency, privacy)}</span>
            <span>Restante: {formatMoney(emergency.remaining, currency, privacy)}</span>
            <span>Mensual necesario: {formatMoney(emergency.monthlyNeeded, currency, privacy)}</span>
            <span>Semanal necesario: {formatMoney(emergency.weeklyNeeded, currency, privacy)}</span>
            <span>Diario necesario: {formatMoney(emergency.dailyNeeded, currency, privacy)}</span>
          </div>
          <div className="inline-controls">
            <select onChange={(event) => setMonths(Number(event.target.value) as 1 | 3 | 6)} value={months}>
              <option value={1}>1 mes de gastos fijos</option>
              <option value={3}>3 meses de gastos fijos</option>
              <option value={6}>6 meses de gastos fijos</option>
            </select>
            <button className="secondary-btn" onClick={applySuggestedFund} type="button">
              Aplicar meta sugerida
            </button>
          </div>
        </article>

        <div className="card-grid">
          {active.savingsGoals.map((goal) => {
            const progress = goal.targetAmount ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            return (
              <article className="goal-card" key={goal.id}>
                <span>{goal.priority}</span>
                <h3>{goal.name}</h3>
                <strong>{formatMoney(goal.currentAmount, currency, privacy)} / {formatMoney(goal.targetAmount, currency, privacy)}</strong>
                <div className="progress-row">
                  <div><i style={{ width: `${Math.min(progress, 100)}%` }} /></div>
                </div>
                <p>{formatPercent(progress)} completado</p>
              </article>
            );
          })}
        </div>
      </section>
      <aside>
        <h3>Nueva meta</h3>
        <SavingsGoalForm mode={active.mode} onSave={addSavingsGoal} />
        <h3>Registrar aporte</h3>
        <SavingsContributionForm goals={active.savingsGoals} mode={active.mode} onSave={addSavingsContribution} />
      </aside>
    </div>
  );
};
