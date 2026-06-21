import { useState } from 'react';

import type { AppMode, BankProduct, ProductType } from '../../types/finance';
import { createId, nowIso } from '../../utils/id';

const toAmount = (value: string) => Number(value.replace(/[^\d.]/g, '')) || 0;

export const ProductForm = ({
  mode,
  currency = 'RD$',
  onSave
}: {
  mode: AppMode;
  currency?: string;
  onSave: (product: BankProduct) => void;
}) => {
  const [type, setType] = useState<ProductType>('credit-card');
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [balance, setBalance] = useState('');
  const [limit, setLimit] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [estimatedPayment, setEstimatedPayment] = useState('');
  const [statementClosingDate, setStatementClosingDate] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [paidInstallments, setPaidInstallments] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [error, setError] = useState('');

  const save = () => {
    setError('');
    if (!bank.trim() || !name.trim()) {
      setError('Agrega banco y nombre del producto.');
      return;
    }
    if (type === 'credit-card' && toAmount(limit) <= 0) {
      setError('La tarjeta necesita un límite mayor que cero.');
      return;
    }
    if (type === 'loan') {
      const total = Number(totalInstallments || 0);
      const paid = Number(paidInstallments || 0);
      if (toAmount(originalAmount) <= 0 || toAmount(monthlyPayment) <= 0 || total <= 0) {
        setError('El préstamo necesita monto original, cuota mensual y cantidad total de cuotas.');
        return;
      }
      if (paid > total) {
        setError('Las cuotas pagadas no pueden superar el total.');
        return;
      }
    }

    const stamp = nowIso();
    const total = Number(totalInstallments || 0);
    const paid = Number(paidInstallments || 0);
    onSave({
      id: createId('product'),
      mode,
      type,
      name: name.trim(),
      bank: bank.trim(),
      balance: toAmount(balance),
      currency,
      color: type === 'credit-card' ? '#0057FF' : type === 'loan' ? '#7B2CFF' : '#FF7A00',
      creditLimit: type === 'credit-card' ? toAmount(limit) : undefined,
      statementClosingDate: type === 'credit-card' ? statementClosingDate || undefined : undefined,
      paymentDueDate: type === 'credit-card' ? paymentDueDate || undefined : undefined,
      cutDay: type === 'credit-card' && statementClosingDate ? Number(statementClosingDate.slice(-2)) : undefined,
      paymentDueDay: type === 'credit-card' && paymentDueDate ? Number(paymentDueDate.slice(-2)) : undefined,
      minimumPayment: type === 'credit-card' ? toAmount(minimumPayment) : undefined,
      estimatedPayment: type === 'credit-card' ? toAmount(estimatedPayment || balance) : undefined,
      estimatedFullPayment: type === 'credit-card' ? toAmount(estimatedPayment || balance) : undefined,
      originalAmount: type === 'loan' ? toAmount(originalAmount) : undefined,
      monthlyPayment: type === 'loan' ? toAmount(monthlyPayment) : undefined,
      totalInstallments: type === 'loan' ? total : undefined,
      paidInstallments: type === 'loan' ? paid : undefined,
      termMonths: type === 'loan' ? total : undefined,
      nextPaymentDate: type === 'loan' ? nextPaymentDate || undefined : undefined,
      paymentDay: type === 'loan' && nextPaymentDate ? Number(nextPaymentDate.slice(-2)) : undefined,
      createdAt: stamp,
      updatedAt: stamp
    });

    setName('');
    setBank('');
    setBalance('');
    setLimit('');
    setMinimumPayment('');
    setEstimatedPayment('');
    setStatementClosingDate('');
    setPaymentDueDate('');
    setOriginalAmount('');
    setMonthlyPayment('');
    setTotalInstallments('');
    setPaidInstallments('');
    setNextPaymentDate('');
  };

  return (
    <div className="form-card product-form">
      <div className="segmented three">
        <button className={type === 'credit-card' ? 'active' : ''} onClick={() => setType('credit-card')} type="button">
          Tarjeta
        </button>
        <button className={type === 'loan' ? 'active' : ''} onClick={() => setType('loan')} type="button">
          Préstamo
        </button>
        <button className={type === 'bank-account' ? 'active' : ''} onClick={() => setType('bank-account')} type="button">
          Cuenta
        </button>
      </div>

      <div className="form-section">
        <h4>Información general</h4>
        <label>Banco<input onChange={(event) => setBank(event.target.value)} placeholder="Ej. APAP" value={bank} /></label>
        <label>Nombre<input onChange={(event) => setName(event.target.value)} placeholder="Ej. Visa Clásica" value={name} /></label>
        <label>Balance actual<input inputMode="decimal" onChange={(event) => setBalance(event.target.value)} placeholder="0" value={balance} /></label>
      </div>

      {type === 'credit-card' && (
        <div className="form-section">
          <h4>Tarjeta de crédito</h4>
          <label>Límite de crédito<input inputMode="decimal" onChange={(event) => setLimit(event.target.value)} placeholder="0" value={limit} /></label>
          <label>Fecha de corte<input onChange={(event) => setStatementClosingDate(event.target.value)} type="date" value={statementClosingDate} /></label>
          <label>Fecha límite de pago<input onChange={(event) => setPaymentDueDate(event.target.value)} type="date" value={paymentDueDate} /></label>
          <label>Pago mínimo<input inputMode="decimal" onChange={(event) => setMinimumPayment(event.target.value)} placeholder="0" value={minimumPayment} /></label>
          <label>Pago total estimado<input inputMode="decimal" onChange={(event) => setEstimatedPayment(event.target.value)} placeholder="0" value={estimatedPayment} /></label>
        </div>
      )}

      {type === 'loan' && (
        <div className="form-section">
          <h4>Préstamo</h4>
          <label>Monto original<input inputMode="decimal" onChange={(event) => setOriginalAmount(event.target.value)} placeholder="0" value={originalAmount} /></label>
          <label>Cuota mensual<input inputMode="decimal" onChange={(event) => setMonthlyPayment(event.target.value)} placeholder="0" value={monthlyPayment} /></label>
          <label>Cantidad total de cuotas<input inputMode="numeric" onChange={(event) => setTotalInstallments(event.target.value)} placeholder="36" value={totalInstallments} /></label>
          <label>Cuotas pagadas<input inputMode="numeric" onChange={(event) => setPaidInstallments(event.target.value)} placeholder="0" value={paidInstallments} /></label>
          <label>Próxima fecha de pago<input onChange={(event) => setNextPaymentDate(event.target.value)} type="date" value={nextPaymentDate} /></label>
        </div>
      )}

      {error && <p className="form-error">{error}</p>}
      <button className="primary-btn" onClick={save} type="button">
        Guardar producto
      </button>
    </div>
  );
};
