import { z } from 'zod';

export const usernameSchema = z
  .string()
  .min(3, 'Минимум 3 символа')
  .max(24, 'Максимум 24 символа')
  .regex(/^[a-zA-Z0-9_]+$/, 'Только латиница, цифры и _');

export const passwordSchema = z
  .string()
  .min(8, 'Минимум 8 символов')
  .max(72, 'Максимум 72 символа');

export const registerSchema = z.object({
  username: usernameSchema,
  email: z.string().email('Некорректный email'),
  password: passwordSchema,
  displayName: z.string().min(1, 'Укажите имя').max(50),
});

export const loginSchema = z.object({
  login: z.string().min(1, 'Укажите username или email'),
  password: z.string().min(1, 'Введите пароль'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
