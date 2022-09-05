import crypto from 'crypto';

export const randomInteger = (min: number, max: number) => {
  const rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.abs(Math.round(rand));
};

export const generateCryptoId = () => {
  return crypto.randomBytes(16).toString('hex');
};
