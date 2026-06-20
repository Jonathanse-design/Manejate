export const formatMoney = (amount: number, currency = 'RD$', privacyMode = false) => {
  if (privacyMode) return `${currency} ******`;
  return `${currency} ${new Intl.NumberFormat('es-DO', {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount || 0)}`;
};

export const formatPercent = (value: number) =>
  `${new Intl.NumberFormat('es-DO', { maximumFractionDigits: 1 }).format(value || 0)}%`;

export const toCsv = (rows: object[]) => {
  if (!rows.length) return '';
  const normalizedRows = rows as Record<string, unknown>[];
  const headers = Object.keys(normalizedRows[0]);
  const escape = (value: unknown) => {
    const raw = String(value ?? '');
    return `"${raw.replace(/"/g, '""')}"`;
  };
  return [headers.join(','), ...normalizedRows.map((row) => headers.map((key) => escape(row[key])).join(','))].join('\n');
};
