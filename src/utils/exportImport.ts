import type { AppData } from '../types/finance';
import { toCsv } from './formatters';

export const validateImportData = (value: unknown): value is AppData => {
  if (!value || typeof value !== 'object') return false;
  const data = value as AppData;
  return Boolean(
    data.version &&
      data.settings &&
      Array.isArray(data.transactions) &&
      Array.isArray(data.products) &&
      Array.isArray(data.cardConsumptions) &&
      Array.isArray(data.savingsGoals) &&
      data.emergencyFund
  );
};

export const downloadTextFile = (filename: string, content: string, type = 'application/json') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const backupFilename = () => {
  const date = new Date().toISOString().slice(0, 10);
  return `manejate-backup-${date}.json`;
};

export const exportFullBackup = (data: AppData) =>
  downloadTextFile(backupFilename(), JSON.stringify(data, null, 2));

export const exportTransactionsCsv = (data: AppData) =>
  downloadTextFile('manejate-movimientos.csv', toCsv(data.transactions), 'text/csv;charset=utf-8');

export const exportCardConsumptionsCsv = (data: AppData) =>
  downloadTextFile('manejate-consumos-tarjetas.csv', toCsv(data.cardConsumptions), 'text/csv;charset=utf-8');

export const exportProductsCsv = (data: AppData) =>
  downloadTextFile('manejate-productos-bancarios.csv', toCsv(data.products), 'text/csv;charset=utf-8');
