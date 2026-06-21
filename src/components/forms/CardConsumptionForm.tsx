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
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Tarjetas');

  const save = () => {
    if (!cardId || !Number(amount)) return;
    const stamp = nowIso();
    onSave({
      id: createId('cc'),
      mode,
      cardId,
      date: toDateKey(new Date()),
      amount: Number(amount),
      merchant: merchant || 'Consumo tarjeta',
      category,
      installments: 1,
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
      <button className="primary-btn" disabled={!cards.length} onClick={save} type="button">
        Registrar consumo
      </button>
    </div>
  );
};
