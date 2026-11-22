export interface Category { id: string; name: string }
export interface Expense {
  id: string; amount: number; description: string; note: string;
  categoryId: string; date: string; receiptUri: string | null; synced: number;
}
export interface Budget { id: string; categoryId: string | null; limitAmount: number; period: 'weekly' }
