import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { Category, Expense } from '../types';
import { createExpense, deleteExpense, getCategories, listExpenses, updateExpense } from '../db';
import { expenseSchema } from '../validation';
import { checkBudgetAlert } from '../notifications';
import { removeRemote, syncExpenses } from '../sync';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export default function ExpensesScreen() {
  const [items, setItems] = useState<Expense[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [amount, setAmount] = useState(''); const [desc, setDesc] = useState('');
  const [note, setNote] = useState(''); const [catId, setCatId] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setItems(await listExpenses()); setCats(await getCategories()); }
    catch { setError('Error al leer datos locales'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  // Si Android cerró la app mientras la cámara estaba abierta, recupera la foto al volver.
  useEffect(() => {
    (async () => {
      try {
        const res: any = await ImagePicker.getPendingResultAsync();
        const first = Array.isArray(res) ? res[0] : res;
        if (first?.assets?.length) setPhoto(first.assets[0].uri);
      } catch {}
    })();
  }, []);

  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setError('Permiso de cámara denegado. Actívalo en Ajustes > Apps > Gastos Personales > Permisos.');
        return;
      }
      const r = await ImagePicker.launchCameraAsync({ quality: 0.5 });
      if (!r.canceled) { setPhoto(r.assets[0].uri); setError(''); }
    } catch (e: any) {
      setError('Cámara: ' + (e?.message ?? 'error desconocido'));
    }
  };

  const save = async () => {
    const parsed = expenseSchema.safeParse({ amount: parseFloat(amount), description: desc, note, categoryId: catId });
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setError('');
    if (editing) await updateExpense(editing, parsed.data);
    else await createExpense({ ...parsed.data, receiptUri: photo });
    setEditing(null); setAmount(''); setDesc(''); setNote(''); setPhoto(null);
    await load(); await checkBudgetAlert();
  };

  const edit = (e: Expense) => { setEditing(e.id); setAmount(String(e.amount)); setDesc(e.description); setNote(e.note); setCatId(e.categoryId); };
  const remove = async (id: string) => { await deleteExpense(id); try { await removeRemote(id); } catch {} load(); };
  const sync = async () => {
    setLoading(true); setError('');
    try { Alert.alert('Sincronizado', `${await syncExpenses()} gasto(s) subidos`); }
    catch (e: any) { setError('Falló la sincronización: ' + (e?.message ?? 'error desconocido')); }
    await load();
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 8 }}>
      <TextInput placeholder="Monto" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} style={{ borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="Descripción" value={desc} onChangeText={setDesc} style={{ borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="Nota privada (se guarda cifrada)" value={note} onChangeText={setNote} style={{ borderWidth: 1, padding: 8 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {cats.map(c => (
          <TouchableOpacity key={c.id} onPress={() => setCatId(c.id)}
            style={{ padding: 6, borderWidth: 1, borderRadius: 12, backgroundColor: catId === c.id ? '#cde' : 'white' }}>
            <Text>{c.name}</Text>
          </TouchableOpacity>))}
      </View>
      {photo && <View><Image source={{ uri: photo }} style={{ height: 80, width: 80 }} /><Text>Ticket listo: pulsa Agregar</Text></View>}
      {!!error && <Text style={{ color: 'crimson' }}>{error}</Text>}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title={editing ? 'Actualizar' : 'Agregar'} onPress={save} />
        <Button title="Foto ticket" onPress={takePhoto} />
        <Button title="Sync" onPress={sync} />
      </View>
      {loading ? <ActivityIndicator /> : (
        <FlatList data={items} keyExtractor={i => i.id} ListEmptyComponent={<Text>Sin gastos aún</Text>}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: 8, borderBottomWidth: 0.5 }}>
              <Text style={{ fontWeight: '600' }}>{item.description} — {money.format(item.amount)}</Text>
              {item.receiptUri && <Image source={{ uri: item.receiptUri }} style={{ height: 40, width: 40, marginVertical: 4 }} />}
              <Text>{cats.find(c => c.id === item.categoryId)?.name} · {format(new Date(item.date), 'dd/MM/yyyy')} · {item.synced ? '☁️' : '⏳'}</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Text onPress={() => edit(item)} style={{ color: 'blue' }}>Editar</Text>
                <Text onPress={() => remove(item.id)} style={{ color: 'crimson' }}>Eliminar</Text>
              </View>
            </View>)} />)}
    </View>
  );
}
