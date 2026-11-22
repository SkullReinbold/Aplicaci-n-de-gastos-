import React, { useEffect, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { getBudget, saveBudget, weeklyTotal } from '../db';
import { budgetSchema } from '../validation';
import { checkBudgetAlert } from '../notifications';

export default function BudgetScreen() {
  const [limit, setLimit] = useState(''); const [spent, setSpent] = useState(0); const [error, setError] = useState('');
  const load = async () => { const b = await getBudget(); if (b) setLimit(String(b.limitAmount)); setSpent(await weeklyTotal()); };
  useEffect(() => { load(); }, []);
  const save = async () => {
    const p = budgetSchema.safeParse({ limitAmount: parseFloat(limit) });
    if (!p.success) return setError(p.error.issues[0].message);
    setError(''); await saveBudget(p.data.limitAmount); await load(); await checkBudgetAlert();
  };
  const pct = limit ? Math.min(100, Math.round((spent / parseFloat(limit)) * 100)) : 0;
  return (
    <View style={{ padding: 16, gap: 10 }}>
      <Text style={{ fontSize: 18 }}>Presupuesto semanal</Text>
      <TextInput placeholder="Límite" keyboardType="decimal-pad" value={limit} onChangeText={setLimit} style={{ borderWidth: 1, padding: 8 }} />
      {!!error && <Text style={{ color: 'crimson' }}>{error}</Text>}
      <Button title="Guardar" onPress={save} />
      <Text>Gastado esta semana: ${spent.toFixed(2)} ({pct}%)</Text>
      <View style={{ height: 14, backgroundColor: '#ddd', borderRadius: 7 }}>
        <View style={{ height: 14, width: `${pct}%`, backgroundColor: pct >= 80 ? 'crimson' : 'seagreen', borderRadius: 7 }} />
      </View>
    </View>
  );
}
