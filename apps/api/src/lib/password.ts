import bcrypt from 'bcryptjs';

export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, 10);

export const verifyPassword = (hash: string, plain: string): Promise<boolean> =>
  bcrypt.compare(plain, hash).catch(() => false);
