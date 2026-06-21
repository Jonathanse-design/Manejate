import { useState } from 'react';

import type { AppMode, BankProduct, ProductType } from '../../types/finance';
import { createId, nowIso } from '../../utils/id';

const toNumber = (value: string) => Number(value.replace(/[^\d.]/g, '')) || 0;
const todayKey = () => new Date().toISOString().slice(0, 10);

export const ProductForm = ({
  mode,
  currency,
  onSave
}: {
  mode: AppMode;
  currency: string;
  onSave: (product: BankProduct) => void;
}) => {
  const [type, setType] = useState<ProductType>('credit-card');
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [last4, setLast4] = useState('');
  const [balance, setBalance] = useState('');
  const [limit, setLimit] = useState('');
  const [statementBalance, setStatementBalance] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [estimatedFullPayment, setEstimatedFullPayment] = useState('');
  const [statementClosingDate, setStatementClosingDate] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [recurringClosingDay, setRecurringClosingDay] = useState('18');
  const [recurringDueDay, setRecurringDueDay] = useState('5');
  const [interestRate, setInterestRate] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [paidInstallments, setPaidInstallments] = useState('');
  const [startDate, setStartDate] = useState('');
  const [recurringPaymentDay, setRecurringPaymentDay] = useState('28');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [accountType, setAccountType] = useState('Ahorro');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const save = () => {
    setError('');
    if (!name.trim()) {
      setError('Agrega un nombre para el producto.');
      return;
    }
    if (type === 'credit-card' && toNumber(limit) <= 0) {
      setError('El límite de crédito debe ser mayor que 0.');
      return;
    }
    if (type === 'loan') {
      if (toNumber(originalAmount) <= 0 || toNumber(monthlyPayment) <= 0 || toNumber(totalInstallments) <= 0) {
        setError('Monto original, cuota mensual y cantidad total de cuotas deben ser mayores que 0.');
        return;
      }
      if (toNumber(paidInstallments) > toNumber(totalInstallments)) {
        setError('Las cuotas pagadas no pueden superar el total de cuotas.');
        return;
      }
    }

    const stamp = nowIso();
    const paid = toNumber(paidInstallments);
    const total = toNumber(totalInstallments);
    const remaining = Math.max(total - paid, 0);
    onSave({
      id: createId('product'),
      mode,
      type,
      name: name.trim(),
      bank: bank.trim(),
      bankName: bank.trim(),
      last4: last4.trim() || undefined,
      balance: toNumber(balance),
      currentBalance: toNumber(balance),
      currency,
      color: type === 'credit-card' ? '#38BDF8' : type === 'loan' ? '#7C3AED' : '#2DD4BF',
      status: 'current',
      notes: notes.trim(),
      creditLimit: type === 'credit-card' ? toNumber(limit) : undefined,
      statementBalance: type === 'credit-card' ? toNumber(statementBalance) : undefined,
      minimumPayment: type === 'credit-card' ? toNumber(minimumPayment) : undefined,
      estimatedPayment: type === 'credit-card' ? toNumber(estimatedFullPayment || balance) : undefined,
      estimatedFullPayment: type === 'credit-card' ? toNumber(estimatedFullPayment || balance) : undefined,
      statementClosingDate: type === 'credit-card' ? statementClosingDate || undefined : undefined,
      paymentDueDate: type === 'credit-card' ? paymentDueDate || undefined : undefined,
      recurringClosingDay: type === 'credit-card' ? Number(recurringClosingDay) || undefined : undefined,
      recurringDueDay: type === 'credit-card' ? Number(recurringDueDay) || undefined : undefined,
      cutDay: type === 'credit-card' ? Number(recurringClosingDay) || undefined : undefined,
      paymentDueDay: type === 'credit-card' ? Number(recurringDueDay) || undefined : undefined,
      interestRate: toNumber(interestRate) || undefined,
      originalAmount: type === 'loan' ? toNumber(originalAmount) : undefined,
      remainingBalance: type === 'loan' ? toNumber(balance) : undefined,
      monthlyPayment: type === 'loan' ? toNumber(monthlyPayment) : undefined,
      totalInstallments: type === 'loan' ? total : undefined,
      paidInstallments: type === 'loan' ? paid : undefined,
      remainingInstallments: type === 'loan' ? remaining : undefined,
      termMonths: type === 'loan' ? total : undefined,
      startDate: type === 'loan' ? startDate || todayKey() : undefined,
      recurringPaymentDay: type === 'loan' ? Number(recurringPaymentDay) || undefined : undefined,
      paymentDay: type === 'loan' ? Number(recurringPaymentDay) || undefined : undefined,
      nextPaymentDate: type === 'loan' ? nextPaymentDate || undefined : undefined,
      accountType: type === 'bank-account' ? accountType : undefined,
      createdAt: stamp,
      updatedAt: stamp
    });

    setName('');
    setBank('');
    setLast4('');
    setBalance('');
    setLimit('');
    setStatementBalance('');
    setMinimumPayment('');
    setEstimatedFullPayment('');
    setStatementClosingDate('');
    setPaymentDueDate('');
    setOriginalAmount('');
    setMonthlyPayment('');
    setTotalInstallments('');
    setPaidInstallments('');
    setStartDate('');
    setNextPaymentDate('');
    setNotes('');
  };

  return (
    <div className="form-card product-form">
      <div className="form-section">
        <h4>Agregar producto financiero</h4>
        <label>
          Tipo de producto
          <select onChange={(event) => setType(event.target.value as ProductType)} value={type}>
            <option value="credit-card">Tarjeta de crédito</option>
            <option value="loan">Préstamo</option>
            <option value="bank-account">Cuenta bancaria</option>
            <option value="other">Otro producto financiero</option>
          </select>
        </label>
      </div>

      <div className="form-section">
        <h4>Información general</h4>
        <label>
          Banco
          <input onChange={(event) => setBank(event.target.value)} placeholder="Ej. APAP" value={bank} />
        </label>
        <label>
          {type === 'credit-card' ? 'Nombre de la tarjeta' : type === 'loan' ? 'Nombre del préstamo' : 'Nombre de cuenta'}
          <input onChange={(event) => setName(event.target.value)} placeholder="Ej. Visa Clásica" value={name} />
        </label>
        {type === 'credit-card' && (
          <label>
            Últimos 4 dígitos opcional
            <input maxLength={4} onChange={(event) => setLast4(event.target.value)} placeholder="1234" value={last4} />
          </label>
        )}
        {type === 'bank-account' && (
          <label>
            Tipo de cuenta
            <select onChange={(event) => setAccountType(event.target.value)} value={accountType}>
              <option>Ahorro</option>
              <option>Corriente</option>
              <option>Nómina</option>
              <option>Inversión</option>
            </select>
          </label>
        )}
      </div>

      {type === 'credit-card' && (
        <>
          <div className="form-section">
            <h4>Límite y balance</h4>
            <label>
              Límite de crédito
              <input inputMode="decimal" onChange={(event) => setLimit(event.target.value)} placeholder="0" value={limit} />
            </label>
            <label>
              Balance actual
              <input inputMode="decimal" onChange={(event) => setBalance(event.target.value)} placeholder="0" value={balance} />
            </label>
            <label>
              Balance al corte opcional
              <input inputMode="decimal" onChange={(event) => setStatementBalance(event.target.value)} placeholder="0" value={statementBalance} />
            </label>
            <label>
              Pago mínimo
              <input inputMode="decimal" onChange={(event) => setMinimumPayment(event.target.value)} placeholder="0" value={minimumPayment} />
            </label>
            <label>
              Pago total estimado
              <input inputMode="decimal" onChange={(event) => setEstimatedFullPayment(event.target.value)} placeholder="0" value={estimatedFullPayment} />
            </label>
          </div>
          <div className="form-section">
            <h4>Fechas importantes</h4>
            <label>
              Fecha de corte
              <input onChange={(event) => setStatementClosingDate(event.target.value)} type="date" value={statementClosingDate} />
            </label>
            <label>
              Fecha límite de pago
              <input onChange={(event) => setPaymentDueDate(event.target.value)} type="date" value={paymentDueDate} />
            </label>
            <label>
              Día recurrente de corte
              <input max="28" min="1" onChange={(event) => setRecurringClosingDay(event.target.value)} type="number" value={recurringClosingDay} />
            </label>
            <label>
              Día recurrente de pago límite
              <input max="28" min="1" onChange={(event) => setRecurringDueDay(event.target.value)} type="number" value={recurringDueDay} />
            </label>
          </div>
        </>
      )}

      {type === 'loan' && (
        <>
          <div className="form-section">
            <h4>Monto y cuotas</h4>
            <label>
              Monto original
              <input inputMode="decimal" onChange={(event) => setOriginalAmount(event.target.value)} value={originalAmount} />
            </label>
            <label>
              Balance pendiente
              <input inputMode="decimal" onChange={(event) => setBalance(event.target.value)} value={balance} />
            </label>
            <label>
              Cuota mensual
              <input inputMode="decimal" onChange={(event) => setMonthlyPayment(event.target.value)} value={monthlyPayment} />
            </label>
            <label>
              Cantidad total de cuotas
              <input inputMode="numeric" onChange={(event) => setTotalInstallments(event.target.value)} value={totalInstallments} />
            </label>
            <label>
              Cuotas pagadas
              <input inputMode="numeric" onChange={(event) => setPaidInstallments(event.target.value)} value={paidInstallments} />
            </label>
          </div>
          <div className="form-section">
            <h4>Fechas importantes</h4>
            <label>
              Fecha de inicio
              <input onChange={(event) => setStartDate(event.target.value)} type="date" value={startDate} />
            </label>
            <label>
              Día recurrente de pago
              <input max="28" min="1" onChange={(event) => setRecurringPaymentDay(event.target.value)} type="number" value={recurringPaymentDay} />
            </label>
            <label>
              Próxima fecha de pago
              <input onChange={(event) => setNextPaymentDate(event.target.value)} type="date" value={nextPaymentDate} />
            </label>
          </div>
        </>
      )}

      {(type === 'bank-account' || type === 'other') && (
        <div className="form-section">
          <h4>Balance</h4>
          <label>
            Balance actual
            <input inputMode="decimal" onChange={(event) => setBalance(event.target.value)} value={balance} />
          </label>
        </div>
      )}

      <div className="form-section">
        <h4>Detalles opcionales</h4>
        {(type === 'credit-card' || type === 'loan') && (
          <label>
            Tasa de interés
            <input inputMode="decimal" onChange={(event) => setInterestRate(event.target.value)} placeholder="Ej. 18" value={interestRate} />
          </label>
        )}
        <label>
          Notas
          <input onChange={(event) => setNotes(event.target.value)} placeholder="Detalles importantes" value={notes} />
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}
      <button className="primary-btn" onClick={save} type="button">
        Guardar producto
      </button>
    </div>
  );
};
