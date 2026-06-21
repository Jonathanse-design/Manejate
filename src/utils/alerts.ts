import { differenceInCalendarDays, parseISO } from 'date-fns';

import type { AppData, FinanceAlert } from '../types/finance';
import { activeData, cardUsage, emergencyFundStatus, financialHealth, totalsForPeriod, upcomingPayments } from './calculations';
import { currentMonthPeriod, today } from './dates';

export const buildAlerts = (data: AppData): FinanceAlert[] => {
  const active = activeData(data);
  const totals = totalsForPeriod(active.transactions, currentMonthPeriod());
  const health = financialHealth(totals.income, totals.expenses);
  const alerts: FinanceAlert[] = [];
  const now = new Date().toISOString();

  const push = (alert: Omit<FinanceAlert, 'id' | 'date'>) =>
    alerts.push({ ...alert, id: `${alert.level}-${alerts.length}`, date: now });

  if (!data.settings.lastBackupAt) {
    push({
      level: 'critical',
      title: 'Respaldo pendiente',
      message: 'Nunca has creado un respaldo. Tus datos viven solo en este dispositivo.',
      action: 'Exportar backup JSON'
    });
  } else {
    const days = differenceInCalendarDays(today(), parseISO(data.settings.lastBackupAt));
    if (days > 7) {
      push({
        level: 'warning',
        title: 'Respaldo atrasado',
        message: `Han pasado ${days} días desde tu último respaldo.`,
        action: 'Descargar respaldo actualizado'
      });
    }
  }

  if (health === 'critical') {
    push({
      level: 'critical',
      title: 'Flujo crítico',
      message: 'Estás gastando más de lo que ingresas este mes.',
      action: 'Revisar gastos variables'
    });
  }

  if (totals.income && totals.fixed / totals.income > 0.5) {
    push({
      level: 'warning',
      title: 'Gastos fijos altos',
      message: 'Tus gastos fijos superan el 50% de tus ingresos.',
      action: 'Auditar compromisos mensuales'
    });
  }

  if (totals.income && totals.savingsRate < 10) {
    push({
      level: 'info',
      title: 'Ahorro por debajo de meta',
      message: 'Tu ahorro está por debajo del 10% de tus ingresos.',
      action: 'Crear aporte automático'
    });
  }

  upcomingPayments(active.products).slice(0, 8).forEach((payment) => {
    const days = differenceInCalendarDays(parseISO(payment.date), today());
    if (days < 0) {
      push({
        level: 'critical',
        title: `${payment.type} vencido`,
        message: `${payment.title} tiene un pago vencido.`,
        action: 'Registrar pago',
        relatedId: payment.id
      });
    } else if (days <= 7) {
      push({
        level: days <= 3 ? 'critical' : 'warning',
        title: 'Pago próximo',
        message: `${payment.title} vence en ${days === 0 ? 'hoy' : `${days} días`}.`,
        action: 'Preparar pago',
        relatedId: payment.id
      });
    }
  });

  active.products
    .filter((product) => product.type === 'credit-card')
    .forEach((card) => {
      const closing = card.statementClosingDate;
      if (!closing) return;
      const days = differenceInCalendarDays(parseISO(closing), today());
      if (days >= 0 && days <= 3) {
        push({
          level: 'info',
          title: 'Corte de tarjeta próximo',
          message: `${card.name} corta ${days === 0 ? 'hoy' : `en ${days} días`}.`,
          action: 'Revisar consumos del ciclo',
          relatedId: card.id
        });
      }
    });

  cardUsage(active.products, active.cardConsumptions).forEach(({ card, usage }) => {
    if (usage >= 80) {
      push({
        level: 'warning',
        title: 'Tarjeta con alto uso',
        message: `${card.name} está usando ${Math.round(usage)}% del límite.`,
        action: 'Reducir consumos o pagar balance',
        relatedId: card.id
      });
    }
  });

  const fund = emergencyFundStatus(active.emergencyFund, totals.fixed);
  if (fund.status === 'crítico') {
    push({
      level: 'critical',
      title: 'Fondo de emergencia crítico',
      message: 'Tu fondo de emergencia cubre menos de 1 mes de gastos fijos.',
      action: 'Aumentar aporte al fondo'
    });
  } else if (fund.progress < 50) {
    push({
      level: 'warning',
      title: 'Fondo de emergencia bajo',
      message: 'Tu fondo de emergencia cubre menos del 50% de la meta.',
      action: 'Revisar meta mensual'
    });
  }

  if (!active.transactions.length) {
    push({
      level: 'info',
      title: 'Empieza registrando datos',
      message: 'Agrega ingresos, gastos, tarjetas y metas para activar el análisis.',
      action: 'Agregar movimiento'
    });
  }

  return alerts;
};
