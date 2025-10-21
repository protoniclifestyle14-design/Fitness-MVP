import bcrypt from 'bcrypt';

const ROUNDS = 12;

export const hashPassword = async (plain: string) => {
  const salt = await bcrypt.genSalt(ROUNDS);
  return bcrypt.hash(plain, salt);
};

export const comparePassword = (plain: string, hash: string) =>
  bcrypt.compare(plain, hash);