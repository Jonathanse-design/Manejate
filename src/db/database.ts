import Dexie, { type Table } from 'dexie';

import type { AppData } from '../types/finance';
import { createInitialData } from '../data/demoData';
import { nowIso } from '../utils/id';

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

export const normalizeAppData = (data: AppData): AppData => {
  const initial = createInitialData();
  const completed = Boolean(data.settings.hasCompletedOnboarding || data.settings.onboarding?.completed);
  return {
    ...initial,
    ...data,
    settings: {
      ...initial.settings,
      ...data.settings,
      userName: data.settings.userName || initial.settings.userName,
      country: data.settings.country || initial.settings.country,
      financialMonthStart: data.settings.financialMonthStart || data.settings.financialMonthStartDay || 1,
      financialMonthStartDay: data.settings.financialMonthStartDay || data.settings.financialMonthStart || 1,
      backupReminderEnabled: data.settings.backupReminderEnabled ?? true,
      hasCompletedOnboarding: completed,
      onboarding: {
        completed,
        completedSteps: data.settings.onboarding?.completedSteps || (completed ? ['summary'] : []),
        skippedSteps: data.settings.onboarding?.skippedSteps || [],
        lastStep: data.settings.onboarding?.lastStep || (completed ? 'summary' : 'welcome'),
        completedAt: data.settings.onboarding?.completedAt || (completed ? data.settings.updatedAt || nowIso() : undefined),
        hiddenSetupProgress: data.settings.onboarding?.hiddenSetupProgress || false
      }
    }
  };
};

export const loadAppData = async (): Promise<AppData> => {
  const record = await db.appData.get('main');
  if (record?.data) {
    const normalized = normalizeAppData(record.data);
    if (normalized !== record.data) await saveAppData(normalized);
    return normalized;
  }
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
