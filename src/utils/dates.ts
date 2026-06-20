import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  subMonths
} from 'date-fns';
import { es } from 'date-fns/locale';

import type { PeriodFilter } from '../types/finance';

export const today = () => new Date();
export const toDateKey = (date: Date) => format(date, 'yyyy-MM-dd');
export const humanDate = (iso: string) => format(parseISO(iso), 'd MMM yyyy', { locale: es });
export const daysUntil = (iso: string) => differenceInCalendarDays(parseISO(iso), today());

export const currentMonthPeriod = (): PeriodFilter => ({
  from: startOfMonth(today()),
  to: endOfMonth(today())
});

export const getPeriod = (key: string): PeriodFilter => {
  const now = today();
  if (key === 'previous') {
    const prev = subMonths(now, 1);
    return { from: startOfMonth(prev), to: endOfMonth(prev) };
  }
  if (key === '3m') return { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) };
  if (key === '6m') return { from: startOfMonth(subMonths(now, 5)), to: endOfMonth(now) };
  if (key === 'year') return { from: new Date(now.getFullYear(), 0, 1), to: new Date(now.getFullYear(), 11, 31) };
  return currentMonthPeriod();
};

export const inPeriod = (iso: string, period: PeriodFilter) =>
  isWithinInterval(parseISO(iso), { start: period.from, end: period.to });

export const nextDateFromDay = (day?: number) => {
  if (!day) return toDateKey(addDays(today(), 30));
  const now = today();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), Math.min(day, 28));
  const target = thisMonth < now ? new Date(now.getFullYear(), now.getMonth() + 1, Math.min(day, 28)) : thisMonth;
  return toDateKey(target);
};
