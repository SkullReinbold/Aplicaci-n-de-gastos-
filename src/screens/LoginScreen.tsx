import React, { useState } from 'react';
import { ActivityIndicator, Button, Text, TextInput, View } from 'react-native';
import { supabase } from '../supabase';
import { credentialsSchema } from '../validation';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (register: boolean) => {
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setLoading(true); setError('');
    try {
      const { email: e, password: p } = parsed.data;
      const { error: err } = register
        ? await supabase.auth.signUp({ email: e, password: p })
        : await supabase.auth.signInWithPassword({ email: e, password: p });
      if (err) setError(register ? 'No se pudo crear la cuenta.' : 'Correo o contraseña incorrectos.');
      else if (register) setError('Cuenta creada. Si activaste confirmación por correo, revisa tu bandeja.');
    } catch { setError('Error de red. Intenta de nuevo.'); }
    finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 26, fontWeight: '700' }}>Gastos Personales</Text>
      <TextInput placeholder="Correo" autoCapitalize="none" keyboardType="email-address"
        value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} />
      <TextInput placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }} />
      {!!error && <Text style={{ color: 'crimson' }}>{error}</Text>}
      {loading ? <ActivityIndicator /> : (<>
        <Button title="Iniciar sesión" onPress={() => submit(false)} />
        <Button title="Crear cuenta" onPress={() => submit(true)} />
      </>)}
    </View>
  );
}
