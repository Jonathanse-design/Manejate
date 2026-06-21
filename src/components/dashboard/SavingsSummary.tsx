import type { EmergencyFund, SavingsGoal } from '../../types/finance';
import { emergencyFundStatus } from '../../utils/calculations';
import { formatMoney, formatPercent } from '../../utils/formatters';

export const SavingsSummary = ({
  goals,
  emergencyFund,
  fixedExpenses,
  currency,
  privacyMode
}: {
  goals: SavingsGoal[];
  emergencyFund: EmergencyFund;
  fixedExpenses: number;
  currency: string;
  privacyMode: boolean;
}) => {
  const totalSaved = goals.reduce((total, goal) => total + goal.currentAmount, 0);
  const mainGoal = [...goals].sort((a, b) => b.targetAmount - a.targetAmount)[0];
  const emergency = emergencyFundStatus(emergencyFund, fixedExpenses);

  return (
    <article className="panel savings-summary-panel">
      <div className="section-title">
        <h3>Ahorro y emergencia</h3>
      </div>
      <div className="savings-split">
        <div>
          <span>Ahorro en metas</span>
          <strong>{formatMoney(totalSaved, currency, privacyMode)}</strong>
          <p>{mainGoal ? `${mainGoal.name}: ${formatPercent((mainGoal.currentAmount / mainGoal.targetAmount) * 100)}` : 'Crea una meta para empezar.'}</p>
          {mainGoal && (
            <div className="progress-row">
              <div><i style={{ width: `${Math.min((mainGoal.currentAmount / mainGoal.targetAmount) * 100, 100)}%` }} /></div>
            </div>
          )}
        </div>
        <div>
          <span>Fondo de emergencia</span>
          <strong>{formatMoney(emergencyFund.currentAmount, currency, privacyMode)}</strong>
          <p>Cubre {emergency.monthsCovered.toFixed(1)} meses. Estado: {emergency.status}.</p>
          <div className="progress-row">
            <div><i style={{ width: `${emergency.progress}%` }} /></div>
          </div>
        </div>
      </div>
    </article>
  );
};
