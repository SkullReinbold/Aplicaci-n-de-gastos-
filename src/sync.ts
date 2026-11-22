import { supabase } from './supabase';
import { listExpenses, markSynced } from './db';

// Sube los gastos pendientes con upsert. Notas y fotos NO se suben.
// user_id lo asigna la base (default auth.uid()) y RLS impide tocar datos ajenos.
export async function syncExpenses(): Promise<number> {
  const pending = (await listExpenses()).filter(e => !e.synced);
  if (pending.length === 0) return 0;
  const rows = pending.map(e => ({
    id: e.id, amount: e.amount, description: e.description, category_id: e.categoryId, date: e.date,
  }));
  const { error } = await supabase.from('expenses').upsert(rows);
  if (error) throw new Error(error.message);
  for (const e of pending) await markSynced(e.id);
  return pending.length;
}

export async function removeRemote(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
