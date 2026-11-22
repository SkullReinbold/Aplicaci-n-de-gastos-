import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, SafeAreaView, Text, View } from 'react-native';
import type { User } from '@supabase/supabase-js';
import * as LocalAuth from 'expo-local-authentication';
import { supabase } from './src/supabase';
import { initDb } from './src/db';
import { askPermission } from './src/notifications';
import LoginScreen from './src/screens/LoginScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import BudgetScreen from './src/screens/BudgetScreen';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<'gastos' | 'presupuesto'>('gastos');
  const busy = useRef(false);

  useEffect(() => {
    initDb().then(askPermission);
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Huella/Face ID. Evita llamadas duplicadas (cada una cancelaba la anterior).
  const unlock = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const hasBio = (await LocalAuth.hasHardwareAsync()) && (await LocalAuth.isEnrolledAsync());
      if (!hasBio) { setUnlocked(true); return; }
      let r = await LocalAuth.authenticateAsync({ promptMessage: 'Desbloquea tus gastos', cancelLabel: 'Cancelar' });
      // Android a veces cancela el aviso al abrir la app: se reintenta una vez.
      if (!r.success && 'error' in r && (r.error === 'system_cancel' || r.error === 'app_cancel')) {
        await new Promise(res => setTimeout(res, 600));
        r = await LocalAuth.authenticateAsync({ promptMessage: 'Desbloquea tus gastos', cancelLabel: 'Cancelar' });
      }
      setUnlocked(r.success);
    } finally { busy.current = false; }
  }, []);

  const userId = user?.id ?? null;
  useEffect(() => {
    if (userId) unlock(); else setUnlocked(false);
  }, [userId, unlock]);

  if (!ready) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!user) return <SafeAreaView style={{ flex: 1 }}><LoginScreen /></SafeAreaView>;
  if (!unlocked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12 }}>
        <Text style={{ textAlign: 'center', fontSize: 18 }}>App bloqueada</Text>
        <Button title="Desbloquear" onPress={unlock} />
        <Button title="Cerrar sesión" color="crimson" onPress={() => supabase.auth.signOut()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 30 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button title="Gastos" onPress={() => setTab('gastos')} />
        <Button title="Presupuesto" onPress={() => setTab('presupuesto')} />
        <Button title="Salir" onPress={() => supabase.auth.signOut()} />
      </View>
      {tab === 'gastos' ? <ExpensesScreen /> : <BudgetScreen />}
    </SafeAreaView>
  );
}
