import Dexie, { type Table } from 'dexie';

import type { AppData } from '../types/finance';
import { createInitialData } from '../data/demoData';

interface AppRecord {
  id: string;
  data: AppData;
}

class FinanceDatabase extends Dexie {
  appData!: Table<AppRecord, string>;

  constructor() {
    super(['finanzas', 'control', 'pro'].join('-'));
    this.version(1).stores({
      appData: 'id'
    });
  }
}

export const db = new FinanceDatabase();

export const loadAppData = async (): Promise<AppData> => {
  const record = await db.appData.get('main');
  if (record?.data) return record.data;
  const initial = createInitialData();
  await saveAppData(initial);
  return initial;
};

export const saveAppData = async (data: AppData) => {
  await db.appData.put({ id: 'main', data });
};

export const replaceAppData = async (data: AppData) => {
  await db.transaction('rw', db.appData, async () => {
    await db.appData.clear();
    await db.appData.put({ id: 'main', data });
  });
};
