import { useState } from 'react';

import type { AppMode, BankProduct, CardConsumption } from '../../types/finance';
import { toDateKey } from '../../utils/dates';
import { createId, nowIso } from '../../utils/id';

export const CardConsumptionForm = ({
  mode,
  cards,
  onSave
}: {
  mode: AppMode;
  cards: BankProduct[];
  onSave: (consumption: CardConsumption) => void;
}) => {
  const [cardId, setCardId] = useState(cards[0]?.id || '');
  const [date, setDate] = useState(toDateKey(new Date()));
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Tarjetas');
  const [installments, setInstallments] = useState('1');
  const [notes, setNotes] = useState('');

  const save = () => {
    if (!cardId || !Number(amount) || Number(amount) <= 0) return;
    const stamp = nowIso();
    onSave({
      id: createId('cc'),
      mode,
      cardId,
      date,
      amount: Number(amount),
      merchant: merchant || 'Consumo tarjeta',
      category,
      installments: Number(installments) || 1,
      note: notes,
      notes,
      billingCycle: 'Actual',
      createdAt: stamp,
      updatedAt: stamp
    });
    setAmount('');
    setMerchant('');
  };

  return (
    <div className="form-card">
      <label>
        Tarjeta
        <select onChange={(event) => setCardId(event.target.value)} value={cardId}>
          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Fecha
        <input onChange={(event) => setDate(event.target.value)} type="date" value={date} />
      </label>
      <label>
        Monto
        <input inputMode="decimal" onChange={(event) => setAmount(event.target.value)} value={amount} />
      </label>
      <label>
        Comercio o descripción
        <input onChange={(event) => setMerchant(event.target.value)} value={merchant} />
      </label>
      <label>
        Categoría
        <input onChange={(event) => setCategory(event.target.value)} value={category} />
      </label>
      <label>
        Cantidad de cuotas opcional
        <input inputMode="numeric" min="1" onChange={(event) => setInstallments(event.target.value)} type="number" value={installments} />
      </label>
      <label>
        Notas
        <input onChange={(event) => setNotes(event.target.value)} value={notes} />
      </label>
      <button className="primary-btn" disabled={!cards.length} onClick={save} type="button">
        Registrar consumo
      </button>
    </div>
  );
};
