import * as Notifications from 'expo-notifications';
import { getBudget, weeklyTotal } from './db';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function askPermission() { await Notifications.requestPermissionsAsync(); }

// Notificación local si el gasto semanal alcanza 80% del presupuesto.
export async function checkBudgetAlert() {
  const budget = await getBudget();
  if (!budget) return;
  const pct = (await weeklyTotal()) / budget.limitAmount;
  if (pct >= 0.8) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Alerta de presupuesto', body: `Has usado el ${Math.round(pct * 100)}% de tu presupuesto semanal.` },
      trigger: null,
    });
  }
}
