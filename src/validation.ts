import { z } from 'zod';

export const expenseSchema = z.object({
  amount: z.number({ invalid_type_error: 'Monto inválido' }).positive('El monto debe ser mayor a 0').max(1_000_000),
  description: z.string().trim().min(1, 'Descripción requerida').max(80),
  note: z.string().trim().max(300).default(''),
  categoryId: z.string().min(1, 'Elige una categoría'),
});
export const credentialsSchema = z.object({
  email: z.string().trim().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
export const budgetSchema = z.object({ limitAmount: z.number({ invalid_type_error: 'Límite inválido' }).positive('Límite inválido') });
