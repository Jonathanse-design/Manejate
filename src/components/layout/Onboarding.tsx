import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Database,
  Landmark,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  WalletCards
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { useFinance, type OnboardingFlowPayload } from '../../store/financeStore';
import type { AppMode, BankProduct, EmergencyFund, OnboardingStep } from '../../types/finance';

const steps: { key: OnboardingStep; title: string; eyebrow: string }[] = [
  { key: 'welcome', title: 'Configura Manéjate', eyebrow: 'Bienvenida' },
  { key: 'personal', title: 'Tu punto de partida', eyebrow: 'Datos personales' },
  { key: 'income', title: 'Cuánto entra cada mes', eyebrow: 'Ingresos' },
  { key: 'expenses', title: 'Tus compromisos fijos', eyebrow: 'Gastos fijos' },
  { key: 'banking', title: 'Productos bancarios', eyebrow: 'Bancos y tarjetas' },
  { key: 'savings', title: 'Define una meta', eyebrow: 'Ahorro' },
  { key: 'emergency', title: 'Tu colchón financiero', eyebrow: 'Emergencia' },
  { key: 'backup', title: 'Protege tus datos', eyebrow: 'Respaldo' },
  { key: 'summary', title: 'Listo para tomar control', eyebrow: 'Resumen' }
];

type FixedExpenseDraft = { name: string; amount: string };

const defaultExpenses: FixedExpenseDraft[] = [
  { name: 'Alquiler / vivienda', amount: '' },
  { name: 'Servicios', amount: '' },
  { name: 'Transporte', amount: '' }
];

const toNumber = (value: string) => Number(value.replace(/[^\d.]/g, '')) || 0;

export const Onboarding = ({ onStart }: { onStart?: (mode: AppMode) => void }) => {
  const { completeOnboardingFlow } = useFinance();
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<AppMode>('real');
  const [userName, setUserName] = useState('Jonathan');
  const [currency, setCurrency] = useState('RD$');
  const [country, setCountry] = useState('República Dominicana');
  const [monthStart, setMonthStart] = useState('1');
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState<FixedExpenseDraft[]>(defaultExpenses);
  const [productType, setProductType] = useState<BankProduct['type']>('bank-account');
  const [productName, setProductName] = useState('');
  const [productBank, setProductBank] = useState('');
  const [productBalance, setProductBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [cutDay, setCutDay] = useState('18');
  const [paymentDueDay, setPaymentDueDay] = useState('5');
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalMonthly, setGoalMonthly] = useState('');
  const [fundCurrent, setFundCurrent] = useState('');
  const [fundTarget, setFundTarget] = useState('');
  const [fundMonthly, setFundMonthly] = useState('');
  const [fundMonths, setFundMonths] = useState<EmergencyFund['selectedMonths']>(3);
  const [backupReminder, setBackupReminder] = useState(true);
  const [skippedSteps, setSkippedSteps] = useState<string[]>([]);

  const step = steps[index];
  const progress = Math.round(((index + 1) / steps.length) * 100);
  const isLast = index === steps.length - 1;
  const completedSteps = useMemo(() => steps.slice(0, index + 1).map((item) => item.key), [index]);
  const totalFixed = expenses.reduce((total, expense) => total + toNumber(expense.amount), 0);

  const next = () => setIndex((current) => Math.min(current + 1, steps.length - 1));
  const previous = () => setIndex((current) => Math.max(current - 1, 0));
  const skip = () => {
    setSkippedSteps((current) => [...new Set([...current, step.key])]);
    next();
  };

  const finish = () => {
    const payload: OnboardingFlowPayload = {
      mode,
      userName,
      currency,
      country,
      financialMonthStartDay: Number(monthStart) || 1,
      estimatedMonthlyIncome: toNumber(income) || undefined,
      fixedExpenses: expenses.map((expense) => ({ name: expense.name, amount: toNumber(expense.amount) })),
      bankProduct: productName
        ? {
            type: productType,
            name: productName,
            bank: productBank,
            balance: toNumber(productBalance),
            creditLimit: productType === 'credit-card' ? toNumber(creditLimit) : undefined,
            cutDay: productType === 'credit-card' ? Number(cutDay) || 18 : undefined,
            paymentDueDay: productType === 'credit-card' ? Number(paymentDueDay) || 5 : undefined
          }
        : undefined,
      savingsGoal: goalName
        ? {
            name: goalName,
            targetAmount: toNumber(goalTarget),
            currentAmount: toNumber(goalCurrent),
            monthlyContribution: toNumber(goalMonthly)
          }
        : undefined,
      emergencyFund: {
        currentAmount: toNumber(fundCurrent),
        targetAmount: toNumber(fundTarget),
        monthlyContribution: toNumber(fundMonthly),
        selectedMonths: fundMonths
      },
      backupReminderEnabled: backupReminder,
      completedSteps: steps.map((item) => item.key),
      skippedSteps
    };
    completeOnboardingFlow(payload);
    onStart?.(mode);
  };

  const updateExpense = (position: number, key: keyof FixedExpenseDraft, value: string) => {
    setExpenses((current) => current.map((expense, index) => (index === position ? { ...expense, [key]: value } : expense)));
  };

  return (
    <section className="onboarding">
      <div className="onboarding-shell">
        <aside className="onboarding-side">
          <img src="./assets/logo-manejate-dark.svg" alt="Manéjate" />
          <div>
            <p className="eyebrow">Primera configuración</p>
            <h1>Configura Manéjate</h1>
            <p>Un recorrido corto para que el dashboard entienda tus ingresos, pagos, metas y respaldo.</p>
          </div>
          <div className="wizard-progress" aria-label={`Progreso ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <ol className="wizard-steps">
            {steps.map((item, stepIndex) => (
              <li className={stepIndex <= index ? 'active' : ''} key={item.key}>
                <CheckCircle2 size={16} />
                {item.eyebrow}
              </li>
            ))}
          </ol>
        </aside>

        <main className="onboarding-card wizard-card">
          <p className="eyebrow">{step.eyebrow}</p>
          <h2>{step.title}</h2>

          {step.key === 'welcome' && (
            <div className="wizard-choice-grid">
              <button className={mode === 'real' ? 'selected' : ''} onClick={() => setMode('real')} type="button">
                <Database />
                <strong>Empezar con mis datos reales</strong>
                <span>Manéjate crea una base limpia y solo muestra lo que registres.</span>
              </button>
              <button className={mode === 'demo' ? 'selected' : ''} onClick={() => setMode('demo')} type="button">
                <Sparkles />
                <strong>Explorar con datos demo</strong>
                <span>Usa datos ficticios para probar la experiencia sin tocar tus finanzas.</span>
              </button>
            </div>
          )}

          {step.key === 'personal' && (
            <div className="wizard-form-grid">
              <label>
                Nombre
                <input value={userName} onChange={(event) => setUserName(event.target.value)} />
              </label>
              <label>
                País
                <input value={country} onChange={(event) => setCountry(event.target.value)} />
              </label>
              <label>
                Moneda
                <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
                  <option>RD$</option>
                  <option>US$</option>
                  <option>€</option>
                  <option>$</option>
                </select>
              </label>
              <label>
                Día de inicio del mes financiero
                <input min="1" max="28" type="number" value={monthStart} onChange={(event) => setMonthStart(event.target.value)} />
              </label>
            </div>
          )}

          {step.key === 'income' && (
            <div className="wizard-focus">
              <WalletCards />
              <label>
                Ingreso mensual estimado
                <input inputMode="decimal" placeholder="Ej. 65000" value={income} onChange={(event) => setIncome(event.target.value)} />
              </label>
              <p>Esto alimenta tus KPIs y ayuda a calcular si el mes va saludable, ajustado o crítico.</p>
            </div>
          )}

          {step.key === 'expenses' && (
            <div className="wizard-expenses">
              {expenses.map((expense, expenseIndex) => (
                <div className="expense-row" key={expenseIndex}>
                  <input value={expense.name} onChange={(event) => updateExpense(expenseIndex, 'name', event.target.value)} />
                  <input
                    inputMode="decimal"
                    placeholder="Monto"
                    value={expense.amount}
                    onChange={(event) => updateExpense(expenseIndex, 'amount', event.target.value)}
                  />
                </div>
              ))}
              <div className="wizard-total">
                <span>Total fijo estimado</span>
                <strong>{currency} {totalFixed.toLocaleString('es-DO')}</strong>
              </div>
            </div>
          )}

          {step.key === 'banking' && (
            <div className="wizard-form-grid">
              <label>
                Tipo de producto
                <select value={productType} onChange={(event) => setProductType(event.target.value as BankProduct['type'])}>
                  <option value="bank-account">Cuenta bancaria</option>
                  <option value="credit-card">Tarjeta de crédito</option>
                  <option value="loan">Préstamo</option>
                  <option value="other">Otro</option>
                </select>
              </label>
              <label>
                Nombre
                <input placeholder="Ej. Cuenta nómina" value={productName} onChange={(event) => setProductName(event.target.value)} />
              </label>
              <label>
                Banco
                <input placeholder="Ej. Banco Popular" value={productBank} onChange={(event) => setProductBank(event.target.value)} />
              </label>
              <label>
                Balance actual
                <input inputMode="decimal" value={productBalance} onChange={(event) => setProductBalance(event.target.value)} />
              </label>
              {productType === 'credit-card' && (
                <>
                  <label>
                    Límite
                    <input inputMode="decimal" value={creditLimit} onChange={(event) => setCreditLimit(event.target.value)} />
                  </label>
                  <label>
                    Corte
                    <input min="1" max="28" type="number" value={cutDay} onChange={(event) => setCutDay(event.target.value)} />
                  </label>
                  <label>
                    Fecha límite de pago
                    <input min="1" max="28" type="number" value={paymentDueDay} onChange={(event) => setPaymentDueDay(event.target.value)} />
                  </label>
                </>
              )}
            </div>
          )}

          {step.key === 'savings' && (
            <div className="wizard-form-grid">
              <label>
                Meta principal
                <input placeholder="Ej. Fondo para vehículo" value={goalName} onChange={(event) => setGoalName(event.target.value)} />
              </label>
              <label>
                Meta total
                <input inputMode="decimal" value={goalTarget} onChange={(event) => setGoalTarget(event.target.value)} />
              </label>
              <label>
                Ya ahorrado
                <input inputMode="decimal" value={goalCurrent} onChange={(event) => setGoalCurrent(event.target.value)} />
              </label>
              <label>
                Aporte mensual deseado
                <input inputMode="decimal" value={goalMonthly} onChange={(event) => setGoalMonthly(event.target.value)} />
              </label>
            </div>
          )}

          {step.key === 'emergency' && (
            <div className="wizard-form-grid">
              <label>
                Fondo actual
                <input inputMode="decimal" value={fundCurrent} onChange={(event) => setFundCurrent(event.target.value)} />
              </label>
              <label>
                Meta del fondo
                <input inputMode="decimal" value={fundTarget} onChange={(event) => setFundTarget(event.target.value)} />
              </label>
              <label>
                Aporte mensual
                <input inputMode="decimal" value={fundMonthly} onChange={(event) => setFundMonthly(event.target.value)} />
              </label>
              <label>
                Meses que quieres cubrir
                <select value={fundMonths} onChange={(event) => setFundMonths(Number(event.target.value) as EmergencyFund['selectedMonths'])}>
                  <option value={1}>1 mes</option>
                  <option value={3}>3 meses</option>
                  <option value={6}>6 meses</option>
                </select>
              </label>
            </div>
          )}

          {step.key === 'backup' && (
            <div className="wizard-focus backup-choice">
              <ShieldCheck />
              <strong>Tu información se queda local en este dispositivo.</strong>
              <p>Activa recordatorios para exportar un respaldo cuando actualices tus finanzas.</p>
              <label className="toggle-row">
                <input checked={backupReminder} onChange={(event) => setBackupReminder(event.target.checked)} type="checkbox" />
                Recordarme crear respaldos
              </label>
            </div>
          )}

          {step.key === 'summary' && (
            <div className="wizard-summary">
              <div><Landmark /><span>Modo</span><strong>{mode === 'demo' ? 'Demo' : 'Real'}</strong></div>
              <div><WalletCards /><span>Ingreso estimado</span><strong>{toNumber(income) ? `${currency} ${toNumber(income).toLocaleString('es-DO')}` : 'Pendiente'}</strong></div>
              <div><PiggyBank /><span>Meta principal</span><strong>{goalName || 'Pendiente'}</strong></div>
              <p>Podrás ajustar todo después desde cada módulo. Este inicio solo deja el dashboard con mejores señales.</p>
            </div>
          )}

          <div className="wizard-actions">
            <button disabled={index === 0} onClick={previous} type="button">
              <ArrowLeft size={17} />
              Atrás
            </button>
            {!isLast && step.key !== 'welcome' && (
              <button className="ghost-btn" onClick={skip} type="button">
                Saltar por ahora
              </button>
            )}
            <button className="primary-btn" onClick={isLast ? finish : next} type="button">
              {isLast ? 'Entrar a Manéjate' : 'Continuar'}
              {!isLast && <ArrowRight size={17} />}
            </button>
          </div>
        </main>
      </div>
    </section>
  );
};
