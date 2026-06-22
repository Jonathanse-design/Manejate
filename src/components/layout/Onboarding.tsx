import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Database,
  Landmark,
  PiggyBank,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  WalletCards
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { useFinance, type OnboardingFlowPayload } from '../../store/financeStore';
import type { AppMode, BankProduct, EmergencyFund, OnboardingStep } from '../../types/finance';

const steps: { key: OnboardingStep; title: string; eyebrow: string }[] = [
  { key: 'welcome', title: 'Personaliza tu dashboard financiero', eyebrow: 'Bienvenida' },
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
type ProductDraft = {
  id: string;
  type: BankProduct['type'];
  name: string;
  bank: string;
  balance: string;
  creditLimit: string;
  cutDay: string;
  paymentDueDay: string;
  minimumPayment: string;
  estimatedFullPayment: string;
  originalAmount: string;
  monthlyPayment: string;
  totalInstallments: string;
  paidInstallments: string;
  nextPaymentDate: string;
};

const defaultExpenses: FixedExpenseDraft[] = [
  { name: 'Alquiler / vivienda', amount: '' },
  { name: 'Comida básica', amount: '' },
  { name: 'Energía eléctrica', amount: '' },
  { name: 'Internet', amount: '' },
  { name: 'Teléfono', amount: '' },
  { name: 'Transporte / combustible', amount: '' },
  { name: 'Préstamos', amount: '' },
  { name: 'Tarjetas', amount: '' }
];

const toNumber = (value: string) => Number(value.replace(/[^\d.]/g, '')) || 0;
const newProduct = (type: BankProduct['type'] = 'credit-card'): ProductDraft => ({
  id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
  type,
  name: '',
  bank: '',
  balance: '',
  creditLimit: '',
  cutDay: '18',
  paymentDueDay: '5',
  minimumPayment: '',
  estimatedFullPayment: '',
  originalAmount: '',
  monthlyPayment: '',
  totalInstallments: '',
  paidInstallments: '',
  nextPaymentDate: ''
});

export const Onboarding = ({ onStart }: { onStart?: (mode: AppMode) => void }) => {
  const { completeOnboardingFlow } = useFinance();
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<AppMode>('real');
  const [userName, setUserName] = useState('');
  const [currency, setCurrency] = useState('RD$');
  const [country, setCountry] = useState('República Dominicana');
  const [monthStart, setMonthStart] = useState('1');
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState<FixedExpenseDraft[]>(defaultExpenses);
  const [products, setProducts] = useState<ProductDraft[]>([newProduct('credit-card')]);
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
  const suggestedEmergencyTarget = totalFixed * fundMonths;
  const configuredProducts = products.filter((product) => product.name.trim() || product.bank.trim());

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
      bankProducts: products
        .filter((product) => product.name.trim())
        .map((product) => ({
          type: product.type,
          name: product.name.trim(),
          bank: product.bank.trim(),
          balance: toNumber(product.balance),
          creditLimit: product.type === 'credit-card' ? toNumber(product.creditLimit) : undefined,
          cutDay: product.type === 'credit-card' ? Number(product.cutDay) || 18 : undefined,
          paymentDueDay: product.type === 'credit-card' ? Number(product.paymentDueDay) || 5 : undefined,
          minimumPayment: product.type === 'credit-card' ? toNumber(product.minimumPayment) : undefined,
          estimatedFullPayment: product.type === 'credit-card' ? toNumber(product.estimatedFullPayment || product.balance) : undefined,
          originalAmount: product.type === 'loan' ? toNumber(product.originalAmount) : undefined,
          monthlyPayment: product.type === 'loan' ? toNumber(product.monthlyPayment) : undefined,
          totalInstallments: product.type === 'loan' ? Number(product.totalInstallments || 0) : undefined,
          paidInstallments: product.type === 'loan' ? Number(product.paidInstallments || 0) : undefined,
          nextPaymentDate: product.type === 'loan' ? product.nextPaymentDate || undefined : undefined
        })),
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
        targetAmount: toNumber(fundTarget) || suggestedEmergencyTarget,
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
  const updateProduct = (id: string, key: keyof ProductDraft, value: string) => {
    setProducts((current) => current.map((product) => (product.id === id ? { ...product, [key]: value } : product)));
  };

  return (
    <section className="onboarding">
      <div className="onboarding-shell">
        <aside className="onboarding-side">
          <img className="brand-logo" src="./assets/logo-manejate-dark.svg" alt="Manéjate" />
          <div>
            <p className="eyebrow">Primera configuración</p>
            <h1>Personaliza tu dashboard financiero</h1>
            <p>Un recorrido corto para que Manéjate entienda tus ingresos, pagos, productos, metas y respaldo.</p>
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
                <input placeholder="Tu nombre visible" value={userName} onChange={(event) => setUserName(event.target.value)} />
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
              <div className="wizard-form-grid compact">
                <label>
                  Fuente principal
                  <select defaultValue="Sueldo">
                    <option>Sueldo</option>
                    <option>Freelance</option>
                    <option>Uber / transporte</option>
                    <option>Servicios profesionales</option>
                    <option>Ventas</option>
                    <option>Otro</option>
                  </select>
                </label>
                <label>
                  Frecuencia
                  <select defaultValue="Mensual">
                    <option>Mensual</option>
                    <option>Quincenal</option>
                    <option>Semanal</option>
                    <option>Variable</option>
                  </select>
                </label>
              </div>
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
            <div className="wizard-products">
              {products.map((product, productIndex) => (
                <article className="wizard-product-card" key={product.id}>
                  <div className="card-heading-row">
                    <strong>Producto {productIndex + 1}</strong>
                    {products.length > 1 && (
                      <button className="icon-button" onClick={() => setProducts((current) => current.filter((item) => item.id !== product.id))} type="button" aria-label="Eliminar producto">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="wizard-form-grid">
                    <label>
                      Tipo
                      <select value={product.type} onChange={(event) => updateProduct(product.id, 'type', event.target.value)}>
                        <option value="credit-card">Tarjeta de crédito</option>
                        <option value="loan">Préstamo</option>
                        <option value="bank-account">Cuenta bancaria</option>
                      </select>
                    </label>
                    <label>
                      Banco / entidad
                      <input placeholder="Ej. Banco Popular" value={product.bank} onChange={(event) => updateProduct(product.id, 'bank', event.target.value)} />
                    </label>
                    <label>
                      Nombre
                      <input placeholder="Ej. Visa Clásica" value={product.name} onChange={(event) => updateProduct(product.id, 'name', event.target.value)} />
                    </label>
                    <label>
                      Balance actual
                      <input inputMode="decimal" value={product.balance} onChange={(event) => updateProduct(product.id, 'balance', event.target.value)} />
                    </label>
                    {product.type === 'credit-card' && (
                      <>
                        <label>Límite de crédito<input inputMode="decimal" value={product.creditLimit} onChange={(event) => updateProduct(product.id, 'creditLimit', event.target.value)} /></label>
                        <label>Pago mínimo<input inputMode="decimal" value={product.minimumPayment} onChange={(event) => updateProduct(product.id, 'minimumPayment', event.target.value)} /></label>
                        <label>Pago total estimado<input inputMode="decimal" value={product.estimatedFullPayment} onChange={(event) => updateProduct(product.id, 'estimatedFullPayment', event.target.value)} /></label>
                        <label>Día de corte<input min="1" max="28" type="number" value={product.cutDay} onChange={(event) => updateProduct(product.id, 'cutDay', event.target.value)} /></label>
                        <label>Fecha límite de pago<input min="1" max="28" type="number" value={product.paymentDueDay} onChange={(event) => updateProduct(product.id, 'paymentDueDay', event.target.value)} /></label>
                      </>
                    )}
                    {product.type === 'loan' && (
                      <>
                        <label>Monto original<input inputMode="decimal" value={product.originalAmount} onChange={(event) => updateProduct(product.id, 'originalAmount', event.target.value)} /></label>
                        <label>Cuota mensual<input inputMode="decimal" value={product.monthlyPayment} onChange={(event) => updateProduct(product.id, 'monthlyPayment', event.target.value)} /></label>
                        <label>Total de cuotas<input inputMode="numeric" value={product.totalInstallments} onChange={(event) => updateProduct(product.id, 'totalInstallments', event.target.value)} /></label>
                        <label>Cuotas pagadas<input inputMode="numeric" value={product.paidInstallments} onChange={(event) => updateProduct(product.id, 'paidInstallments', event.target.value)} /></label>
                        <label>Próxima fecha de pago<input type="date" value={product.nextPaymentDate} onChange={(event) => updateProduct(product.id, 'nextPaymentDate', event.target.value)} /></label>
                      </>
                    )}
                  </div>
                </article>
              ))}
              <button className="secondary-btn" onClick={() => setProducts((current) => [...current, newProduct('bank-account')])} type="button">
                <Plus size={17} />
                Agregar otro producto
              </button>
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
                <input inputMode="decimal" placeholder={suggestedEmergencyTarget ? `${suggestedEmergencyTarget}` : '0'} value={fundTarget} onChange={(event) => setFundTarget(event.target.value)} />
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
              <div className="wizard-total">
                <span>Meta sugerida</span>
                <strong>{currency} {suggestedEmergencyTarget.toLocaleString('es-DO')}</strong>
              </div>
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
              <div><Database /><span>Gastos fijos</span><strong>{currency} {totalFixed.toLocaleString('es-DO')}</strong></div>
              <div><Landmark /><span>Productos</span><strong>{configuredProducts.length}</strong></div>
              <div><PiggyBank /><span>Meta principal</span><strong>{goalName || 'Pendiente'}</strong></div>
              <div><ShieldCheck /><span>Emergencia</span><strong>{currency} {(toNumber(fundTarget) || suggestedEmergencyTarget).toLocaleString('es-DO')}</strong></div>
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
              {isLast ? 'Ir a mi dashboard' : 'Continuar'}
              {!isLast && <ArrowRight size={17} />}
            </button>
          </div>
        </main>
      </div>
    </section>
  );
};
